import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkStrIsNotionId, getLastPartOfUrl } from '@/lib/utils'
import { idToUuid } from 'notion-utils'
import BLOG from './blog.config'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/user/:path*',
    '/admin/:path*',
    '/sign-in/:path*',
    '/sign-up/:path*',
    '/api/:path*'
  ]
}

const isTenantRoute = createRouteMatcher([
  '/user/organization-selector(.*)',
  '/user/orgid/(.*)',
  '/dashboard',
  '/dashboard/(.*)'
])

const isTenantAdminRoute = createRouteMatcher([
  '/admin/(.*)/memberships',
  '/admin/(.*)/domain'
])

// eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const noAuthMiddleware = async (req: NextRequest, ev: any) => {
  return NextResponse.next()
}

const authMiddleware = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ? clerkMiddleware((auth, req) => {
      const { userId } = auth()
      if (isTenantRoute(req)) {
        if (!userId) {
          const url = new URL('/sign-in', req.url)
          url.searchParams.set('redirectTo', req.url)
          return NextResponse.redirect(url)
        }
      }

      if (isTenantAdminRoute(req)) {
        auth().protect(has => {
          return (
            has({ permission: 'org:sys_memberships:manage' }) ||
            has({ permission: 'org:sys_domains_manage' })
          )
        })
      }

      return NextResponse.next()
    })
  : noAuthMiddleware

export default authMiddleware
