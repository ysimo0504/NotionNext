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
    const collectionIdUuid = idToUuid(collectionId)
    const collectionQuery = recordMap?.collection_query || {}
    const viewIds = rawMetadata?.view_ids || []

    const cqKeys = Object.keys(collectionQuery)
    const cqData =
      collectionQuery[collectionId] ||
      collectionQuery[collectionIdUuid] ||
      {}
    const cqDataKeys = Object.keys(cqData)

    const viewSample = {}
    const firstViewId = viewIds[0]
    if (firstViewId && cqData[firstViewId]) {
      const view = cqData[firstViewId]
      viewSample.viewKeys = Object.keys(view)
      viewSample.hasBlockIds = Array.isArray(view.blockIds)
      viewSample.blockIdsCount = view.blockIds?.length
      const cgr = view.collection_group_results
      viewSample.hasCGR = !!cgr
      if (cgr) {
        viewSample.cgrKeys = Object.keys(cgr)
        viewSample.cgrHasBlockIds = Array.isArray(cgr.blockIds)
        viewSample.cgrBlockIdsCount = cgr.blockIds?.length
        viewSample.cgrHasResults = Array.isArray(cgr.results)
        viewSample.cgrResultsCount = cgr.results?.length
        if (cgr.results?.[0]) {
          viewSample.firstGroupKeys = Object.keys(cgr.results[0])
          viewSample.firstGroupBlockIdsCount = cgr.results[0].blockIds?.length
        }
      }
    } else if (firstViewId) {
      viewSample.note = `viewId ${firstViewId} not found. cqData keys: ${cqDataKeys.slice(0, 3).join(', ')}`
    }

    res.setHeader('Content-Type', 'application/json')
    res.json({
      pageId,
      uuid,
      collectionId,
      collectionIdUuid,
      cqKeys: cqKeys.slice(0, 5),
      cqKeyMatchesCollectionId: cqKeys.includes(collectionId),
      cqKeyMatchesUuid: cqKeys.includes(collectionIdUuid),
      viewIds,
      cqDataKeys: cqDataKeys.slice(0, 5),
      viewSample,
      rawMetadataType: rawMetadata?.type,
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
