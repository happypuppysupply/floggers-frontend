import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

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
          // Set cookies on BOTH request and response
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  
  if (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed&message=${encodeURIComponent(error.message)}`)
  }

  // Get user after successful exchange
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=no_user`)
  }
  
  // Ensure profile exists (handle OAuth users where trigger might not have fired)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single()
  
  if (!existingProfile) {
    // Profile doesn't exist - create it
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        role: 'buyer'
      })
    
    if (insertError) {
      console.error('Profile creation error:', insertError)
      return NextResponse.redirect(`${origin}/login?error=profile_creation_failed`)
    }
    
    // New buyer - redirect to home
    response = NextResponse.redirect(`${origin}/`, { status: 302 })
    return response
  }
  
  // Redirect based on role
  const redirectTo = existingProfile.role === 'maker' ? '/dashboard' : '/'
  response = NextResponse.redirect(`${origin}${redirectTo}`, { status: 302 })
  return response
}
