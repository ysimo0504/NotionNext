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
