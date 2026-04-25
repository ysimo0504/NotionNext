import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function TodoOAuthCallback() {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return
    const query = new URLSearchParams(router.query).toString()
    window.location.href = 'com.simo54.todo://oauth' + (query ? '?' + query : '')
  }, [router.isReady, router.query])

  return null
}
