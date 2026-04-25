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
  let pageIds = []

  // Notion API may key collection_query by either raw or UUID-formatted collectionId
  const cqData =
    collectionQuery?.[collectionId] ||
    collectionQuery?.[idToUuid(collectionId)] ||
    {}

  // Extract all blockIds from a collection_group_results object,
  // handling both the legacy flat format and the current nested results format.
  function extractBlockIds(groupResults) {
    if (!groupResults) return []
    const ids = []
    // Legacy flat format: collection_group_results.blockIds
    if (Array.isArray(groupResults.blockIds)) {
      ids.push(...groupResults.blockIds)
    }
    // Current format: collection_group_results.results[].blockIds
    if (Array.isArray(groupResults.results)) {
      for (const group of groupResults.results) {
        if (Array.isArray(group?.blockIds)) {
          ids.push(...group.blockIds)
        }
      }
    }
    return ids
  }

  try {
    // Notion数据库中的第几个视图用于站点展示和排序：
    const groupIndex = BLOG.NOTION_INDEX || 0
    if (viewIds && viewIds.length > 0) {
      const viewData = cqData[viewIds[groupIndex]]
      const ids = extractBlockIds(viewData?.collection_group_results)
      // Also check direct blockIds on the view
      if (Array.isArray(viewData?.blockIds)) {
        ids.push(...viewData.blockIds)
      }
      for (const id of ids) {
        pageIds.push(id)
      }
    }
  } catch (error) {
    console.error('Error fetching page IDs:', error)
    return []
  }

  // 否则按照数据库原始排序
  if (pageIds.length === 0 && Object.keys(cqData).length > 0) {
    const pageSet = new Set()
    Object.values(cqData).forEach(view => {
      view?.blockIds?.forEach(id => pageSet.add(id))
      extractBlockIds(view?.collection_group_results).forEach(id =>
        pageSet.add(id)
      )
    })
    pageIds = [...pageSet]
  }
  return pageIds
}
