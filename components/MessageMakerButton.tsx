'use client'

import { useState } from 'react'
import { MessageSquare, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface MessageMakerButtonProps {
  makerId: string
  makerName: string
}

export default function MessageMakerButton({ makerId, makerName }: MessageMakerButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleMessage = async () => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }

    if (user.id === makerId) {
      alert('You cannot message yourself')
      return
    }

    setLoading(true)

    try {
      // Find existing conversation
      const { data: existingConvs } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${makerId}),and(user1_id.eq.${makerId},user2_id.eq.${user.id})`)
        .limit(1)

      let conversationId: string

      if (existingConvs && existingConvs.length > 0) {
        conversationId = existingConvs[0].id
      } else {
        // Create new conversation
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({ user1_id: user.id, user2_id: makerId })
          .select('id')
          .single()

        if (error) {
          console.error('Error creating conversation:', error)
          setLoading(false)
          return
        }
        conversationId = newConv.id

        // Send welcome message from maker
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: makerId,
          content: `Hi! Thanks for reaching out about my products. How can I help you today?`,
          read: false,
        })
      }

      router.push(`/dashboard/messages?conversation=${conversationId}`)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleMessage}
      disabled={loading}
      className="flex-1 btn-secondary text-sm inline-flex items-center justify-center gap-2"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <MessageSquare size={16} />
      )}
      Message maker
    </button>
  )
}
