// eslint-disable-next-line @next/next/no-document-import-in-page
import BLOG from '@/blog.config'
import Document, { Head, Html, Main, NextScript } from 'next/document'

// 强制设置为 light 模式的脚本内容
const darkModeScript = `
(function() {
  // 强制设置为 light 模式，忽略所有其他设置
  document.documentElement.classList.remove('dark')
  document.documentElement.classList.add('light')
  
  // 清理可能存在的暗黑模式设置
  localStorage.removeItem('darkMode')
  localStorage.setItem('darkMode', 'false')
})()
`

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang={BLOG.LANG}>
        <Head>
          {/* 基础SEO meta标签 */}
          <meta charSet='UTF-8' />
          <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
          <meta
            name='viewport'
            content='width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0'
          />
          <meta name='robots' content='index, follow' />
          <meta
            name='googlebot'
            content='index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
          />
          <meta
            name='bingbot'
            content='index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
          />

          {/* DNS预解析 */}
          <link rel='dns-prefetch' href='//fonts.googleapis.com' />
          <link rel='dns-prefetch' href='//www.google-analytics.com' />
          <link rel='dns-prefetch' href='//www.googletagmanager.com' />

          {/* 安全性设置 */}
          <meta httpEquiv='X-Content-Type-Options' content='nosniff' />
          <meta httpEquiv='X-Frame-Options' content='DENY' />
          <meta httpEquiv='X-XSS-Protection' content='1; mode=block' />
          <meta
            httpEquiv='Referrer-Policy'
            content='strict-origin-when-cross-origin'
          />

          {/* Favicon and touch icons */}
          <link rel='icon' href={BLOG.BLOG_FAVICON || '/favicon.ico'} />
          <link
            rel='apple-touch-icon'
            sizes='180x180'
            href='/apple-touch-icon.png'
          />
          <link rel='manifest' href='/site.webmanifest' />

          {/* 预加载字体 */}
          {BLOG.FONT_AWESOME && (
            <>
              <link
                rel='preload'
                href={BLOG.FONT_AWESOME}
                as='style'
                crossOrigin='anonymous'
              />
              <link
                rel='stylesheet'
                href={BLOG.FONT_AWESOME}
                crossOrigin='anonymous'
                referrerPolicy='no-referrer'
              />
            </>
          )}

          {/* 预先设置深色模式，避免闪烁 */}
          <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
        </Head>

        <body>
          {/* Google Tag Manager (noscript) - 放在 body 开始后 */}
          <noscript>
            <iframe
              src='https://www.googletagmanager.com/ns.html?id=G-LFGQHB4H62'
              height='0'
              width='0'
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
