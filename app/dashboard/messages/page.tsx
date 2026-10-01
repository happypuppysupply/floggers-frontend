'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, User, Search, MoreVertical, Loader2, MessageSquare, Bot } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { AI_BOT_ID, AI_BOT_NAME, AI_BOT_AVATAR, isAIUser, sendMessageToAI } from '@/lib/ai'

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender?: {
    first_name?: string;
    last_name?: string;
  };
}

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  updated_at: string;
  other_user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
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
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Load conversations and auto-create AI conversation if needed
  useEffect(() => {
    if (!user) return
    
    const init = async () => {
      await loadConversations()
      
      // Check if AI conversation exists, if not create it
      const supabase = createClient()
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(
          `and(user1_id.eq.${user.id},user2_id.eq.${AI_BOT_ID}),and(user1_id.eq.${AI_BOT_ID},user2_id.eq.${user.id})`
        )
        .maybeSingle()
      
      if (!existingConv) {
        // Create AI conversation with welcome message
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({ user1_id: user.id, user2_id: AI_BOT_ID })
          .select()
          .single()
        
        if (newConv) {
          await supabase.from('messages').insert({
            conversation_id: newConv.id,
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
          
          // Reload conversations to show the new AI chat
          await loadConversations()
        }
      }
    }
    
    init()
  }, [user])

  // Subscribe to messages
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
      // Fetch other user details for each conversation
      const enriched = await Promise.all(
        data.map(async (conv) => {
          const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id
          
          // Handle AI bot
          if (isAIUser(otherUserId)) {
            return {
              ...conv,
              other_user: {
                first_name: AI_BOT_NAME,
                last_name: '',
                email: 'assistant@floggers.com',
                avatar_url: AI_BOT_AVATAR
              }
            }
          }
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', otherUserId)
            .single()
          
          return {
            ...conv,
            other_user: profile || undefined
          }
        })
      )
      
      setConversations(enriched)
      if (enriched.length > 0 && !activeId) {
        setActiveId(enriched[0].id)
      }
    }
    
    setLoading(false)
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
        sender:profiles(first_name, last_name)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(data)
    }
  }

  const [aiLoading, setAiLoading] = useState(false)

  const activeConversation = conversations.find(c => c.id === activeId)
  const isAIConversation = activeConversation ? isAIUser(
    activeConversation.user1_id === user?.id ? activeConversation.user2_id : activeConversation.user1_id
  ) : false

  const sendMessage = async () => {
    if (!input.trim() || !activeId || !user) return

    const content = input.trim()
    setInput('')

    // Save user message
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeId,
        sender_id: user.id,
        content: content
      })

    if (error) {
      console.error('Failed to send message:', error)
      return
    }

    // If this is an AI conversation, get AI response
    if (isAIConversation) {
      setAiLoading(true)
      try {
        const aiResponse = await sendMessageToAI(content, activeId)
        // AI response is already saved by the API route
      } catch (err) {
        console.error('AI response failed:', err)
        // Show error in chat
        await supabase.from('messages').insert({
          conversation_id: activeId,
          sender_id: AI_BOT_ID,
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          read: false
        })
      } finally {
        setAiLoading(false)
      }
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const filteredConversations = conversations.filter(c => {
    if (!search) return true
    const name = `${c.other_user?.first_name || ''} ${c.other_user?.last_name || ''}`.toLowerCase()
    return name.includes(search.toLowerCase())
  })

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
    <div className="p-0">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-80 border-r border-noir-800/50 flex flex-col">
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

          {/* AI Assistant Button */}
          <div className="p-3 border-b border-noir-800/30">
            <button
              onClick={async () => {
                if (!user) return
                const supabase = createClient()
                
                // Check if AI conversation exists
                const { data: existingConv } = await supabase
                  .from('conversations')
                  .select('id')
                  .or(
                    `and(user1_id.eq.${user.id},user2_id.eq.${AI_BOT_ID}),and(user1_id.eq.${AI_BOT_ID},user2_id.eq.${user.id})`
                  )
                  .maybeSingle()
                
                if (existingConv) {
                  setActiveId(existingConv.id)
                } else {
                  // Create new AI conversation
                  const { data: newConv } = await supabase
                    .from('conversations')
                    .insert({ user1_id: user.id, user2_id: AI_BOT_ID })
                    .select()
                    .single()
                  
                  if (newConv) {
                    // Send welcome message
                    await supabase.from('messages').insert({
                      conversation_id: newConv.id,
                      sender_id: AI_BOT_ID,
                      content: `Welcome to Floggers! 👋 I'm your AI assistant, here to help you navigate the marketplace.\n\n**I can help you with:**\n• How to browse and buy products\n• How to become a seller\n• Product recommendations\n• Community guidelines\n• Troubleshooting\n\nJust send me a message anytime! I'm always here to help.\n\nHappy exploring! 🔥`,
                      read: false
                    })
                    
                    // Reload conversations
                    await loadConversations()
                    setActiveId(newConv.id)
                  }
                }
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-noir-800/30 border border-noir-700/50 hover:bg-noir-800/50 hover:border-rose/30 transition-colors text-left group"
            >
              <img 
                src={AI_BOT_AVATAR} 
                alt="" 
                className="w-10 h-10 rounded-full object-cover shrink-0 border border-noir-700 group-hover:border-rose/50"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-noir-200 flex items-center gap-2">
                  <span className="text-rose">🤖</span>
                  {AI_BOT_NAME}
                </p>
                <p className="text-xs text-rose/70">Click to start chatting</p>
              </div>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-noir-400 text-sm">
                No messages yet
              </div>
            ) : (
              filteredConversations.map(c => {
                const isAI = isAIUser(c.user1_id === user?.id ? c.user2_id : c.user1_id)
                const avatarUrl = c.other_user?.avatar_url
                return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`w-full flex items-center gap-3 p-4 border-b border-noir-800/30 hover:bg-noir-800/20 transition-colors text-left ${activeId === c.id ? 'bg-noir-800/30' : ''}`}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 border border-noir-700" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-noir-700 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-noir-200">
                        {(c.other_user?.first_name?.[0] || c.other_user?.email?.[0] || '?').toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-noir-200 truncate">
                      {isAI && <span className="text-rose mr-1">🤖</span>}
                      {c.other_user?.first_name || c.other_user?.email?.split('@')[0] || 'Unknown'}
                    </p>
                    <p className="text-xs text-noir-500 truncate">
                      {new Date(c.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              )
            })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-noir-800/50">
                <div className="flex items-center gap-3">
                  {activeConversation.other_user?.avatar_url ? (
                    <img src={activeConversation.other_user.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-noir-700" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-noir-700 flex items-center justify-center">
                      <span className="text-sm font-medium text-noir-200">
                        {(activeConversation.other_user?.first_name?.[0] || activeConversation.other_user?.email?.[0] || '?').toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-noir-200 flex items-center gap-2">
                      {isAIConversation && <span className="text-rose">🤖</span>}
                      {activeConversation.other_user?.first_name || activeConversation.other_user?.email?.split('@')[0] || 'Unknown'}
                    </p>
                    {isAIConversation && <p className="text-[10px] text-rose/70">AI Assistant</p>}
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-noir-800 text-noir-400 hover:text-noir-200 transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                        <p className="leading-relaxed">{msg.content}</p>
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
              <div className="p-4 border-t border-noir-800/50">
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
