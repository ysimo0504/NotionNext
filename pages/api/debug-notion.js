import { fetchNotionPageBlocks } from '@/lib/db/notion/getPostBlocks'
import { normalizeNotionMetadata } from '@/lib/db/notion/normalizeUtil'
import notionAPI from '@/lib/db/notion/getNotionAPI'
import { idToUuid } from 'notion-utils'
import BLOG from '@/blog.config'

export default async function handler(req, res) {
  try {
    const pageId = BLOG.NOTION_PAGE_ID
    const uuid = idToUuid(pageId)
    const recordMap = await fetchNotionPageBlocks(pageId, 'debug')

    const block = recordMap?.block || {}
    const rawMetadata = normalizeNotionMetadata(block, uuid)
    const collectionId = rawMetadata?.collection_id
    const collectionQuery = recordMap?.collection_query || {}
    const collectionView = recordMap?.collection_view || {}
    const viewIds = rawMetadata?.view_ids || []

    const cqKeys = Object.keys(collectionQuery)

    // Try to directly call queryCollection for the first view
    let directCallResult = null
    let directCallError = null
    if (viewIds.length > 0) {
      const viewId = viewIds[0]
      const cvValue = collectionView[viewId]?.value || collectionView[viewId]
      try {
        const result = await notionAPI.__call('getCollectionData',
          collectionId,
          viewId,
          cvValue,
          { limit: 10 }
        )
        directCallResult = {
          resultKeys: result?.result ? Object.keys(result.result) : null,
          reducerResultsKeys: result?.result?.reducerResults ? Object.keys(result.result.reducerResults) : null,
          firstReducerValue: result?.result?.reducerResults
            ? Object.values(result.result.reducerResults)[0]
            : null,
          recordMapBlockCount: Object.keys(result?.recordMap?.block || {}).length
        }
      } catch (e) {
        directCallError = e.message + ' | ' + (e.data ? JSON.stringify(e.data).substring(0, 200) : '')
      }
    }

    res.setHeader('Content-Type', 'application/json')
    res.json({
      pageId,
      uuid,
      collectionId,
      viewIds,
      cqKeys,
      cqIsEmpty: cqKeys.length === 0,
      directCallResult,
      directCallError,
      rawMetadataType: rawMetadata?.type,
    })
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack?.substring(0, 500) })
  }
}
