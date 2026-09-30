import { createClient } from './supabase/client'

const FLOGGERS_BOT_ID = '00000000-0000-0000-0000-000000000001'

export async function ensureWelcomeMessage(userId: string) {
  const supabase = createClient()

  // Check if user already has a welcome conversation
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq('is_system', true)
    .maybeSingle()

  if (existing) return // Already has welcome message

  // Create welcome conversation
  const { data: conv } = await supabase
    .from('conversations')
    .insert({
      user1_id: FLOGGERS_BOT_ID,
      user2_id: userId,
      is_system: true
    })
    .select()
    .single()

  if (!conv) return

  // Send welcome message
  await supabase
    .from('messages')
    .insert({
      conversation_id: conv.id,
      sender_id: FLOGGERS_BOT_ID,
      content: `Welcome to Floggers! 👋

We're the premier marketplace for handcrafted BDSM gear — floggers, paddles, restraints, and more.

**Getting Started:**
• Browse products from verified independent makers
• Read community reviews before you buy
• Message makers directly with questions

**Community Guidelines:**
• All makers are identity-verified
• Discreet shipping on every order
• Leave honest reviews to help the community

**Your Account:**
Your shop application is being reviewed. You'll be able to list products once approved. In the meantime, explore the marketplace and favorite items you love!

Happy exploring! 🔥`,
      read: false
    })
}
