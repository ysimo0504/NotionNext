import { useGlobal } from '@/lib/global'
import { useRouter } from 'next/router'
import { useImperativeHandle, useRef, useState } from 'react'

let lock = false

/**
 * 搜索输入框
 * @param {*} param0
 * @returns
 */
const SearchInput = ({ currentTag, keyword, cRef, isHeader = false }) => {
  const { locale } = useGlobal()
  const router = useRouter()
  const searchInputRef = useRef(null)
  useImperativeHandle(cRef, () => {
    return {
      focus: () => {
        searchInputRef?.current?.focus()
      }
    }
  })
  const handleSearch = () => {
    const key = searchInputRef.current.value
    if (key && key !== '') {
      router.push({ pathname: '/search/' + key }).then(r => {})
    } else {
      router.push({ pathname: '/' }).then(r => {})
    }
  }
  const handleKeyUp = e => {
    if (e.keyCode === 13) {
      // 回车
      handleSearch(searchInputRef.current.value)
    } else if (e.keyCode === 27) {
      // ESC
      cleanSearch()
    }
  }
  const cleanSearch = () => {
    searchInputRef.current.value = ''
    setShowClean(false)
  }
  function lockSearchInput() {
    lock = true
  }

  function unLockSearchInput() {
    lock = false
  }
  const [showClean, setShowClean] = useState(false)
  const updateSearchKey = val => {
    if (lock) {
      return
    }
    searchInputRef.current.value = val
    if (val) {
      setShowClean(true)
    } else {
      setShowClean(false)
    }
  }

  // Header 中的样式
  if (isHeader) {
    return (
      <section className='flex w-full bg-white/20 backdrop-blur-sm rounded-lg border border-white/30'>
        <input
          ref={searchInputRef}
          type='text'
          placeholder={
            currentTag
              ? `${locale.SEARCH.TAGS} #${currentTag}`
              : `${locale.SEARCH.ARTICLES}`
          }
          className='outline-none w-full text-sm pl-4 pr-2 py-2 bg-transparent placeholder-white/70 text-white rounded-l-lg'
          onKeyUp={handleKeyUp}
          onCompositionStart={lockSearchInput}
          onCompositionUpdate={lockSearchInput}
          onCompositionEnd={unLockSearchInput}
          onChange={e => updateSearchKey(e.target.value)}
          defaultValue={keyword || ''}
        />

        <div
          className='cursor-pointer flex items-center justify-center px-3 hover:bg-white/10 rounded-r-lg transition-colors duration-200'
          onClick={handleSearch}>
          <i className='text-white/80 hover:text-white cursor-pointer fas fa-search text-sm' />
        </div>

        {showClean && (
          <div className='cursor-pointer flex items-center justify-center px-2 hover:bg-red-500/20 transition-colors duration-200'>
            <i
              className='text-white/60 hover:text-white cursor-pointer fas fa-times text-sm'
              onClick={cleanSearch}
            />
          </div>
        )}
      </section>
    )
  }

  // 默认样式（用于其他页面）
  return (
    <section className='flex w-full bg-gray-100'>
      <input
        ref={searchInputRef}
        type='text'
        placeholder={
          currentTag
            ? `${locale.SEARCH.TAGS} #${currentTag}`
            : `${locale.SEARCH.ARTICLES}`
        }
        className={
          'outline-none w-full text-sm pl-4 transition focus:shadow-lg font-light leading-10 text-black bg-gray-100 dark:bg-gray-900 dark:text-white'
        }
        onKeyUp={handleKeyUp}
        onCompositionStart={lockSearchInput}
        onCompositionUpdate={lockSearchInput}
        onCompositionEnd={unLockSearchInput}
        onChange={e => updateSearchKey(e.target.value)}
        defaultValue={keyword || ''}
      />

      <div
        className='-ml-8 cursor-pointer float-right items-center justify-center py-2'
        onClick={handleSearch}>
        <i
          className={
            'hover:text-black transform duration-200  text-gray-500 cursor-pointer fas fa-search'
          }
        />
      </div>

      {showClean && (
        <div className='-ml-12 cursor-pointer dark:bg-gray-600 dark:hover:bg-gray-800 float-right items-center justify-center py-2'>
          <i
            className='hover:text-black transform duration-200 text-gray-400 cursor-pointer fas fa-times'
            onClick={cleanSearch}
          />
        </div>
      )}
    </section>
  )
}

export default SearchInput
