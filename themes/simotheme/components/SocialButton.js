import QrCode from '@/components/QrCode'
import { siteConfig } from '@/lib/config'
import { useState } from 'react'

/**
 * 社交联系方式按钮组 - 黑白风格
 * @returns {JSX.Element}
 * @constructor
 */
const SocialButton = () => {
  const CONTACT_GITHUB = siteConfig('CONTACT_GITHUB')
  const CONTACT_TWITTER = siteConfig('CONTACT_TWITTER')
  const CONTACT_TELEGRAM = siteConfig('CONTACT_TELEGRAM')
  const CONTACT_LINKEDIN = siteConfig('CONTACT_LINKEDIN')
  const CONTACT_WEIBO = siteConfig('CONTACT_WEIBO')
  const CONTACT_INSTAGRAM = siteConfig('CONTACT_INSTAGRAM')
  const CONTACT_EMAIL = siteConfig('CONTACT_EMAIL')
  const ENABLE_RSS = siteConfig('ENABLE_RSS')
  const CONTACT_BILIBILI = siteConfig('CONTACT_BILIBILI')
  const CONTACT_YOUTUBE = siteConfig('CONTACT_YOUTUBE')
  const CONTACT_XIAOHONGSHU = siteConfig('CONTACT_XIAOHONGSHU')
  const CONTACT_ZHISHIXINGQIU = siteConfig('CONTACT_ZHISHIXINGQIU')
  const CONTACT_WEHCHAT_PUBLIC = siteConfig('CONTACT_WEHCHAT_PUBLIC')
  const CONTACT_NOTION = siteConfig('CONTACT_NOTION')
  const [qrCodeShow, setQrCodeShow] = useState(false)

  const openPopover = () => {
    setQrCodeShow(true)
  }
  const closePopover = () => {
    setQrCodeShow(false)
  }

  return (
    <div className='flex items-center justify-center flex-wrap gap-3 sm:gap-4'>
      {CONTACT_GITHUB && (
        <a
          target='_blank'
          rel='noreferrer'
          title='GitHub'
          href={CONTACT_GITHUB}
          className='social-btn'>
          {/* <i className='fab fa-github' /> */}
          <img
            className='w-8 h-8'
            src='/svg/GitHub_Symbol_2.svg'
            alt='GitHub'
          />
        </a>
      )}
      {CONTACT_TWITTER && (
        <a
          target='_blank'
          rel='noreferrer'
          title='Twitter'
          href={CONTACT_TWITTER}
          className='social-btn'>
          {/* <i className='fab fa-twitter' /> */}
          <img
            className='w-8 h-8'
            src='/svg/X_idJxGuURW1_0.svg'
            alt='Twitter'
          />
        </a>
      )}
      {CONTACT_XIAOHONGSHU && (
        <a
          target='_blank'
          rel='noreferrer'
          title='小红书'
          href={CONTACT_XIAOHONGSHU}
          className='social-btn'>
          <img className='w-8 h-8' src='/svg/xiaohongshu.svg' alt='小红书' />
        </a>
      )}
      {CONTACT_NOTION && (
        <a
          target='_blank'
          rel='noreferrer'
          title='Notion'
          href={CONTACT_NOTION}
          className='social-btn'>
          {/* <i className='fab fa-notion' /> */}
          <img
            className='w-8 h-8'
            src='/svg/Notion_Symbol_6.svg'
            alt='Notion'
          />
        </a>
      )}
      {CONTACT_EMAIL && (
        <a
          target='_blank'
          rel='noreferrer'
          title='Email'
          href={`mailto:${CONTACT_EMAIL}`}>
          <i
            className='fa-solid fa-envelope text-white text-3xl flex items-center justify-center social-btn'
            // style={{ fontSize: '1.5rem' }}
          />
          {/* <img className='w-8 h-8' src='/svg/email.svg' alt='Email' /> */}
        </a>
      )}

      {/* ---------------------------以下没有配置---------------------------- */}

      {CONTACT_WEHCHAT_PUBLIC && (
        <div className='relative'>
          <button
            onMouseEnter={openPopover}
            onMouseLeave={closePopover}
            aria-label='微信公众号'
            className='social-btn'>
            <i className='fab fa-weixin text-white ' />
          </button>
          {/* 二维码弹框 */}
          <div className='absolute bottom-12 left-1/2 transform -translate-x-1/2'>
            <div
              className={
                (qrCodeShow ? 'opacity-100 ' : 'invisible opacity-0') +
                ' z-40 bg-white shadow-xl transition-all duration-200 text-center rounded-lg border'
              }>
              <div className='p-3 w-32 h-32'>
                {qrCodeShow && <QrCode value={CONTACT_WEHCHAT_PUBLIC} />}
              </div>
            </div>
          </div>
        </div>
      )}
      {CONTACT_TELEGRAM && (
        <a
          target='_blank'
          rel='noreferrer'
          href={CONTACT_TELEGRAM}
          title='Telegram'
          className='social-btn'>
          <i className='fab fa-telegram' />
        </a>
      )}
      {CONTACT_LINKEDIN && (
        <a
          target='_blank'
          rel='noreferrer'
          href={CONTACT_LINKEDIN}
          title='LinkedIn'
          className='social-btn'>
          <i className='fab fa-linkedin' />
        </a>
      )}
      {CONTACT_WEIBO && (
        <a
          target='_blank'
          rel='noreferrer'
          title='Weibo'
          href={CONTACT_WEIBO}
          className='social-btn'>
          <i className='fab fa-weibo' />
        </a>
      )}
      {CONTACT_INSTAGRAM && (
        <a
          target='_blank'
          rel='noreferrer'
          title='Instagram'
          href={CONTACT_INSTAGRAM}
          className='social-btn'>
          <i className='fab fa-instagram' />
        </a>
      )}
      {ENABLE_RSS && (
        <a
          target='_blank'
          rel='noreferrer'
          title='RSS'
          href='/rss/feed.xml'
          className='social-btn'>
          <i className='fas fa-rss' />
        </a>
      )}
      {CONTACT_BILIBILI && (
        <a
          target='_blank'
          rel='noreferrer'
          title='Bilibili'
          href={CONTACT_BILIBILI}
          className='social-btn'>
          <i className='fab fa-bilibili' />
        </a>
      )}
      {CONTACT_YOUTUBE && (
        <a
          target='_blank'
          rel='noreferrer'
          title='YouTube'
          href={CONTACT_YOUTUBE}
          className='social-btn'>
          <i className='fab fa-youtube' />
        </a>
      )}

      {CONTACT_ZHISHIXINGQIU && (
        <a
          target='_blank'
          rel='noreferrer'
          title='知识星球'
          href={CONTACT_ZHISHIXINGQIU}
          className='social-btn'>
          <img
            className='w-4 h-4'
            src='/svg/zhishixingqiu-white.svg'
            alt='知识星球'
          />
        </a>
      )}
    </div>
  )
}

export default SocialButton
