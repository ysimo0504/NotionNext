import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand
} from '@aws-sdk/client-s3'
import { request } from 'undici'
import crypto from 'crypto'
import mime from 'mime'
import BLOG from '@/blog.config'
import pLimit from 'p-limit'
import sharp from 'sharp'

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_PUBLIC_BASE
} = process.env

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY
  },
  forcePathStyle: true
})

// 压缩配置，可通过环境变量覆盖
const MAX_WIDTH = parseInt(process.env.R2_IMAGE_MAX_WIDTH || '2000', 10)
const MAX_HEIGHT = parseInt(process.env.R2_IMAGE_MAX_HEIGHT || '2000', 10)
const WEBP_QUALITY = parseInt(process.env.R2_IMAGE_WEBP_QUALITY || '82', 10)
const TARGET_FORMAT = (process.env.R2_IMAGE_FORMAT || 'webp').toLowerCase() // 'webp' | 'original'

function keyFor(contentType, buf) {
  const ext = mime.getExtension(contentType) || 'bin'
  const hash = crypto.createHash('sha1').update(buf).digest('hex')
  return `assets/${hash}.${ext}`
}

async function headExists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }))
    return true
  } catch {
    return false
  }
}

async function putObject(key, buf, contentType) {
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
  const res = await request(url, { maxRedirections: 3 })
  if (res.statusCode >= 400) throw new Error(`HTTP ${res.statusCode}`)
  const buf = Buffer.from(await res.body.arrayBuffer())
  const ct = res.headers['content-type'] || 'application/octet-stream'
  return { buf, ct }
}

async function compressIfNeeded(buf, ct) {
  try {
    if (!ct || !buf) return { buf, ct }
    if (ct.includes('svg') || ct.includes('gif')) return { buf, ct }

    const img = sharp(buf, { animated: false })
    const meta = await img.metadata()
    if (!meta || (!meta.width && !meta.height)) return { buf, ct }

    const width = meta.width || MAX_WIDTH
    const height = meta.height || MAX_HEIGHT
    const needResize = width > MAX_WIDTH || height > MAX_HEIGHT

    // 统一转为 webp 以获得更好的体积；可通过 env 关闭
    const toWebp = TARGET_FORMAT === 'webp'
    let pipeline = sharp(buf, { animated: false }).rotate()
    if (needResize) {
      pipeline = pipeline.resize({
        width: Math.min(width, MAX_WIDTH),
        height: Math.min(height, MAX_HEIGHT),
        fit: 'inside',
        withoutEnlargement: true
      })
    }
    if (toWebp) {
      pipeline = pipeline.webp({ quality: WEBP_QUALITY })
      const out = await pipeline.toBuffer()
      return { buf: out, ct: 'image/webp' }
    } else {
      // 保持原格式压缩
      if (ct.includes('jpeg') || ct.includes('jpg')) {
        pipeline = pipeline.jpeg({ quality: WEBP_QUALITY })
      } else if (ct.includes('png')) {
        pipeline = pipeline.png({
          compressionLevel: 9,
          adaptiveFiltering: true
        })
      } else if (ct.includes('webp')) {
        pipeline = pipeline.webp({ quality: WEBP_QUALITY })
      }
      const out = await pipeline.toBuffer()
      return { buf: out, ct }
    }
  } catch (e) {
    // 压缩失败则回退原图
    return { buf, ct }
  }
}

function normalizeSource(src, table = 'block', id) {
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

export async function migrateSingleUrlToR2(src, table = 'block', id) {
  const normalized = normalizeSource(src, table, id)
  const fetched = await fetchBuffer(normalized)
  const compressed = await compressIfNeeded(fetched.buf, fetched.ct)
  const key = keyFor(compressed.ct, compressed.buf)
  if (!(await headExists(key))) {
    await putObject(key, compressed.buf, compressed.ct)
  }
  return `${R2_PUBLIC_BASE}/${key}`
}

const EXTERNAL_PATTERNS = [
  /https?:\/\/(?:www\.)?notion\.so\/(?:image|signed)\/[^\s")>'\]]+/gi,
  /https?:\/\/(?:secure\.notion-static\.com|prod-files-secure\.[^\s/]+\.amazonaws\.com)\/[^\s")>'\]]+/gi,
  /https?:\/\/images\.unsplash\.com\/[^\s")>'\]]+/gi,
  /https?:\/\/[a-z0-9.-]+\.(?:githubusercontent|googleusercontent)\.com\/[^\s")>'\]]+/gi,
  /attachment:[^\s")>'\]]+/gi
]

function collectUrlsFromObject(obj) {
  const urls = new Set()
  const walk = value => {
    if (!value) return
    if (typeof value === 'string') {
      for (const pattern of EXTERNAL_PATTERNS) {
        const matches = value.match(pattern) || []
        matches.forEach(m => urls.add(m))
      }
      return
    }
    if (Array.isArray(value)) {
      value.forEach(walk)
      return
    }
    if (typeof value === 'object') {
      Object.values(value).forEach(walk)
    }
  }
  walk(obj)
  return urls
}

export async function replaceBlockMapImagesWithR2(blockMap, concurrency = 3) {
  if (!blockMap?.block) return
  const block = blockMap.block
  const limit = pLimit(concurrency)
  const tasks = []

  for (const b of Object.values(block)) {
    const v = b?.value
    if (!v) continue
    const urls = collectUrlsFromObject(v)
    for (const u of urls) {
      tasks.push(
        limit(async () => {
          try {
            const r2 = await migrateSingleUrlToR2(u, 'block', v?.id)
            // 将原始 url 在该 block 的字符串里替换为 r2
            // 简单字符串替换：仅替换 properties.source 等字段中的出现位置
            if (v?.properties?.source?.[0]?.[0]) {
              const old = v.properties.source[0][0]
              if (old && old.includes(u)) {
                v.properties.source[0][0] = old.replace(u, r2)
              }
            }
            // 如果是封面字段
            if (v?.format?.page_cover) {
              const cover = v.format.page_cover
              if (typeof cover === 'string' && cover.includes(u)) {
                v.format.page_cover = cover.replace(u, r2)
              }
            }
          } catch (e) {
            // ignore 单个失败
          }
        })
      )
    }
  }

  await Promise.all(tasks)
}
