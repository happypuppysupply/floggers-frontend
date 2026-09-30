import { createClient } from './supabase/client'
import { AI_BOT_ID } from './ai'

export async function ensureWelcomeMessage(userId: string) {
  const supabase = createClient()

  // Check if user already has a conversation with the AI bot
  const { data: existingConv } = await supabase
    .from('conversations')
    .select('id')
    .or(
      `and(user1_id.eq.${userId},user2_id.eq.${AI_BOT_ID}),and(user1_id.eq.${AI_BOT_ID},user2_id.eq.${userId})`
    )
    .maybeSingle()

  // If they already have an AI conversation, skip
  if (existingConv) return

  // Create AI conversation (bot is user2, new user is user1)
  const { data: conv } = await supabase
    .from('conversations')
    .insert({
      user1_id: userId,
      user2_id: AI_BOT_ID
    })
    .select()
    .single()

  if (!conv) return

  // Send welcome message from AI
  await supabase
    .from('messages')
    .insert({
      conversation_id: conv.id,
      sender_id: AI_BOT_ID,
      content: `Welcome to Floggers! 👋 I'm your AI assistant, here to help you navigate the marketplace.

**I can help you with:**
• How to browse and buy products
• How to become a seller
• Product recommendations
• Community guidelines
• Troubleshooting

Just send me a message anytime! I'm always here to help.

Happy exploring! 🔥`,
      read: false
    })
}
