import { normalizeNotionMetadata } from '@/lib/db/notion/normalizeUtil'
import notionAPI from '@/lib/db/notion/getNotionAPI'
import { getSiteDataByPageId } from '@/lib/db/SiteDataApi'
import { idToUuid } from 'notion-utils'
import BLOG from '@/blog.config'

export default async function handler(req, res) {
  try {
    const pageId = BLOG.NOTION_PAGE_ID
    const uuid = idToUuid(pageId)

    // Test getPage directly (no cache)
    const recordMap = await notionAPI.getPage(pageId)
    const block = recordMap?.block || {}
    const rawMetadata = normalizeNotionMetadata(block, uuid)
    const collectionId = rawMetadata?.collection_id
    const collectionQuery = recordMap?.collection_query || {}
    const collectionView = recordMap?.collection_view || {}
    const viewIds = rawMetadata?.view_ids || []

    const cqKeys = Object.keys(collectionQuery)
    const cqCollectionKeys =
      cqKeys.length > 0 ? Object.keys(collectionQuery[cqKeys[0]] || {}) : []

    // Test direct getCollectionData call
    let directCallResult = null
    let directCallError = null
    if (viewIds.length > 0) {
      const viewId = viewIds[0]
      const cvValue = collectionView[viewId]?.value || collectionView[viewId]
      try {
        const result = await notionAPI.__call(
          'getCollectionData',
          collectionId,
          viewId,
          cvValue,
          { limit: 10 }
        )
        directCallResult = {
          reducerResultsKeys: result?.result?.reducerResults
            ? Object.keys(result.result.reducerResults)
            : null,
          firstReducerValue: result?.result?.reducerResults
            ? Object.values(result.result.reducerResults)[0]
            : null,
          recordMapBlockCount: Object.keys(result?.recordMap?.block || {}).length
        }
      } catch (e) {
        directCallError =
          e.message +
          ' | ' +
          (e.data ? JSON.stringify(e.data).substring(0, 200) : '')
      }
    }

    // Test full site data pipeline (includes fallback fix)
    let siteDataTest = null
    let siteDataError = null
    try {
      const siteData = await getSiteDataByPageId({ pageId, from: 'debug' })
      siteDataTest = {
        postCount: siteData?.allPages?.length ?? 0,
        allNavPagesCount: siteData?.allNavPages?.length ?? 0,
        siteInfoTitle: siteData?.siteInfo?.title
      }
    } catch (e) {
      siteDataError = e.message
    }

    // Force ISR revalidation for key pages
    const revalidated = []
    const revalidateErrors = []
    for (const path of ['/apps', '/templates', '/archive', '/']) {
      try {
        await res.revalidate(path)
        revalidated.push(path)
      } catch (e) {
        revalidateErrors.push({ path, error: e.message })
      }
    }

    res.setHeader('Content-Type', 'application/json')
    res.json({
      pageId,
      uuid,
      collectionId,
      viewIds,
      cqKeys,
      cqCollectionKeys,
      cqIsEmpty: cqKeys.length === 0,
      directCallResult,
      directCallError,
      siteDataTest,
      siteDataError,
      revalidated,
      revalidateErrors,
      rawMetadataType: rawMetadata?.type
    })
  } catch (e) {
    res
      .status(500)
      .json({ error: e.message, stack: e.stack?.substring(0, 500) })
  }
}
