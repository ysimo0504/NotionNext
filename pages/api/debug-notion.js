import { fetchNotionPageBlocks } from '@/lib/db/notion/getPostBlocks'
import { normalizeNotionMetadata } from '@/lib/db/notion/normalizeUtil'
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
    const viewIds = rawMetadata?.view_ids || []

    const cqKeys = Object.keys(collectionQuery)
    const hasCollectionId = cqKeys.includes(collectionId)
    const hasUuidCollectionId = cqKeys.includes(idToUuid(collectionId))

    const viewSample = {}
    const cqTarget = collectionQuery[collectionId] || collectionQuery[idToUuid(collectionId)]
    if (cqTarget) {
      const viewId = viewIds[0]
      const view = cqTarget[viewId]
      if (view) {
        viewSample.hasBlockIds = Array.isArray(view.blockIds)
        viewSample.blockIdsCount = view.blockIds?.length
        viewSample.hasCollectionGroupResults = !!view.collection_group_results
        const cgr = view.collection_group_results
        viewSample.cgrKeys = cgr ? Object.keys(cgr) : []
        viewSample.cgrHasBlockIds = Array.isArray(cgr?.blockIds)
        viewSample.cgrBlockIdsCount = cgr?.blockIds?.length
        viewSample.cgrHasResults = Array.isArray(cgr?.results)
        viewSample.cgrResultsCount = cgr?.results?.length
        if (cgr?.results?.length > 0) {
          viewSample.firstResultKeys = Object.keys(cgr.results[0])
          viewSample.firstResultBlockIdsCount = cgr.results[0]?.blockIds?.length
        }
      } else {
        viewSample.viewIds = viewIds
        viewSample.cqTargetKeys = Object.keys(cqTarget)
        viewSample.note = 'viewId not found in cqTarget'
      }
    } else {
      viewSample.note = 'collectionId not found in collectionQuery'
    }

    res.json({
      pageId,
      uuid,
      collectionId,
      collectionIdUuid: idToUuid(collectionId),
      viewIds,
      cqKeys,
      hasCollectionId,
      hasUuidCollectionId,
      viewSample,
      rawMetadataType: rawMetadata?.type,
    })
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack })
  }
}
