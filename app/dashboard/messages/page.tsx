'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Search, MoreVertical, Loader2, MessageSquare, ChevronLeft } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { AI_BOT_ID, AI_BOT_NAME, AI_BOT_AVATAR, isAIUser, sendMessageToAI } from '@/lib/ai'

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  updated_at: string;
  other_user?: {
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Load conversations once on mount
  useEffect(() => {
    if (!user) return
    loadConversations()
  }, [user])

  // Subscribe to messages for active conversation
  useEffect(() => {
    if (!activeId) return

    const channel = supabase
      .channel(`messages:${activeId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeId}`
      }, (payload) => {
        const newMsg = payload.new as Message
        setMessages(prev => [...prev, newMsg])
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [activeId])

  const loadConversations = async () => {
    if (!user) return
    
    setLoading(true)
    
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('updated_at', { ascending: false })

    if (data) {
      // Check if AI conversation exists
      const hasAIConversation = data.some(c =>
        c.user1_id === AI_BOT_ID || c.user2_id === AI_BOT_ID
      )
      
      // Create AI conversation if missing
      if (!hasAIConversation) {
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({ user1_id: user.id, user2_id: AI_BOT_ID })
          .select()
          .single()
        
        if (newConv) {
          await supabase.from('messages').insert({
            conversation_id: newConv.id,
            sender_id: AI_BOT_ID,
            content: `Welcome to Floggers! 👋 I'm your AI assistant, here to help you navigate the marketplace.\n\n**I can help you with:**\n• How to browse and buy products\n• How to become a seller\n• Product recommendations\n• Community guidelines\n• Troubleshooting\n\nJust send me a message anytime! I'm always here to help.\n\nHappy exploring! 🔥`,
            read: false
          })
          
          // Reload to include new AI conversation
          const { data: updatedData } = await supabase
            .from('conversations')
            .select('*')
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
            .order('updated_at', { ascending: false })
          
          if (updatedData) {
            const enriched = await enrichConversations(updatedData)
            setConversations(enriched)
          }
        }
      } else {
        const enriched = await enrichConversations(data)
        setConversations(enriched)
      }
    }
    
    setLoading(false)
  }

  const enrichConversations = async (data: any[]) => {
    return await Promise.all(
      data.map(async (conv) => {
        const otherUserId = conv.user1_id === user?.id ? conv.user2_id : conv.user1_id
        
        // Handle AI bot
        if (isAIUser(otherUserId)) {
          return {
            ...conv,
            other_user: {
              full_name: AI_BOT_NAME,
              email: 'assistant@floggers.com',
              avatar_url: AI_BOT_AVATAR
            }
          }
        }
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, avatar_url')
          .eq('id', otherUserId)
          .single()
        
        return {
          ...conv,
          other_user: profile || undefined
        }
      })
    )
  }

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeId || !user) return
    loadMessages(activeId)
  }, [activeId])

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(full_name)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(data)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !activeId || !user) return

    const content = input.trim()
    setInput('')

    // Save to DB
    const { data: newMessage, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeId,
        sender_id: user.id,
        content: content
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to send message:', error)
      return
    }

    // Add to UI
    if (newMessage) {
      setMessages(prev => [...prev, newMessage])
    }

    // Check if this is AI conversation
    const activeConv = conversations.find(c => c.id === activeId)
    if (activeConv) {
      const otherId = activeConv.user1_id === user.id ? activeConv.user2_id : activeConv.user1_id
      if (isAIUser(otherId)) {
        setAiLoading(true)
        try {
          const aiResponse = await sendMessageToAI(content, activeId)
          // Response stored by API + realtime subscription picks it up
        } catch (err) {
          console.error('AI response failed:', err)
          setMessages(prev => [...prev, {
            id: `err-${Date.now()}`,
            sender_id: AI_BOT_ID,
            content: "I'm having trouble connecting right now. Please try again in a moment.",
            created_at: new Date().toISOString(),
            read: false
          }])
        } finally {
          setAiLoading(false)
        }
      }
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const filteredConversations = conversations.filter(c => {
    if (!search) return true
    const name = `${c.other_user?.full_name || ''}`.toLowerCase()
    return name.includes(search.toLowerCase())
  })

  const activeConversation = conversations.find(c => c.id === activeId)
  const isAIConversation = activeConversation ? isAIUser(
    activeConversation.user1_id === user?.id ? activeConversation.user2_id : activeConversation.user1_id
  ) : false

  if (loading) {
    return (
      <div className="p-0">
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 size={32} className="text-rose animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-0 h-[calc(100vh-4rem)]">
      <div className="flex h-full">
        {/* Sidebar - Conversations List */}
        <div className={`
          w-full md:w-80 border-r border-noir-800/50 flex flex-col h-full overflow-hidden
          ${showMobileChat ? 'hidden md:flex' : 'flex'}
        `}>
          <div className="p-4 border-b border-noir-800/50">
            <h1 className="font-serif italic text-xl text-noir-50 mb-3">Messages</h1>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-500" />
              <input
                type="text"
                placeholder="Search messages..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-noir-900 border border-noir-800 rounded-lg pl-9 pr-3 py-2 text-sm text-noir-100 placeholder:text-noir-500 focus:outline-none focus:border-rose/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-noir-400 text-sm">
                No messages yet
              </div>
            ) : (
              filteredConversations.map(c => {
                const isAI = isAIUser(c.user1_id === user?.id ? c.user2_id : c.user1_id)
                return (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveId(c.id)
                    setShowMobileChat(true)
                  }}
                  className={`w-full flex items-center gap-3 p-4 border-b border-noir-800/30 hover:bg-noir-800/20 transition-colors text-left ${activeId === c.id ? 'bg-noir-800/30' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-noir-700 flex items-center justify-center shrink-0 overflow-hidden">
                    {isAI ? (
                      <span className="text-lg">🤖</span>
                    ) : (
                      <span className="text-sm font-medium text-noir-200">
                        {(c.other_user?.full_name?.[0] || '?').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-noir-200 truncate">
                      {isAI && <span className="text-rose mr-1">🤖</span>}
                      {c.other_user?.full_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-noir-500 truncate">
                      {new Date(c.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              )
            })
            }
          </div>
        </div>

        {/* Chat Area */}
        <div className={`
          flex-1 flex flex-col h-full overflow-hidden
          ${showMobileChat ? 'flex' : 'hidden md:flex'}
        `}>
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-noir-800/50">
                <div className="flex items-center gap-3">
                  {/* Back button for mobile */}
                  <button 
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-2 -ml-2 text-noir-400 hover:text-noir-200"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-noir-700 flex items-center justify-center">
                    {isAIConversation ? (
                      <span className="text-sm">🤖</span>
                    ) : (
                      <span className="text-sm font-medium text-noir-200">
                        {(activeConversation.other_user?.full_name?.[0] || '?').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-noir-200">
                      {isAIConversation && <span className="text-rose mr-1">🤖</span>}
                      {activeConversation.other_user?.full_name || 'Unknown'}
                    </p>
                    {isAIConversation && <p className="text-[10px] text-rose/70">AI Assistant</p>}
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-noir-800 text-noir-400 hover:text-noir-200 transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.length === 0 ? (
                  <div className="text-center text-noir-500 py-12">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm ${
                        msg.sender_id === user?.id
                          ? 'bg-rose-dark text-noir-50 rounded-br-md'
                          : 'bg-noir-800 text-noir-200 rounded-bl-md'
                      }`}>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? 'text-rose/60' : 'text-noir-500'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[70%] px-4 py-3 rounded-2xl bg-noir-800 text-noir-200 rounded-bl-md flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-rose" />
                      <span className="text-sm">Assistant is typing...</span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-noir-800/50 flex-shrink-0">
                <div className="flex items-end gap-2">
                  <div className="flex-1 bg-noir-900 border border-noir-700 rounded-2xl px-4 py-2.5">
                    <textarea
                      rows={1}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      placeholder="Type a message..."
                      className="w-full bg-transparent text-sm text-noir-100 placeholder:text-noir-500 focus:outline-none resize-none"
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="p-2.5 rounded-xl bg-rose-dark hover:bg-rose text-noir-50 disabled:opacity-30 transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-noir-400">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
