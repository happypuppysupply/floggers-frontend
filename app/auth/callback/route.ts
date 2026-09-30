import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle Supabase auth errors
  if (error) {
    console.error('OAuth error from provider:', error, errorDescription)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || '')}`
    )
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  // Create response first so we can set cookies on it
  let response = NextResponse.redirect(`${origin}/`, { status: 302 })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  
  if (exchangeError) {
    console.error('Session exchange error:', exchangeError)
    return NextResponse.redirect(
      `${origin}/login?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`
    )
  }

  // Get user after successful exchange
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=no_user_after_exchange`)
  }
  
  // Check if profile exists - if not, user exists in auth but profile creation failed
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle()
  
  // Build redirect URL with profile status
  if (existingProfile) {
    const redirectTo = existingProfile.role === 'maker' ? '/dashboard' : '/'
    response = NextResponse.redirect(`${origin}${redirectTo}`, { status: 302 })
  } else {
    // Profile missing - redirect home, we'll create it client-side
    console.warn('User authenticated but profile missing:', user.id)
    // Add flag so UI can show "Complete profile" prompt
    response = NextResponse.redirect(`${origin}/?setup_profile=true`, { status: 302 })
  }
  
  return response
}
