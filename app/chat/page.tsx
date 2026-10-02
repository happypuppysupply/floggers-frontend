'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { Send, Search, MoreVertical, Loader2, MessageSquare, ChevronLeft } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AI_BOT_ID, AI_BOT_NAME, AI_BOT_AVATAR, isAIUser, sendMessageToAI } from '@/lib/ai'
import ProductMessageCard from '@/components/ProductMessageCard'

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
  product_id?: string;
  metadata?: {
    type?: string;
    product?: {
      id: string;
      name: string;
      price: number;
      image_url?: string;
      description?: string;
      materials?: string[];
      shipping_cost?: number;
      shipping_time_min?: number;
      shipping_time_max?: number;
      free_shipping_over?: number;
      maker_name?: string;
    };
  };
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

function ChatContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationParam = searchParams.get('conversation')
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

  useEffect(() => {
    if (!user) return
    loadConversations()
  }, [user])

  // Auto-select conversation from URL param
  useEffect(() => {
    if (conversationParam && conversations.length > 0) {
      const conv = conversations.find(c => c.id === conversationParam)
      if (conv) {
        setActiveId(conv.id)
        setShowMobileChat(true)
      }
    }
  }, [conversationParam, conversations])

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

    return () => { channel.unsubscribe() }
  }, [activeId])

  const loadConversations = async () => {
    if (!user) return
    setLoading(true)
    
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('updated_at', { ascending: false })

    if (data) {
      const hasAI = data.some(c => c.user1_id === AI_BOT_ID || c.user2_id === AI_BOT_ID)
      
      if (!hasAI) {
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({ user1_id: user.id, user2_id: AI_BOT_ID })
          .select().single()
        
        if (newConv) {
          await supabase.from('messages').insert({
            conversation_id: newConv.id,
            sender_id: AI_BOT_ID,
            content: `Welcome to Floggers! I'm your AI assistant.`,
            read: false
          })
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
        if (isAIUser(otherUserId)) {
          return {
            ...conv,
            other_user: { full_name: AI_BOT_NAME, email: 'assistant@floggers.com', avatar_url: AI_BOT_AVATAR }
          }
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, avatar_url')
          .eq('id', otherUserId)
          .single()
        return { ...conv, other_user: profile || undefined }
      })
    )
  }

  useEffect(() => {
    if (!activeId || !user) return
    loadMessages(activeId)
  }, [activeId])

  const loadMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select(`*, sender:profiles(full_name)`)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  const sendMessage = async () => {
    if (!input.trim() || !activeId || !user) return
    const content = input.trim()
    setInput('')

    const { data: newMessage } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeId,
        sender_id: user.id,
        content: content
      })
      .select().single()

    if (newMessage) setMessages(prev => [...prev, newMessage])

    const activeConv = conversations.find(c => c.id === activeId)
    if (activeConv) {
      const otherId = activeConv.user1_id === user.id ? activeConv.user2_id : activeConv.user1_id
      if (isAIUser(otherId)) {
        setAiLoading(true)
        try {
          await sendMessageToAI(content, activeId)
        } catch (err) {
          setMessages(prev => [...prev, {
            id: `err-${Date.now()}`,
            sender_id: AI_BOT_ID,
            content: "I'm having trouble connecting right now.",
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <MessageSquare size={48} className="mx-auto mb-4 text-noir-600" />
          <h2 className="text-xl font-serif italic text-noir-100 mb-2">Sign in to chat</h2>
          <p className="text-noir-400 mb-6">Connect with makers and get help from our AI assistant</p>
          <Link href="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 size={32} className="text-rose animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-noir-950">
      {/* Chat Interface — Same as dashboard/messages but full width */}
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-noir-800/50 bg-noir-900/50 px-4 py-3 flex items-center gap-4 shrink-0">
          <Link href="/" className="p-2 -ml-2 text-noir-400 hover:text-noir-200 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <MessageSquare size={20} className="text-rose" />
          <h1 className="font-serif italic text-lg text-noir-50">Messages</h1>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className={`
            w-full md:w-80 border-r border-noir-800/50 flex flex-col h-full
            ${showMobileChat ? 'hidden md:flex' : 'flex'}
          `}>
            <div className="p-4 border-b border-noir-800/50">
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

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-noir-400 text-sm">No messages yet</div>
              ) : (
                filteredConversations.map(c => {
                  const isAI = isAIUser(c.user1_id === user?.id ? c.user2_id : c.user1_id)
                  return (
                    <button
                      key={c.id}
                      onClick={() => { setActiveId(c.id); setShowMobileChat(true) }}
                      className={`w-full flex items-center gap-3 p-4 border-b border-noir-800/30 hover:bg-noir-800/20 transition-colors text-left ${activeId === c.id ? 'bg-noir-800/30' : ''}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-noir-700 flex items-center justify-center shrink-0 overflow-hidden">
                        {isAI ? <span className="text-lg"></span> : (
                          <span className="text-sm font-medium text-noir-200">{(c.other_user?.full_name?.[0] || '?').toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-noir-200 truncate">
                          {isAI && <span className="text-rose mr-1"></span>}
                          {c.other_user?.full_name || 'Unknown'}
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
          <div className={`
            flex-1 flex flex-col h-full overflow-hidden
            ${showMobileChat ? 'flex' : 'hidden md:flex'}
          `}>
            {activeConversation ? (
              <>
                <div className="flex items-center justify-between p-4 border-b border-noir-800/50">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowMobileChat(false)} className="md:hidden p-2 -ml-2 text-noir-400 hover:text-noir-200">
                      <ChevronLeft size={20} />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-noir-700 flex items-center justify-center">
                      {isAIConversation ? <span className="text-sm"></span> : (
                        <span className="text-sm font-medium text-noir-200">
                          {(activeConversation.other_user?.full_name?.[0] || '?').toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-noir-200">
                        {isAIConversation && <span className="text-rose mr-1"></span>}
                        {activeConversation.other_user?.full_name || 'Unknown'}
                      </p>
                      {isAIConversation && <p className="text-[10px] text-rose/70">AI Assistant</p>}
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-noir-800 text-noir-400 hover:text-noir-200 transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-noir-500 py-12">No messages yet. Start the conversation!</div>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id}>
                        {/* Regular message */}
                        <div className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
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
                        {/* Product card attachment */}
                        {msg.metadata?.product && (
                          <div className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'} mt-2`}>
                            <div className="max-w-[70%]">
                              <ProductMessageCard product={msg.metadata.product} />
                            </div>
                          </div>
                        )}
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

                <div className="p-4 border-t border-noir-800/50 flex-shrink-0">
                  <div className="flex items-end gap-2">
                    <div className="flex-1 bg-noir-900 border border-noir-700 rounded-2xl px-4 py-2.5">
                      <textarea
                        rows={1}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
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
    </div>
  )
}


// Wrapper with Suspense boundary for useSearchParams
export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-rose animate-spin" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}
