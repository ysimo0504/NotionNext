/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */

'use client'
import Loading from '@/components/Loading'
import NotionPage from '@/components/NotionPage'
import { siteConfig } from '@/lib/config'
import { isBrowser } from '@/lib/utils'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { About } from './components/About'
import { BackToTopButton } from './components/BackToTopButton'
import { Blog } from './components/Blog'
import { Brand } from './components/Brand'
import { Contact } from './components/Contact'
import { FAQ } from './components/FAQ'
import { Features } from './components/Features'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Pricing } from './components/Pricing'
import { Team } from './components/Team'
import { Testimonials } from './components/Testimonials'
import CONFIG from './config'
import { Style } from './style'
// import { MadeWithButton } from './components/MadeWithButton'
import Comment from '@/components/Comment'
import replaceSearchResult from '@/components/Mark'
import ShareBar from '@/components/ShareBar'
import DashboardBody from '@/components/ui/dashboard/DashboardBody'
import DashboardHeader from '@/components/ui/dashboard/DashboardHeader'
import { useGlobal } from '@/lib/global'
import { loadWowJS } from '@/lib/plugins/wow'
import { SignIn, SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { ArticleLock } from './components/ArticleLock'
import { Banner } from './components/Banner'
import { CTA } from './components/CTA'
import SearchInput from './components/SearchInput'
import { SignInForm } from './components/SignInForm'
import { SignUpForm } from './components/SignUpForm'
import { SVG404 } from './components/svg/SVG404'
import { HomeFooter } from './components/HomeFooter'

const LayoutBase = props => {
  const { children } = props
  const router = useRouter()

  // 加载wow动画
  useEffect(() => {
    // loadWowJS()
  }, [])

  // 检查是否为首页
  const isHomePage = router.route === '/'

  // 动态滚动控制
  useEffect(() => {
    if (isHomePage && isBrowser) {
      const checkScrollNeed = () => {
        const windowHeight = window.innerHeight
        const documentHeight = document.documentElement.scrollHeight
        const body = document.body

        // 桌面端始终禁用滚动
        if (window.innerWidth >= 1024) {
          body.style.overflow = 'hidden'
          document.documentElement.style.overflow = 'hidden'
        }
        // 移动端根据内容高度决定
        else {
          console.log('移动端检测:', {
            documentHeight,
            windowHeight,
            diff: documentHeight - windowHeight,
            needScroll: documentHeight > windowHeight + 20
          })

          if (documentHeight > windowHeight + 20) {
            // 内容超出屏幕，允许滚动
            body.style.overflow = 'auto'
            document.documentElement.style.overflow = 'auto'
            console.log('移动端 - 允许滚动')
          } else {
            // 内容适合屏幕，禁用滚动
            body.style.overflow = 'hidden'
            document.documentElement.style.overflow = 'hidden'
            console.log('移动端 - 禁用滚动')
          }
        }
      }

      // 延迟执行，确保DOM渲染完成
      const timer = setTimeout(checkScrollNeed, 800)

      // 监听窗口大小变化和方向变化
      window.addEventListener('resize', checkScrollNeed)
      window.addEventListener('orientationchange', checkScrollNeed)

      return () => {
        clearTimeout(timer)
        window.removeEventListener('resize', checkScrollNeed)
        window.removeEventListener('orientationchange', checkScrollNeed)
        // 清理样式
        document.body.style.overflow = 'auto'
        document.documentElement.style.overflow = 'auto'
      }
    } else if (isBrowser) {
      // 非首页恢复正常滚动
      document.body.style.overflow = 'auto'
      document.documentElement.style.overflow = 'auto'
    }
  }, [isHomePage])

  return (
    <div
      id='theme-simo'
      className={`${siteConfig('FONT_STYLE')} min-h-screen flex flex-col bg-white scroll-smooth`}>
      <Style />
      {/* 页头 - 固定高度 */}
      <Header {...props} />

      {/* 主内容区域 - 占据剩余空间 */}
      <div
        id='main-wrapper'
        className={isHomePage ? 'flex-1 flex items-center' : 'grow'}>
        {children}
      </div>

      {/* 页脚 - 固定在底部 */}
      {isHomePage && <HomeFooter {...props} />}
      {!isHomePage && <Footer {...props} />}

      {/* 悬浮按钮 */}
      {/* <BackToTopButton /> */}

      {/* <MadeWithButton/> */}
    </div>
  )
}

/**
 * 首页布局
 * @param {*} props
 * @returns
 */
const LayoutIndex = props => {
  const count = siteConfig('STARTER_BLOG_COUNT', 3, CONFIG)
  const { locale } = useGlobal()
  const posts = props?.allNavPages ? props.allNavPages.slice(0, count) : []
  return (
    <>
      {siteConfig('STARTER_HERO_ENABLE', true, CONFIG) && <Hero {...props} />}
    </>
  )
}

/**
 * 文章详情页布局
 * @param {*} props
 * @returns
 */
// const LayoutSlug = props => {
//   const { post, lock, validPassword, allPages } = props

//   // 客户端调试信息
//   console.log('🎨 LayoutSlug 调试信息:')
//   console.log('  post:', post)
//   console.log('  allPages 数量:', allPages?.length)
//   console.log(
//     '  所有文章 slugs:',
//     allPages?.map(p => p.slug)
//   )
//   console.log(
//     '  Post 类型文章:',
//     allPages
//       ?.filter(p => p.type === 'Post')
//       ?.map(p => ({ slug: p.slug, title: p.title }))
//   )
//   // 如果 是 /article/[slug] 的文章路径则視情況进行重定向到另一个域名
//   const router = useRouter()
//   if (
//     !post &&
//     siteConfig('STARTER_POST_REDIRECT_ENABLE') &&
//     isBrowser &&
//     router.route === '/[prefix]/[slug]'
//   ) {
//     const redirectUrl =
//       siteConfig('STARTER_POST_REDIRECT_URL') +
//       router.asPath.replace('?theme=landing', '')
//     router.push(redirectUrl)
//     return (
//       <div id='theme-simo'>
//         <Loading />
//       </div>
//     )
//   }

//   return (
//     <>
//       <Banner title={post?.title} description={post?.summary} />
//       <div className='container grow'>
//         <div className='flex flex-wrap justify-center -mx-4'>
//           <div id='container-inner' className='w-full p-4'>
//             {lock && <ArticleLock validPassword={validPassword} />}

//             {!lock && post && (
//               <div id='article-wrapper' className='mx-auto'>
//                 <NotionPage {...props} />
//                 <Comment frontMatter={post} />
//                 <ShareBar post={post} />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   )
// }

/**
 * 仪表盘
 * @param {*} props
 * @returns
 */
// const LayoutDashboard = props => {
//   const { post } = props

//   return (
//     <>
//       <div className='container grow'>
//         <div className='flex flex-wrap justify-center -mx-4'>
//           <div id='container-inner' className='w-full p-4'>
//             {post && (
//               <div id='article-wrapper' className='mx-auto'>
//                 <NotionPage {...props} />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//       {/* 仪表盘 */}
//       <DashboardHeader />
//       <DashboardBody />
//     </>
//   )
// }

/**
 * 搜索
 * @param {*} props
 * @returns
 */
const LayoutSearch = props => {
  const { keyword } = props
  const router = useRouter()
  const currentSearch = keyword || router?.query?.s

  useEffect(() => {
    if (isBrowser) {
      replaceSearchResult({
        doms: document.getElementById('posts-wrapper'),
        search: keyword,
        target: {
          element: 'span',
          className: 'text-red-500 border-b border-dashed'
        }
      })
    }
  }, [])
  return (
    <>
      <section className='max-w-7xl mx-auto bg-white pb-10 pt-20 dark:bg-dark lg:pb-20 lg:pt-[120px]'>
        <SearchInput {...props} />
        {currentSearch && <Blog {...props} />}
      </section>
    </>
  )
}

/**
 * 文章归档
 * @param {*} props
 * @returns
 */
// const LayoutArchive = props => (
//   <>
//     {/* 博文列表 */}
//     <Blog {...props} />
//   </>
// )

/**
 * 404页面
 * @param {*} props
 * @returns
 */
const Layout404 = props => {
  return (
    <>
      {/* <!-- ====== 404 Section Start --> */}
      <section className='bg-white py-20 dark:bg-dark-2 lg:py-[110px]'>
        <div className='container mx-auto'>
          <div className='flex flex-wrap items-center -mx-4'>
            <div className='w-full px-4 md:w-5/12 lg:w-6/12'>
              <div className='text-center'>
                <img
                  src='/images/starter/404.svg'
                  alt='image'
                  className='max-w-full mx-auto'
                />
              </div>
            </div>
            <div className='w-full px-4 md:w-7/12 lg:w-6/12 xl:w-5/12'>
              <div>
                <div className='mb-8'>
                  <SVG404 />
                </div>
                <h3 className='mb-5 text-2xl font-semibold text-dark dark:text-white'>
                  {siteConfig('STARTER_404_TITLE')}
                </h3>
                <p className='mb-8 text-base text-body-color dark:text-dark-6'>
                  {siteConfig('STARTER_404_TEXT')}
                </p>
                <Link
                  href='/'
                  className='py-3 text-base font-medium text-white transition rounded-md bg-dark px-7 hover:bg-primary'>
                  {siteConfig('STARTER_404_BACK')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* <!-- ====== 404 Section End --> */}
    </>
  )
}

/**
 * 翻页博客列表
 */
// const LayoutPostList = props => {
//   const { posts, category, tag } = props
//   const slotTitle = category || tag

//   return (
//     <>
//       {/* <!-- ====== Blog Section Start --> */}
//       <section className='bg-white pb-10 pt-20 dark:bg-dark lg:pb-20 lg:pt-[120px]'>
//         <div className='container mx-auto'>
//           {/* 区块标题文字 */}
//           <div className='-mx-4 flex flex-wrap justify-center'>
//             <div className='w-full px-4'>
//               <div className='mx-auto mb-[60px] max-w-[485px] text-center'>
//                 {slotTitle && (
//                   <h2 className='mb-4 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px] md:leading-[1.2]'>
//                     {slotTitle}
//                   </h2>
//                 )}

//                 {!slotTitle && (
//                   <>
//                     <span className='mb-2 block text-lg font-semibold text-primary'>
//                       {siteConfig('STARTER_BLOG_TITLE')}
//                     </span>
//                     <h2 className='mb-4 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px] md:leading-[1.2]'>
//                       {siteConfig('STARTER_BLOG_TEXT_1')}
//                     </h2>
//                     <p
//                       dangerouslySetInnerHTML={{
//                         __html: siteConfig('STARTER_BLOG_TEXT_2')
//                       }}
//                       className='text-base text-body-color dark:text-dark-6'></p>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//           {/* 博客列表 此处优先展示3片文章 */}
//           <div className='-mx-4 flex flex-wrap'>
//             {posts?.map((item, index) => {
//               return (
//                 <div key={index} className='w-full px-4 md:w-1/2 lg:w-1/3'>
//                   <div
//                     className='wow fadeInUp group mb-10'
//                     data-wow-delay='.1s'>
//                     <div className='mb-8 overflow-hidden rounded-[5px]'>
//                       <Link href={item?.href} className='block'>
//                         <img
//                           src={item.pageCoverThumbnail}
//                           alt={item.title}
//                           className='w-full transition group-hover:rotate-6 group-hover:scale-125'
//                         />
//                       </Link>
//                     </div>
//                     <div>
//                       <span className='mb-6 inline-block rounded-[5px] bg-primary px-4 py-0.5 text-center text-xs font-medium leading-loose text-white'>
//                         {item.publishDay}
//                       </span>
//                       <h3>
//                         <Link
//                           href={item?.href}
//                           className='mb-4 inline-block text-xl font-semibold text-dark hover:text-primary dark:text-white dark:hover:text-primary sm:text-2xl lg:text-xl xl:text-2xl'>
//                           {item.title}
//                         </Link>
//                       </h3>
//                       <p className='max-w-[370px] text-base text-body-color dark:text-dark-6'>
//                         {item.summary}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         </div>
//       </section>
//       {/* <!-- ====== Blog Section End --> */}
//     </>
//   )
// }
/**
 * 分类列表
 * @param {*} props
 * @returns
 */
// const LayoutCategoryIndex = props => {
//   const { categoryOptions } = props
//   const { locale } = useGlobal()
//   return (
//     <section className='bg-white pb-10 pt-20 dark:bg-dark lg:pb-20 lg:pt-[120px]'>
//       <div className='container mx-auto  min-h-96'>
//         <span className='mb-2 text-lg font-semibold text-primary flex justify-center items-center '>
//           {locale.COMMON.CATEGORY}
//         </span>
//         <div
//           id='category-list'
//           className='duration-200 flex flex-wrap justify-center items-center '>
//           {categoryOptions?.map(category => {
//             return (
//               <Link
//                 key={category.name}
//                 href={`/category/${category.name}`}
//                 passHref
//                 legacyBehavior>
//                 <h2
//                   className={
//                     'hover:text-black text-2xl font-semibold text-dark sm:text-4xl md:text-[40px] md:leading-[1.2] dark:hover:text-white dark:text-gray-300 dark:hover:bg-gray-600 px-5 cursor-pointer py-2 hover:bg-gray-100'
//                   }>
//                   <i className='mr-4 fas fa-folder' />
//                   {category.name}({category.count})
//                 </h2>
//               </Link>
//             )
//           })}
//         </div>
//       </div>
//     </section>
//   )
// }

/**
 * 标签列表
 * @param {*} props
 * @returns
 */
// const LayoutTagIndex = props => {
//   const { tagOptions } = props
//   const { locale } = useGlobal()
//   return (
//     <section className='bg-white pb-10 pt-20 dark:bg-dark lg:pb-20 lg:pt-[120px]'>
//       <div className='container mx-auto  min-h-96'>
//         <span className='mb-2 text-lg font-semibold text-primary flex justify-center items-center '>
//           {locale.COMMON.TAGS}
//         </span>
//         <div
//           id='tags-list'
//           className='duration-200 flex flex-wrap justify-center items-center'>
//           {tagOptions.map(tag => {
//             return (
//               <div key={tag.name} className='p-2'>
//                 <Link
//                   key={tag}
//                   href={`/tag/${encodeURIComponent(tag.name)}`}
//                   passHref
//                   className={`cursor-pointer inline-block rounded hover:bg-gray-500 hover:text-white duration-200  mr-2 py-1 px-2 text-md whitespace-nowrap dark:hover:text-white text-gray-600 hover:shadow-xl dark:border-gray-400 notion-${tag.color}_background dark:bg-gray-800`}>
//                   <div className='font-light dark:text-gray-400'>
//                     <i className='mr-1 fas fa-tag' />{' '}
//                     {tag.name + (tag.count ? `(${tag.count})` : '')}{' '}
//                   </div>
//                 </Link>
//               </div>
//             )
//           })}
//         </div>
//       </div>
//     </section>
//   )
// }
/**
 * 登录页面
 * @param {*} props
 * @returns
 */
// const LayoutSignIn = props => {
//   const enableClerk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
//   const title = siteConfig('STARTER_SIGNIN', '登录')
//   const description = siteConfig(
//     'STARTER_SIGNIN_DESCRITION',
//     '这里是演示页面，NotionNext目前不提供会员登录功能'
//   )
//   return <></>
// }

/**
 * 注册页面
 * @param {*} props
 * @returns
 */
// const LayoutSignUp = props => {
//   const enableClerk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

//   const title = siteConfig('STARTER_SIGNIN', '注册')
//   const description = siteConfig(
//     'STARTER_SIGNIN_DESCRITION',
//     '这里是演示页面，NotionNext目前不提供会员注册功能'
//   )
//   return <></>
// }

export {
  Layout404,
  // LayoutArchive,
  LayoutBase,
  // LayoutCategoryIndex,
  // LayoutDashboard,
  LayoutIndex,
  // LayoutPostList,
  LayoutSearch,
  // LayoutSignIn,
  // LayoutSignUp,
  // LayoutSlug,
  // LayoutTagIndex,
  CONFIG as THEME_CONFIG
}
