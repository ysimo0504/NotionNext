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
  const res = await request(url, { maxRedirections: 3 })
  if (res.statusCode >= 400) throw new Error(`HTTP ${res.statusCode}`)
  const buf = Buffer.from(await res.body.arrayBuffer())
  const ct = res.headers['content-type'] || 'application/octet-stream'
  return { buf, ct }
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
  const { buf, ct } = await fetchBuffer(normalized)
  const key = keyFor(ct, buf)
  if (!(await headExists(key))) {
    await putObject(key, buf, ct)
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
