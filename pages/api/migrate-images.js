import BLOG from '@/blog.config'
import crypto from 'crypto'
import { fetchGlobalAllData, getPostBlocks } from '@/lib/db/SiteDataApi'

let S3Client, PutObjectCommand, HeadObjectCommand, requestFn, mimeMod, pLimit

try {
  // eslint-disable-next-line
  const s3Mod = eval("require('@aws-sdk/client-s3')")
  S3Client = s3Mod.S3Client
  PutObjectCommand = s3Mod.PutObjectCommand
  HeadObjectCommand = s3Mod.HeadObjectCommand
} catch {}
try {
  requestFn = eval("require('undici')").request
} catch {} // eslint-disable-line
try {
  mimeMod = eval("require('mime')")
} catch {} // eslint-disable-line
try {
  pLimit = eval("require('p-limit')")
} catch {} // eslint-disable-line

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

const EXTERNAL_PATTERNS = [
  /https?:\/\/(?:www\.)?notion\.so\/(?:image|signed)\/[^\s")>'\]]+/gi,
  /https?:\/\/(?:secure\.notion-static\.com|prod-files-secure\.[^\s/]+\.amazonaws\.com)\/[^\s")>'\]]+/gi,
  /https?:\/\/(?:images|source)\.unsplash\.com\/[^\s")>'\]]+/gi,
  /https?:\/\/[a-z0-9.-]+\.(?:githubusercontent|googleusercontent)\.com\/[^\s")>'\]]+/gi,
  /https?:\/\/(?:gravatar\.com|p1\.qhimg\.com|webmention\.io|ko-fi\.com)\/[^\s")>'\]]+/gi,
  /attachment:[^\s")>'\]]+/gi
]

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

async function migrateUrl(s3, u) {
  const { buf, ct } = await fetchBuffer(u)
  const key = keyFor(ct, buf)
  if (!(await headExists(s3, key))) {
    await putObject(s3, key, buf, ct)
  }
  return `${R2_PUBLIC_BASE}/${key}`
}

async function getRecentPostBlockMaps(limit = 30) {
  const from = 'api-migrate-images'
  const props = await fetchGlobalAllData({ from })
  const posts = (props?.allPages || [])
    .filter(p => p.type === 'Post' && p.status === 'Published')
    .sort(
      (a, b) =>
        new Date(b?.publishDate || b?.date) -
        new Date(a?.publishDate || a?.date)
    )
    .slice(0, limit)

  const result = []
  for (const post of posts) {
    try {
      const blockMap = await getPostBlocks(post.id, from)
      if (blockMap) {
        result.push({ id: post.id, blockMap })
      }
    } catch (err) {
      console.error('getPostBlocks error:', post?.id, err)
    }
  }
  return result
}

// 深度遍历对象，提取匹配的 URL 字符串
function collectUrlsFromObject(obj, patterns) {
  const urls = new Set()
  const walk = value => {
    if (!value) return
    if (typeof value === 'string') {
      for (const pattern of patterns) {
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

export default async function handler(req, res) {
  const s3 = getS3()
  if (!s3) {
    return res.status(501).json({ ok: false, error: 'R2 not configured' })
  }
  try {
    const requiredKey = process.env.MIGRATE_CRON_KEY
    if (requiredKey) {
      const hdrAuth = (req.headers['authorization'] || '').toString()
      const hdrXAuth = (req.headers['x-authorization'] || '').toString()
      const queryKey = (req.query.key || '').toString()
      const bearer = 'Bearer '
      const tokenFromHeader = hdrAuth.startsWith(bearer)
        ? hdrAuth.substring(bearer.length)
        : hdrAuth
      const tokenFromXHeader = hdrXAuth.startsWith(bearer)
        ? hdrXAuth.substring(bearer.length)
        : hdrXAuth
      const provided = tokenFromHeader || tokenFromXHeader || queryKey
      if (provided !== requiredKey) {
        return res.status(401).json({ ok: false, error: 'Unauthorized' })
      }
    }
    const limit = Number(req.query.limit || process.env.MIGRATE_MAX_POSTS || 30)
    const postBlockMaps = await getRecentPostBlockMaps(limit)

    // 直接在每篇文章的 blockMap 中替换为 R2 链接
    const migrated = []
    for (const { blockMap } of postBlockMaps) {
      const block = blockMap?.block || {}
      // 收集链接
      const urls = new Set()
      Object.values(block).forEach(b => {
        const v = b?.value
        if (!v) return
        const collected = collectUrlsFromObject(v, EXTERNAL_PATTERNS)
        collected.forEach(u => urls.add(normalizeSource(u, 'block', v?.id)))
      })

      const limiter = pLimit ? pLimit(5) : fn => fn()
      const mapOldToNew = new Map()
      await Promise.all(
        Array.from(urls).map(u =>
          limiter(async () => {
            try {
              const n = await migrateUrl(s3, u)
              mapOldToNew.set(u, n)
            } catch (e) {
              console.error('migrate failed:', u, e?.message || e)
            }
          })
        )
      )

      // 替换 blockMap 中出现的链接（仅替换 properties.source 等典型字段）
      Object.values(block).forEach(b => {
        const v = b?.value
        const src = v?.properties?.source?.[0]?.[0]
        if (!src) return
        for (const [oldU, newU] of mapOldToNew.entries()) {
          if (src.includes(oldU)) {
            v.properties.source[0][0] = src.replace(oldU, newU)
            migrated.push({ id: v?.id, old: oldU, new: newU })
            break
          }
        }
      })
    }

    res.status(200).json({
      ok: true,
      total: migrated.length,
      migrated
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: err.message })
  }
}
