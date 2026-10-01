// API route for Floggers AI Assistant
// POST /api/ai-chat - Send message to AI and get response

import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const AI_BOT_ID = '00000000-0000-0000-0000-000000000001'
const AI_BOT_NAME = 'Floggers AI Assistant'

// System prompt for the AI
const SYSTEM_PROMPT = `You are ${AI_BOT_NAME}, the helpful guide for Floggers — a marketplace for handcrafted BDSM gear including floggers, paddles, restraints, collars, and accessories.

PLATFORM CONTEXT:
- Floggers connects independent makers with buyers interested in BDSM/kink gear
- All makers are identity-verified, products are handcrafted
- Discreet shipping on every order
- Community focuses on quality, safety, and craftsmanship

YOUR ROLE:
- Answer questions about how to use the platform (buying, selling, shipping)
- Explain community guidelines (consent, discretion, respect)
- Offer product recommendations based on user needs/experience level
- Help troubleshoot common issues (account, orders, messaging)
- Be welcoming, non-judgmental, and knowledgeable about BDSM gear

GUIDELINES:
- Keep responses concise (2-4 sentences ideally)
- Be friendly and professional
- Don't make assumptions about user's experience level
- Direct complex issues to human support when needed
- Never lecture about BDSM practices — focus on the marketplace

CURRENT TONE: Helpful, welcoming, slightly playful but always professional.`

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 })
    }

    // Get user session
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set() {}, // Read-only in API route
          remove() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': request.headers.get('origin') || 'https://floggers-frontend.vercel.app',
        'X-Title': 'Floggers AI Assistant',
      },
      body: JSON.stringify({
        model: 'openrouter/moonshotai/kimi-k2.5',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      console.error('OpenRouter error:', error)
      return NextResponse.json(
        { error: 'AI service unavailable. Please try again later.' },
        { status: 502 }
      )
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || 
      "I'm having trouble connecting right now. Please try again in a moment."

    // Store the AI response in Supabase using service role key (bypasses RLS)
    if (conversationId) {
      const serviceSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
      serviceSupabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: AI_BOT_ID,
        content: aiResponse,
        read: false,
      }).then(({ error }) => {
        if (error) console.error('Failed to store AI message:', error)
      })
    }

    return NextResponse.json({ response: aiResponse })

  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
