'use client'

import { useState } from 'react'
import { MessageSquare, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ProductData {
  id: string
  name: string
  price: number
  image_url?: string
  description?: string
  materials?: string[]
  shipping_cost?: number
  shipping_time_min?: number
  shipping_time_max?: number
  free_shipping_over?: number
}

interface MessageMakerButtonProps {
  makerId: string
  makerName: string
  productName?: string
  product?: ProductData
}

export default function MessageMakerButton({ makerId, makerName, productName, product }: MessageMakerButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleMessage = async () => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }

    setLoading(true)

    try {
      // Look up the maker's profile_id (auth user UUID) from makers table
      const { data: maker, error: makerError } = await supabase
        .from('makers')
        .select('id, profile_id, name')
        .eq('id', makerId)
        .maybeSingle()

      if (makerError || !maker?.profile_id) {
        console.error('Failed to find maker profile:', makerError, { makerId, maker })
        alert('Could not find maker. This product may not have an associated maker account.')
        setLoading(false)
        return
      }

      const makerProfileId = maker.profile_id

      if (user.id === makerProfileId) {
        alert('You cannot message yourself')
        setLoading(false)
        return
      }

      // Find existing conversation with the maker
      const { data: existingConvs } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${makerProfileId}),and(user1_id.eq.${makerProfileId},user2_id.eq.${user.id})`)
        .limit(1)

      let conversationId: string
      let isNewConversation = false

      if (existingConvs && existingConvs.length > 0) {
        conversationId = existingConvs[0].id
      } else {
        // Create new conversation with the maker's profile_id
        isNewConversation = true
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({ user1_id: user.id, user2_id: makerProfileId })
          .select('id')
          .single()

        if (error) {
          console.error('Error creating conversation:', error)
          setLoading(false)
          return
        }
        conversationId = newConv.id
      }

      // ALWAYS send product context message when clicking from a product
      // This ensures the product card shows up even in existing conversations
      if (product) {
        const contextMessage = `I'm interested in this product:`
        
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: contextMessage,
          read: false,
          product_id: product.id,
          metadata: {
            type: 'product_context',
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              image_url: product.image_url,
              description: product.description,
              materials: product.materials,
              shipping_cost: product.shipping_cost,
              shipping_time_min: product.shipping_time_min,
              shipping_time_max: product.shipping_time_max,
              free_shipping_over: product.free_shipping_over,
              maker_name: makerName
            }
          }
        })
      }

      // Send welcome message only for NEW conversations
      if (isNewConversation) {
        const welcomeMessage = productName 
          ? `Hi! Thanks for your interest in "${productName}". How can I help you today?`
          : `Hi! Thanks for reaching out about my products. How can I help you today?`
        
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: makerProfileId,
          content: welcomeMessage,
          read: false,
        })
      }

      router.push(`/chat?conversation=${conversationId}`)
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
