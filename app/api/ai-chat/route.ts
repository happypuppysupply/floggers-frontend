// API route for Floggers AI Assistant
// POST /api/ai-chat - Send message to AI and get response

import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const AI_BOT_ID = '00000000-0000-0000-0000-000000000001'
const AI_BOT_NAME = 'Floggers AI Assistant'

// Multi-prompt system for different contexts
const SYSTEM_PROMPTS: Record<string, string> = {
  default: `You are ${AI_BOT_NAME}, the helpful guide for Floggers — a marketplace for handcrafted BDSM gear.

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
- Never lecture about BDSM practices — focus on the marketplace`,

  identity_verification: `You are ${AI_BOT_NAME}, helping with identity verification for Floggers.

CONTEXT:
- Identity verification is required for all makers selling on the platform
- We use secure third-party verification services
- Process includes: ID upload, selfie verification, phone verification
- Takes 2-3 minutes to complete
- Data is encrypted and secure

Help users:
- Understand why verification is required
- Explain the verification steps
- Troubleshoot verification issues
- Reassure about data security`,

  selling: `You are ${AI_BOT_NAME}, helping makers sell on Floggers.

SELLING CONTEXT:
- Makers must be verified before selling
- Products must comply with community guidelines
- Discreet shipping is required
- Makers set their own prices
- Platform takes a commission on sales

Help with:
- How to list products
- Pricing strategies
- Shipping setup
- Order management
- Payouts and payments
- Product photography tips`,

  community_guidelines: `You are ${AI_BOT_NAME}, explaining Floggers community guidelines.

GUIDELINES OVERVIEW:
1. Respect and Consent - All interactions must be consensual and respectful
2. Discretion - Buyer privacy is paramount, discreet packaging required
3. Safety - Products must be safe for intended use with proper materials
4. Authenticity - All products must be handcrafted by the maker
5. Legal Compliance - All products must comply with local laws
6. No Discrimination - Inclusive community, no harassment tolerated

Explain these guidelines clearly and professionally.`,

  share_profile: `You are ${AI_BOT_NAME}, helping users share their maker profile.

SHARING FEATURES:
- Each maker has a unique profile URL
- Profiles can be shared on social media
- Profile includes: bio, products, reviews, ratings
- Share button available in dashboard settings
- Helps makers promote their shop

Help users:
- Find their profile link
- Understand what information is public
- Tips for promoting their shop
- How to customize their profile`}

function detectContext(message: string): string {
  const lowerMsg = message.toLowerCase()
  
  if (lowerMsg.includes('verif') || lowerMsg.includes('identity') || lowerMsg.includes('id')) return 'identity_verification'
  if (lowerMsg.includes('sell') || lowerMsg.includes('product') || lowerMsg.includes('list') || lowerMsg.includes('payout')) return 'selling'
  if (lowerMsg.includes('guideline') || lowerMsg.includes('rule') || lowerMsg.includes('community') || lowerMsg.includes('policy')) return 'community_guidelines'
  if (lowerMsg.includes('share') || lowerMsg.includes('profile link') || lowerMsg.includes('promote')) return 'share_profile'
  
  return 'default'
}

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

    // Detect context and use appropriate prompt
    const context = detectContext(message)
    const systemPrompt = SYSTEM_PROMPTS[context] || SYSTEM_PROMPTS.default

    // Check if API key is configured
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY not configured')
      return NextResponse.json({ 
        response: "I'm temporarily unavailable. Please try again later or contact support." 
      })
    }

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': request.headers.get('origin') || 'https://floggers-frontend.vercel.app',
        'X-Title': 'Floggers AI Assistant',
      },
      body: JSON.stringify({
        model: 'openrouter/moonshotai/kimi-k2.5',
        messages: [
          { role: 'system', content: systemPrompt },
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
