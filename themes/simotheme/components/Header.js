/* eslint-disable no-unreachable */
import DashboardButton from '@/components/ui/dashboard/DashboardButton'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import throttle from 'lodash.throttle'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

import { Logo } from './Logo'
import { MenuList } from './MenuList'
import SearchInput from './SearchInput'

/**
 * 顶部导航栏
 */
export const Header = props => {
  const router = useRouter()
  const { isDarkMode } = useGlobal()
  const [buttonTextColor, setColor] = useState(
    router.route === '/' ? 'text-white' : ''
  )

  // const enableClerk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  useEffect(() => {
    if (isDarkMode || router.route === '/') {
      setColor('text-white')
    } else {
      setColor('')
    }
    // ======= Sticky
    window.addEventListener('scroll', navBarScollListener)
    return () => {
      window.removeEventListener('scroll', navBarScollListener)
    }
  }, [isDarkMode])

  // 滚动监听
  const throttleMs = 200
  const navBarScollListener = useCallback(
    throttle(() => {
      // eslint-disable-next-line camelcase
      const ud_header = document.querySelector('.ud-header')
      const scrollY = window.scrollY
      // ud_header?.classList?.add('sticky')
      // 控制台输出当前滚动位置和 sticky 值
      if (scrollY > 0) {
        ud_header?.classList?.add('sticky')
      } else {
        ud_header?.classList?.remove('sticky')
      }
    }, throttleMs)
  )

  return (
    <>
      {/* <!-- ====== Navbar Section Start --> */}
      <div className='ud-header absolute left-0  top-0 z-50 flex w-full items-center bg-transparent'>
        <div className='container relative bg-green-500'>
          <div className='flex items-center bg-green-100'>
            {/* 左侧 Logo */}
            <div className='flex items-center lg:w-1/4'>
              <Logo {...props} />
            </div>

            {/* 中间 MenuList - 桌面端居中显示 */}
            <div className='hidden lg:flex lg:flex-1 lg:justify-center'>
              <MenuList {...props} />
            </div>

            {/* 右侧 Search - 桌面端 */}
            <div className='hidden lg:flex lg:w-1/4 lg:justify-end '>
              <button
                className='p-2 text-white hover:text-gray-300 transition-colors duration-200'
                onClick={() => {
                  // 简单跳转到搜索页面
                  router.push('/search')
                }}>
                <i className='fas fa-search text-lg' />
              </button>
            </div>

            {/* 移动端右侧区域 */}
            <div className='flex lg:hidden items-center space-x-3 ml-auto'>
              {/* 移动端菜单按钮 */}
              <MenuList {...props} />
            </div>
          </div>
        </div>
      </div>
      {/* <!-- ====== Navbar Section End --> */}
    </>
  )
}
