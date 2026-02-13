import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { extractLangId, extractLangPrefix } from '@/lib/utils/pageId'
import { getServerSideSitemap } from 'next-sitemap'

export const getServerSideProps = async ctx => {
  let fields = []
  const siteIds = BLOG.NOTION_PAGE_ID.split(',')

  for (let index = 0; index < siteIds.length; index++) {
    const siteId = siteIds[index]
    const id = extractLangId(siteId)
    const locale = extractLangPrefix(siteId)
    const siteData = await fetchGlobalAllData({
      pageId: id,
      from: 'sitemap.xml'
    })
    const link = siteConfig(
      'LINK',
      siteData?.siteInfo?.link,
      siteData.NOTION_CONFIG
    )
    const localeFields = generateLocalesSitemap(link, siteData.allPages, locale)
    fields = fields.concat(localeFields)
  }

  fields = getUniqueFields(fields)

  ctx.res.setHeader(
    'Cache-Control',
    'public, s-maxage=86400, stale-while-revalidate=43200'
  )
  return getServerSideSitemap(ctx, fields)
}

function generateLocalesSitemap(link, allPages, locale) {
  if (link && link.endsWith('/')) {
    link = link.slice(0, -1)
  }
  if (locale && locale.length > 0 && locale.indexOf('/') !== 0) {
    locale = '/' + locale
  }
  const dateNow = new Date().toISOString().split('T')[0]
  const defaultFields = [
    {
      loc: `${link}${locale}`,
      lastmod: dateNow,
      changefreq: 'weekly',
      priority: '1.0'
    },
    {
      loc: `${link}${locale}/archive`,
      lastmod: dateNow,
      changefreq: 'weekly',
      priority: '0.6'
    },
    {
      loc: `${link}${locale}/category`,
      lastmod: dateNow,
      changefreq: 'weekly',
      priority: '0.6'
    },
    {
      loc: `${link}${locale}/search`,
      lastmod: dateNow,
      changefreq: 'weekly',
      priority: '0.5'
    },
    {
      loc: `${link}${locale}/tag`,
      lastmod: dateNow,
      changefreq: 'weekly',
      priority: '0.6'
    }
  ]
  const postFields =
    allPages
      ?.filter(p => p.status === BLOG.NOTION_PROPERTY_NAME.status_publish)
      ?.map(post => {
        const slugWithoutLeadingSlash = post?.slug?.startsWith('/')
          ? post?.slug?.slice(1)
          : post.slug
        return {
          loc: `${link}${locale}/${slugWithoutLeadingSlash}`,
          lastmod: new Date(post?.publishDay).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: '0.8'
        }
      }) ?? []

  return defaultFields.concat(postFields)
}

function getUniqueFields(fields) {
  const uniqueFieldsMap = new Map()
  fields.forEach(field => {
    const existingField = uniqueFieldsMap.get(field.loc)
    if (
      !existingField ||
      new Date(field.lastmod) > new Date(existingField.lastmod)
    ) {
      uniqueFieldsMap.set(field.loc, field)
    }
  })
  return Array.from(uniqueFieldsMap.values())
}

export default () => {}
