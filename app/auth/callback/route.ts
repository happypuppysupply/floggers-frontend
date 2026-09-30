import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  console.log('Auth callback hit:', { code: code?.slice(0, 10), error, origin })

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || '')}`
    )
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  // CRITICAL FIX: Collect cookies first, build response ONCE at the end
  // Previously we created a response, set cookies, then created a NEW response
  // which dropped all the cookies!
  let allCookies: {name: string, value: string, options?: any}[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          console.log('Supabase setting cookies:', cookiesToSet.map(c => c.name))
          allCookies.push(...cookiesToSet)
        },
      },
    }
  )

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  
  if (exchangeError) {
    console.error('Exchange error:', exchangeError)
    return NextResponse.redirect(
      `${origin}/login?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`
    )
  }

  const { data: { user } } = await supabase.auth.getUser()
  console.log('User:', user?.id)
  
  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=no_user`)
  }
  
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle()
  
  const redirectTo = existingProfile?.role === 'maker' ? '/dashboard' : '/'
  console.log('Redirect to:', redirectTo, 'Profile:', existingProfile)

  // Build response ONCE with correct redirect AND all cookies
  const response = NextResponse.redirect(`${origin}${redirectTo}`, { status: 302 })
  allCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })
  
  console.log('Response cookies:', [...response.cookies.getAll()].map(c => c.name))
  return response
}
