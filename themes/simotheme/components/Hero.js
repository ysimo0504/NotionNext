/* eslint-disable @next/next/no-img-element */
import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import CONFIG from '../config'
import Link from 'next/link'
import SocialButton from './SocialButton'

/**
 * 英雄大图区块 - one-page 黑白风格
 */
export const Hero = props => {
  const config = props?.NOTION_CONFIG || CONFIG

  return (
    <>
      {/* <!-- ====== Hero Section Start --> */}
      <div
        id='home'
        className='relative overflow-hidden bg-white py-8 sm:py-12 lg:py-20 flex items-center'>
        <div className='w-full flex justify-center'>
          <div className='flex flex-wrap items-center justify-center w-full max-w-6xl mx-auto px-4 lg:px-8'>
            {/* 左侧内容区域 */}
            <div className='w-full lg:w-1/2 order-2 lg:order-1 text-center lg:text-left'>
              <div className='max-w-[570px] mx-auto lg:mx-auto'>
                {/* 主标题 */}
                <h1 className='mb-6 text-3xl sm:text-4xl font-bold leading-tight text-black lg:text-5xl xl:text-6xl'>
                  Hey, I'm Simo
                </h1>

                {/* 描述文案 */}
                <p className='mb-8 text-base sm:text-lg text-gray-600 lg:text-xl leading-relaxed'>
                  I'm a coder who sometimes builds interesting products
                </p>

                {/* 按钮组 */}
                <div className='mb-10 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start'>
                  {siteConfig('STARTER_HERO_BUTTON_1_TEXT', null, config) && (
                    <Link
                      href={siteConfig(
                        'STARTER_HERO_BUTTON_1_URL',
                        '/',
                        config
                      )}
                      className='w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors duration-300'>
                      {siteConfig(
                        'STARTER_HERO_BUTTON_1_TEXT',
                        'Get Started',
                        config
                      )}
                    </Link>
                  )}

                  {siteConfig('STARTER_HERO_BUTTON_2_TEXT', null, config) && (
                    <Link
                      href={siteConfig(
                        'STARTER_HERO_BUTTON_2_URL',
                        '#',
                        config
                      )}
                      className='w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium text-black bg-transparent border-2 border-black rounded-lg hover:bg-black hover:text-white transition-all duration-300'>
                      {siteConfig(
                        'STARTER_HERO_BUTTON_2_TEXT',
                        'Learn More',
                        config
                      )}
                    </Link>
                  )}

                  {siteConfig('STARTER_HERO_BUTTON_3_TEXT', null, config) && (
                    <Link
                      href={siteConfig(
                        'STARTER_HERO_BUTTON_3_URL',
                        '#',
                        config
                      )}
                      className='w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-black transition-all duration-300'>
                      {siteConfig(
                        'STARTER_HERO_BUTTON_3_TEXT',
                        'Contact',
                        config
                      )}
                    </Link>
                  )}
                </div>

                {/* 社交媒体图标 */}
                <div className='flex flex-col sm:flex-row items-center justify-center lg:justify-start'>
                  <span className='mb-3 sm:mb-0 sm:mr-4 text-sm text-gray-500'>
                    Follow me:
                  </span>
                  <SocialButton />
                </div>
              </div>
            </div>

            {/* 右侧插画区域 */}
            <div className='w-full lg:w-1/2 order-1 lg:order-2 mb-8 lg:mb-0'>
              <div className='flex justify-center px-4 lg:px-0'>
                <div className='max-w-[300px] sm:max-w-[400px] lg:max-w-[500px] w-full'>
                  <img
                    src='/images/Illustration.png'
                    alt='Illustration'
                    className='w-full h-auto object-contain'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 装饰性背景元素 */}
        <div className='absolute top-0 right-0 -z-10 opacity-10'>
          <svg width='200' height='200' viewBox='0 0 200 200' fill='none'>
            <circle
              cx='100'
              cy='100'
              r='80'
              stroke='currentColor'
              strokeWidth='0.5'
            />
            <circle
              cx='100'
              cy='100'
              r='60'
              stroke='currentColor'
              strokeWidth='0.5'
            />
            <circle
              cx='100'
              cy='100'
              r='40'
              stroke='currentColor'
              strokeWidth='0.5'
            />
            <circle
              cx='100'
              cy='100'
              r='20'
              stroke='currentColor'
              strokeWidth='0.5'
            />
          </svg>
        </div>

        <div className='absolute bottom-0 left-0 -z-10 opacity-5'>
          <svg width='150' height='150' viewBox='0 0 150 150' fill='none'>
            <rect x='20' y='20' width='20' height='20' fill='currentColor' />
            <rect x='60' y='20' width='20' height='20' fill='currentColor' />
            <rect x='100' y='20' width='20' height='20' fill='currentColor' />
            <rect x='20' y='60' width='20' height='20' fill='currentColor' />
            <rect x='100' y='60' width='20' height='20' fill='currentColor' />
            <rect x='20' y='100' width='20' height='20' fill='currentColor' />
            <rect x='60' y='100' width='20' height='20' fill='currentColor' />
            <rect x='100' y='100' width='20' height='20' fill='currentColor' />
          </svg>
        </div>
      </div>

      {/* 横幅图片（如果配置了的话） */}
      {siteConfig('STARTER_HERO_BANNER_IMAGE', null, config) && (
        <div className='w-full flex justify-center px-4'>
          <div className='max-w-6xl mx-auto'>
            <LazyImage
              priority
              className='w-full rounded-lg shadow-lg'
              src={siteConfig('STARTER_HERO_BANNER_IMAGE', null, config)}
            />
          </div>
        </div>
      )}
      {/* <!-- ====== Hero Section End --> */}
    </>
  )
}
