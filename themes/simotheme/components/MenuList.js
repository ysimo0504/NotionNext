import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { MenuItem } from './MenuItem'

/**
 * 响应式 折叠菜单
 */
export const MenuList = props => {
  const { customNav, customMenu } = props
  const { locale } = useGlobal()

  const [showMenu, setShowMenu] = useState(false) // 控制菜单展开/收起状态
  const router = useRouter()

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

  if (customNav) {
    links = customNav.concat(links)
  }

  // 如果 开启自定义菜单，则覆盖Page生成的菜单
  if (siteConfig('CUSTOM_MENU', BLOG.CUSTOM_MENU)) {
    links = customMenu
  }

  const toggleMenu = () => {
    setShowMenu(!showMenu) // 切换菜单状态
  }

  useEffect(() => {
    setShowMenu(false)
  }, [router])

  if (!links || links.length === 0) {
    return null
  }

  return (
    <div className='relative'>
      {/* 移动端菜单切换按钮 */}
      <button
        id='navbarToggler'
        onClick={toggleMenu}
        className={`block rounded-lg px-3 py-[6px] ring-primary focus:ring-2 lg:hidden ${
          showMenu ? 'navbarTogglerActive' : ''
        }`}>
        <span className='relative my-[6px] block h-[2px] w-[30px] bg-white duration-200 transition-all'></span>
        <span className='relative my-[6px] block h-[2px] w-[30px] bg-white duration-200 transition-all'></span>
        <span className='relative my-[6px] block h-[2px] w-[30px] bg-white duration-200 transition-all'></span>
      </button>

      <nav
        id='navbarCollapse'
        className={`absolute right-0 top-full z-50 w-full max-w-[300px] rounded-lg bg-white shadow-2xl border border-gray-100 lg:static lg:block lg:w-full lg:max-w-full lg:bg-transparent lg:px-4 lg:py-0 lg:shadow-none lg:border-none lg:z-auto ${
          showMenu ? 'block' : 'hidden'
        }`}>
        <ul className='py-2 lg:py-0 lg:flex lg:items-center lg:space-x-6'>
          {links?.map((link, index) => (
            <MenuItem key={index} link={link} />
          ))}
        </ul>
      </nav>
    </div>
  )
}
