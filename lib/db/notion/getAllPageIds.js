import BLOG from '@/blog.config'
import { idToUuid } from 'notion-utils'

export default function getAllPageIds(
  collectionQuery,
  collectionId,
  collectionView,
  viewIds
) {
  if (!collectionQuery && !collectionView) {
    return []
  }

  // notion-client stores collection_query[collectionId][viewId] = reducerResults
  // Try both raw and UUID-formatted collectionId as the key
  const cqData =
    collectionQuery?.[collectionId] ||
    collectionQuery?.[idToUuid(collectionId)] ||
    {}

  // Extract all blockIds from a single reducerResults object.
  // Handles two formats returned by notion-client:
  //   1. Non-grouped: { collection_group_results: { blockIds: [...] } }
  //   2. Grouped (board/gallery with groupBy): { "results:select:Post": { type:"results", blockIds:[...] }, ... }
  function extractFromReducerResults(reducerResults) {
    if (!reducerResults || typeof reducerResults !== 'object') return []
    const ids = []

    for (const [key, value] of Object.entries(reducerResults)) {
      if (!value || typeof value !== 'object') continue

      if (key === 'collection_group_results') {
        // Non-grouped: flat blockIds
        if (Array.isArray(value.blockIds)) {
          ids.push(...value.blockIds)
        }
        // Nested group results format
        if (Array.isArray(value.results)) {
          for (const group of value.results) {
            if (Array.isArray(group?.blockIds)) {
              ids.push(...group.blockIds)
            }
          }
        }
      } else if (value.type === 'results' && Array.isArray(value.blockIds)) {
        // Grouped view: "results:select:Post" → { type: "results", blockIds: [...] }
        ids.push(...value.blockIds)
      }
    }

    return ids
  }

  let pageIds = []

  try {
    const groupIndex = BLOG.NOTION_INDEX || 0
    if (viewIds && viewIds.length > 0) {
      const viewData = cqData[viewIds[groupIndex]]
      const ids = extractFromReducerResults(viewData)
      // Also check direct blockIds on the view (some legacy formats)
      if (Array.isArray(viewData?.blockIds)) {
        ids.push(...viewData.blockIds)
      }
      pageIds = ids
    }
  } catch (error) {
    console.error('Error fetching page IDs:', error)
    return []
  }

  // Fallback: scan all views in cqData
  if (pageIds.length === 0 && Object.keys(cqData).length > 0) {
    const pageSet = new Set()
    for (const viewData of Object.values(cqData)) {
      extractFromReducerResults(viewData).forEach(id => pageSet.add(id))
      viewData?.blockIds?.forEach(id => pageSet.add(id))
    }
    pageIds = [...pageSet]
  }

  return pageIds
}
