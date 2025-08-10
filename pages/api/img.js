import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand
} from '@aws-sdk/client-s3'
import { request } from 'undici'
import crypto from 'crypto'
import mime from 'mime'

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
  const res = await request(url)
  if (res.statusCode >= 400) throw new Error(`HTTP ${res.statusCode}`)
  const buf = Buffer.from(await res.body.arrayBuffer())
  const ct = res.headers['content-type'] || 'application/octet-stream'
  return { buf, ct }
}

export default async function handler(req, res) {
  try {
    const src = req.query.src
    if (!src) return res.status(400).json({ ok: false, error: 'src required' })
    const { buf, ct } = await fetchBuffer(src)
    const key = keyFor(ct, buf)
    if (!(await headExists(key))) {
      await putObject(key, buf, ct)
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
