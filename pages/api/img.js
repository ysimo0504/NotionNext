import BLOG from '@/blog.config'
import crypto from 'crypto'

let S3Client, PutObjectCommand, HeadObjectCommand, requestFn, mimeMod, sharpMod

try {
  // eslint-disable-next-line
  const s3Mod = eval("require('@aws-sdk/client-s3')")
  S3Client = s3Mod.S3Client
  PutObjectCommand = s3Mod.PutObjectCommand
  HeadObjectCommand = s3Mod.HeadObjectCommand
} catch {}

try {
  // eslint-disable-next-line
  requestFn = eval("require('undici')").request
} catch {}

try {
  // eslint-disable-next-line
  mimeMod = eval("require('mime')")
} catch {}

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_PUBLIC_BASE
} = process.env

function getS3() {
  if (!S3Client || !R2_ACCOUNT_ID) return null
  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY
    },
    forcePathStyle: true
  })
}

function keyFor(contentType, buf) {
  const ext = mimeMod?.getExtension?.(contentType) || 'bin'
  const hash = crypto.createHash('sha1').update(buf).digest('hex')
  return `assets/${hash}.${ext}`
}

async function headExists(s3, key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }))
    return true
  } catch {
    return false
  }
}

async function putObject(s3, key, buf, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buf,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable'
    })
  )
}

async function fetchBuffer(url) {
  if (requestFn) {
    const res = await requestFn(url, { maxRedirections: 3 })
    if (res.statusCode >= 400) throw new Error(`HTTP ${res.statusCode}`)
    const buf = Buffer.from(await res.body.arrayBuffer())
    const ct = res.headers['content-type'] || 'application/octet-stream'
    return { buf, ct }
  }
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const ct = res.headers.get('content-type') || 'application/octet-stream'
  return { buf, ct }
}

const MAX_WIDTH = parseInt(process.env.R2_IMAGE_MAX_WIDTH || '2000', 10)
const MAX_HEIGHT = parseInt(process.env.R2_IMAGE_MAX_HEIGHT || '2000', 10)
const WEBP_QUALITY = parseInt(process.env.R2_IMAGE_WEBP_QUALITY || '82', 10)
const TARGET_FORMAT = (process.env.R2_IMAGE_FORMAT || 'webp').toLowerCase()

async function compressIfNeeded(buf, ct) {
  try {
    // eslint-disable-next-line
    if (!sharpMod) sharpMod = eval("require('sharp')")
  } catch {
    return { buf, ct }
  }
  try {
    if (!ct || !buf) return { buf, ct }
    if (ct.includes('svg') || ct.includes('gif')) return { buf, ct }
    const img = sharpMod(buf, { animated: false })
    const meta = await img.metadata()
    if (!meta) return { buf, ct }
    const width = meta.width || MAX_WIDTH
    const height = meta.height || MAX_HEIGHT
    const needResize = width > MAX_WIDTH || height > MAX_HEIGHT
    let pipeline = sharpMod(buf, { animated: false }).rotate()
    if (needResize) {
      pipeline = pipeline.resize({
        width: Math.min(width, MAX_WIDTH),
        height: Math.min(height, MAX_HEIGHT),
        fit: 'inside',
        withoutEnlargement: true
      })
    }
    if (TARGET_FORMAT === 'webp') {
      pipeline = pipeline.webp({ quality: WEBP_QUALITY })
      const out = await pipeline.toBuffer()
      return { buf: out, ct: 'image/webp' }
    }
    if (ct.includes('jpeg') || ct.includes('jpg')) {
      pipeline = pipeline.jpeg({ quality: WEBP_QUALITY })
    } else if (ct.includes('png')) {
      pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true })
    } else if (ct.includes('webp')) {
      pipeline = pipeline.webp({ quality: WEBP_QUALITY })
    }
    const out = await pipeline.toBuffer()
    return { buf: out, ct }
  } catch {
    return { buf, ct }
  }
}

function normalizeSource(src, table, id) {
  if (!src) return src
  if (src.startsWith('attachment:')) {
    const base = `${BLOG.NOTION_HOST}/image/` + encodeURIComponent(src)
    const search = new URLSearchParams()
    if (table) search.set('table', table)
    if (id) search.set('id', id)
    return `${base}?${search.toString()}`
  }
  try {
    const u = new URL(src)
    if (
      u.hostname.includes('amazonaws.com') ||
      u.hostname === 'secure.notion-static.com'
    ) {
      const base = `${BLOG.NOTION_HOST}/image/` + encodeURIComponent(src)
      const search = new URLSearchParams()
      if (table) search.set('table', table)
      if (id) search.set('id', id)
      return `${base}?${search.toString()}`
    }
  } catch {}
  return src
}

export default async function handler(req, res) {
  const s3 = getS3()
  if (!s3) {
    return res.status(501).json({ ok: false, error: 'R2 not configured' })
  }
  try {
    const src = req.query.src
    const table = req.query.table
    const id = req.query.id
    if (!src) return res.status(400).json({ ok: false, error: 'src required' })
    const normalized = normalizeSource(src, table, id)
    const fetched = await fetchBuffer(normalized)
    const compressed = await compressIfNeeded(fetched.buf, fetched.ct)
    const key = keyFor(compressed.ct, compressed.buf)
    if (!(await headExists(s3, key))) {
      await putObject(s3, key, compressed.buf, compressed.ct)
    }
    const target = `${R2_PUBLIC_BASE}/${key}`
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.writeHead(302, { Location: target })
    res.end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: err.message })
  }
}
