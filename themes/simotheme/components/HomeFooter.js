import { siteConfig } from '@/lib/config'

/**
 * 首页专用Footer - 只显示版权信息
 */
export const HomeFooter = props => {
  return (
    <>
      {/* <!-- ====== Home Footer Section Start --> */}
      <footer className='bg-white border-t border-gray-100 py-6'>
        <div className='container'>
          <div className='text-center'>
            <p className='text-gray-400 text-sm'>
              © {new Date().getFullYear()} {siteConfig('AUTHOR')}. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
      {/* <!-- ====== Home Footer Section End --> */}
    </>
  )
}
