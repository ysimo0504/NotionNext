import { siteConfig } from '@/lib/config'
import SocialButton from '@/themes/simotheme/components/SocialButton'
import { Logo } from './Logo'
import Link from 'next/link'
import BLOG from '@/blog.config'
import { useGlobal } from '@/lib/global'

/* eslint-disable @next/next/no-img-element */
export const Footer = props => {
  const { locale } = useGlobal()

  // 获取与 Header 一致的菜单数据
  let links = [
    {
      icon: 'fas fa-archive',
      name: locale.NAV.ARCHIVE,
      href: '/archive',
      show: siteConfig('HEO_MENU_ARCHIVE')
    },
    {
      icon: 'fas fa-search',
      name: locale.NAV.SEARCH,
      href: '/search',
      show: siteConfig('HEO_MENU_SEARCH')
    },
    {
      icon: 'fas fa-folder',
      name: locale.COMMON.CATEGORY,
      href: '/category',
      show: siteConfig('HEO_MENU_CATEGORY')
    },
    {
      icon: 'fas fa-tag',
      name: locale.COMMON.TAGS,
      href: '/tag',
      show: siteConfig('HEO_MENU_TAG')
    }
  ]

  // 如果有自定义导航，合并菜单
  if (props?.customNav) {
    links = props.customNav.concat(links)
  }

  // 如果开启自定义菜单，则覆盖Page生成的菜单
  if (siteConfig('CUSTOM_MENU', BLOG.CUSTOM_MENU)) {
    links = props?.customMenu || links
  }

  // 过滤显示的菜单项
  const visibleLinks = links?.filter(link => link?.show !== false) || []

  return (
    <>
      {/* <!-- ====== Footer Section Start --> */}
      <footer className='bg-white border-t border-gray-100 py-8'>
        <div className='container'>
          <div className='flex items-center justify-between relative'>
            {/* 左侧 Logo */}
            <div className='flex items-center'>
              <Logo />
            </div>

            {/* 中间菜单 - 居中显示 */}
            <div className='absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden lg:flex lg:items-center lg:space-x-6'>
              {visibleLinks?.map((link, index) => (
                <Link
                  key={index}
                  href={link?.href}
                  target={link?.target}
                  className='text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors'>
                  {link?.name}
                </Link>
              ))}
            </div>

            {/* 右侧社交媒体 */}
            <div className='flex items-center space-x-3'>
              <SocialButton />
            </div>
          </div>

          {/* 底部版权信息 */}
          <div className='mt-8 pt-6 border-t border-gray-100'>
            <div className='text-center'>
              <p className='text-gray-400 text-sm'>
                © {new Date().getFullYear()} {siteConfig('AUTHOR')}. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
      {/* <!-- ====== Footer Section End --> */}
    </>
  )
}
