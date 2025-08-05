import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'
import { BlogPostCardInfo } from './BlogPostCardInfo'

const BlogPostCard = ({ index, post, showSummary, siteInfo }) => {
  const showPreview =
    siteConfig('HEXO_POST_LIST_PREVIEW', null, CONFIG) && post.blockMap
  if (
    post &&
    !post.pageCoverThumbnail &&
    siteConfig('HEXO_POST_LIST_COVER_DEFAULT', null, CONFIG)
  ) {
    post.pageCoverThumbnail = siteInfo?.pageCover
  }
  const showPageCover =
    siteConfig('HEXO_POST_LIST_COVER', null, CONFIG) &&
    post?.pageCoverThumbnail &&
    !showPreview
  //   const delay = (index % 2) * 200

  return (
    <div
      className={`${siteConfig('HEXO_POST_LIST_COVER_HOVER_ENLARGE', null, CONFIG) ? ' hover:scale-110 transition-all duration-150' : ''}`}>
      <SmartLink href={post?.href}>
        <div
          key={post.id}
          data-aos='fade-up'
          data-aos-easing='ease-in-out'
          data-aos-duration='500'
          data-aos-once='false'
          data-aos-anchor-placement='top-bottom'
          id='blog-post-card'
          className={`group md:h-56 w-full flex justify-between md:flex-row flex-col-reverse ${siteConfig('HEXO_POST_LIST_IMG_CROSSOVER', null, CONFIG) && index % 2 === 1 ? 'md:flex-row-reverse' : ''}
                      overflow-hidden border-2 dark:border-black rounded-xl bg-white dark:bg-hexo-black-gray
                      hover:shadow-lg hover:shadow-gray-200/50 hover:border-black dark:hover:border-gray-600
                      transform hover:-translate-y-1 transition-all duration-300 ease-in-out
                      cursor-pointer`}>
          {/* 文字内容 */}
          <BlogPostCardInfo
            index={index}
            post={post}
            showPageCover={showPageCover}
            showPreview={showPreview}
            showSummary={showSummary}
          />

          {/* 图片封面 */}
          {showPageCover && (
            <div className='md:w-5/12 overflow-hidden'>
              <LazyImage
                priority={index === 1}
                alt={post?.title}
                src={post?.pageCoverThumbnail}
                className='h-56 w-full object-cover object-center group-hover:scale-110 duration-500'
              />
            </div>
          )}
        </div>
      </SmartLink>
    </div>
  )
}

export default BlogPostCard
