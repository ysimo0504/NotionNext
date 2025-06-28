/* eslint-disable react/no-unknown-property */

/**
 * 此处样式只对当前主题生效
 * 此处不支持tailwindCSS的 @apply 语法
 * @returns
 */
const Style = () => {
  return (
    <style jsx global>{`
      /* 首页禁用滚动样式 */
      #theme-starter.overflow-hidden {
        height: 100vh;
        overflow: hidden;
      }

      #theme-starter.overflow-hidden body {
        overflow: hidden;
      }

      #theme-starter .sticky {
        position: fixed;
        z-index: 50;
        background-color: rgb(255 255 255 / 0.8);
        transition-property:
          color,
          background-color,
          border-color,
          text-decoration-color,
          fill,
          stroke,
          opacity,
          box-shadow,
          transform,
          filter,
          -webkit-backdrop-filter;
        transition-property: color, background-color, border-color,
          text-decoration-color, fill, stroke, opacity, box-shadow, transform,
          filter, backdrop-filter;
        transition-property:
          color,
          background-color,
          border-color,
          text-decoration-color,
          fill,
          stroke,
          opacity,
          box-shadow,
          transform,
          filter,
          backdrop-filter,
          -webkit-backdrop-filter;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 150ms;
      }

      :is(.dark #theme-starter .sticky) {
        background-color: rgb(17 25 40 / 0.8);
      }
      .text-white {
        --tw-text-opacity: 1;
        color: #000000;
      }
      .bg-primary {
        --tw-bg-opacity: 1;
        background-color: rgb(196, 50, 50);
      }
      #theme-starter .sticky {
        -webkit-backdrop-filter: blur(5px);
        backdrop-filter: blur(5px);
        box-shadow: inset 0 -1px 0 0 rgba(0, 0, 0, 0.1);
      }

      #theme-starter .sticky .navbar-logo {
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }

      #theme-starter .sticky #navbarToggler span {
        --tw-bg-opacity: 1;
        background-color: rgb(17 25 40 / var(--tw-bg-opacity));
      }

      :is(.dark #theme-starter .sticky #navbarToggler span) {
        --tw-bg-opacity: 1;
        background-color: rgb(255 255 255 / var(--tw-bg-opacity));
      }

      #theme-starter .sticky #navbarCollapse li > a {
        --tw-text-opacity: 1;
        color: rgb(0 0 0 / var(--tw-text-opacity)) !important;
      }

      #theme-starter .sticky #navbarCollapse li > a:hover {
        --tw-text-opacity: 1;
        color: rgb(55 88 249 / var(--tw-text-opacity));
        opacity: 1;
      }

      /* Menu 按钮始终保持黑色 - 不受 sticky 状态影响 */
      #theme-starter #navbarCollapse li > button,
      #theme-starter .sticky #navbarCollapse li > button {
        --tw-text-opacity: 1;
        color: rgb(0 0 0 / var(--tw-text-opacity)) !important;
      }

      /* 汉堡菜单按钮（三条横线）始终保持黑色 */
      #theme-starter #navbarToggler span,
      #theme-starter .sticky #navbarToggler span {
        background-color: rgb(0 0 0) !important;
      }

      :is(.dark #theme-starter .sticky #navbarCollapse li > a) {
        --tw-text-opacity: 1;
        color: rgb(0 0 0 / var(--tw-text-opacity)) !important;
      }

      :is(.dark #theme-starter .sticky #navbarCollapse li > a:hover) {
        --tw-text-opacity: 1;
        color: rgb(55 88 249 / var(--tw-text-opacity));
      }

      /* Menu 按钮在深色模式下也始终保持黑色 */
      :is(.dark #theme-starter #navbarCollapse li > button),
      :is(.dark #theme-starter .sticky #navbarCollapse li > button) {
        --tw-text-opacity: 1;
        color: rgb(0 0 0 / var(--tw-text-opacity)) !important;
      }

      /* 深色模式下汉堡菜单按钮也保持黑色 */
      :is(.dark #theme-starter #navbarToggler span),
      :is(.dark #theme-starter .sticky #navbarToggler span) {
        background-color: rgb(0 0 0) !important;
      }

      /* 移动端菜单强制显示和定位 */
      @media (max-width: 1023px) {
        #theme-starter #navbarCollapse {
          position: fixed !important;
          top: 80px !important;
          left: 1rem !important;
          right: 1rem !important;
          z-index: 9999 !important;
          background: white !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
          border: 1px solid #e5e7eb !important;
        }

        #theme-starter #navbarCollapse.block {
          display: block !important;
        }

        #theme-starter #navbarCollapse.hidden {
          display: none !important;
        }

        /* 汉堡菜单按钮强制可见 */
        #theme-starter #navbarToggler {
          background: rgba(255, 255, 255, 0.9) !important;
          border-radius: 0.5rem !important;
          padding: 0.5rem !important;
          z-index: 10000 !important;
          position: relative !important;
        }

        #theme-starter #navbarToggler span {
          background-color: rgb(0, 0, 0) !important;
        }

        /* 移动端菜单项样式调整 */
        #theme-starter #navbarCollapse ul li a,
        #theme-starter #navbarCollapse ul li button {
          text-align: center !important;
          justify-content: center !important;
          display: flex !important;
          align-items: center !important;
          padding-top: 0.75rem !important;
          padding-bottom: 0.75rem !important;
        }

        /* 移动端子菜单容器居中 */
        #theme-starter #navbarCollapse .submenu {
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: 90% !important;
          max-width: 250px !important;
        }

        /* 移动端子菜单项也居中 */
        #theme-starter #navbarCollapse .submenu a {
          text-align: center !important;
          justify-content: center !important;
          display: flex !important;
          align-items: center !important;
        }

        #theme-starter #navbarCollapse .submenu span {
          text-align: center !important;
          width: 100% !important;
          margin-left: 0 !important;
          display: block !important;
        }
      }

      /* 移动端菜单布局辅助样式 */
      @media (max-width: 1023px) {
        #theme-starter #navbarCollapse {
          z-index: 60 !important;
        }
      }

      #navbarCollapse li .ud-menu-scroll.active {
        opacity: 0.7;
      }

      #theme-starter .sticky #navbarCollapse li .ud-menu-scroll.active {
        --tw-text-opacity: 1;
        color: rgb(55 88 249 / var(--tw-text-opacity));
        opacity: 1;
      }

      #theme-starter .sticky .loginBtn {
        --tw-text-opacity: 1;
        color: rgb(17 25 40 / var(--tw-text-opacity));
      }

      #theme-starter .sticky .loginBtn:hover {
        --tw-text-opacity: 1;
        color: rgb(55 88 249 / var(--tw-text-opacity));
        opacity: 1;
      }

      :is(.dark #theme-starter .sticky .loginBtn) {
        --tw-text-opacity: 1;
        color: rgb(255 255 255 / var(--tw-text-opacity));
      }

      :is(.dark #theme-starter .sticky .loginBtn:hover) {
        --tw-text-opacity: 1;
        color: rgb(55 88 249 / var(--tw-text-opacity));
      }

      #theme-starter .sticky .signUpBtn {
        --tw-bg-opacity: 1;
        background-color: rgb(55 88 249 / var(--tw-bg-opacity));
        --tw-text-opacity: 1;
        color: rgb(255 255 255 / var(--tw-text-opacity));
      }

      #theme-starter .sticky .signUpBtn:hover {
        --tw-bg-opacity: 1;
        background-color: rgb(27 68 200 / var(--tw-bg-opacity));
        --tw-text-opacity: 1;
        color: rgb(255 255 255 / var(--tw-text-opacity));
      }

      #theme-starter .sticky #themeSwitcher ~ span {
        --tw-text-opacity: 1;
        color: rgb(17 25 40 / var(--tw-text-opacity));
      }

      :is(.dark #theme-starter .sticky #themeSwitcher ~ span) {
        --tw-text-opacity: 1;
        color: rgb(255 255 255 / var(--tw-text-opacity));
      }

      .navbarTogglerActive > span:nth-child(1) {
        top: 7px;
        --tw-rotate: 45deg;
        transform: translate(var(--tw-translate-x), var(--tw-translate-y))
          rotate(var(--tw-rotate)) skewX(var(--tw-skew-x))
          skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x))
          scaleY(var(--tw-scale-y));
      }

      .navbarTogglerActive > span:nth-child(2) {
        opacity: 0;
      }

      .navbarTogglerActive > span:nth-child(3) {
        top: -8px;
        --tw-rotate: 135deg;
        transform: translate(var(--tw-translate-x), var(--tw-translate-y))
          rotate(var(--tw-rotate)) skewX(var(--tw-skew-x))
          skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x))
          scaleY(var(--tw-scale-y));
      }

      .text-body-color {
        --tw-text-opacity: 1;
        color: rgb(99 115 129 / var(--tw-text-opacity));
      }

      .text-body-secondary {
        --tw-text-opacity: 1;
        color: rgb(136 153 168 / var(--tw-text-opacity));
      }

      .common-carousel .swiper-button-next:after,
      .common-carousel .swiper-button-prev:after {
        display: none;
      }

      /* 代码字体配置 - FiraCode */
      code,
      pre,
      .notion-code,
      .prism-code,
      .token,
      .hljs,
      .shiki,
      .shiki code,
      .shiki pre,
      .markdown-body pre,
      .markdown-body code,
      .markdown-body .highlight pre,
      .markdown-body .highlight code,
      .md-fences,
      .cm-editor,
      .CodeMirror,
      .cm-content,
      kbd,
      samp,
      tt,
      var {
        font-family: 'Fira Code', 'JetBrains Mono', 'SF Mono', Monaco,
          Inconsolata, 'Liberation Mono', Menlo, Consolas, 'Courier New',
          monospace !important;
        font-feature-settings:
          'liga' 1,
          'calt' 1;
        font-variant-ligatures: contextual;
      }

      /* 增加整体留白 */
      .container {
        max-width: 1200px;
      }

      /* 确保内容区域有足够的留白 */
      #main-wrapper {
        max-width: 100%;
        margin: 0 auto;
      }

      /* 社交媒体按钮统一样式 */
      .social-btn {
        width: 2.25rem;
        height: 2.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        background-color: #000000;
        color: #ffffff;
        transition: all 0.3s;
        transform: scale(1);
      }

      .social-btn:hover {
        background-color: #374151;
        transform: scale(1.1);
      }

      .social-btn i {
        font-size: 0.875rem;
      }

      @media (min-width: 640px) {
        .social-btn {
          width: 2.5rem;
          height: 2.5rem;
        }

        .social-btn i {
          font-size: 1.125rem;
        }
      }

      .common-carousel .swiper-button-next,
      .common-carousel .swiper-button-prev {
        position: static !important;
        margin: 0px;
        height: 3rem;
        width: 3rem;
        border-radius: 0.5rem;
        --tw-bg-opacity: 1;
        background-color: rgb(255 255 255 / var(--tw-bg-opacity));
        --tw-text-opacity: 1;
        color: rgb(17 25 40 / var(--tw-text-opacity));
        --tw-shadow: 0px 8px 15px 0px rgba(72, 72, 138, 0.08);
        --tw-shadow-colored: 0px 8px 15px 0px var(--tw-shadow-color);
        box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
          var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
        transition-duration: 200ms;
        transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
      }

      .common-carousel .swiper-button-next:hover,
      .common-carousel .swiper-button-prev:hover {
        --tw-bg-opacity: 1;
        background-color: rgb(55 88 249 / var(--tw-bg-opacity));
        --tw-text-opacity: 1;
        color: rgb(255 255 255 / var(--tw-text-opacity));
        --tw-shadow: 0 0 #0000;
        --tw-shadow-colored: 0 0 #0000;
        box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
          var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
      }

      :is(.dark .common-carousel .swiper-button-next),
      :is(.dark .common-carousel .swiper-button-prev) {
        --tw-bg-opacity: 1;
        background-color: rgb(17 25 40 / var(--tw-bg-opacity));
        --tw-text-opacity: 1;
        color: rgb(255 255 255 / var(--tw-text-opacity));
      }

      .common-carousel .swiper-button-next svg,
      .common-carousel .swiper-button-prev svg {
        height: auto;
        width: auto;
      }
    `}</style>
  )
}

export { Style }
