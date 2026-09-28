'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, User, Image, Paperclip, Smile, Search, MoreVertical, Phone, Video } from 'lucide-react'

interface Message {
  id: string
  sender: 'buyer' | 'seller'
  text: string
  time: string
  read: boolean
}

interface Conversation {
  id: string
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread: number
  messages: Message[]
}

const mockConversations: Conversation[] = [
  {
    id: 'c1',
    name: 'Raven_K',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'Does the harness come in different sizes?',
    time: '2m ago',
    unread: 2,
    messages: [
      { id: 'm1', sender: 'buyer', text: 'Hi there! I am interested in The Penumbra Harness.', time: '10:30 AM', read: true },
      { id: 'm2', sender: 'seller', text: 'Hello! Thanks for reaching out. Yes, we offer it in Small, Medium, and Large.', time: '10:32 AM', read: true },
      { id: 'm3', sender: 'buyer', text: 'Does the harness come in different sizes?', time: '2m ago', read: false },
    ]
  },
  {
    id: 'c2',
    name: 'MistressV',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'Thanks for the quick response!',
    time: '1h ago',
    unread: 0,
    messages: [
      { id: 'm4', sender: 'buyer', text: 'Hello, when will the flogger be back in stock?', time: '9:00 AM', read: true },
      { id: 'm5', sender: 'seller', text: 'Hi! We should have it back by next Friday. I will let you know as soon as it is ready.', time: '9:15 AM', read: true },
      { id: 'm6', sender: 'buyer', text: 'Thanks for the quick response!', time: '1h ago', read: true },
    ]
  },
  {
    id: 'c3',
    name: 'Kitten_J',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'Can you do custom colors?',
    time: '3h ago',
    unread: 1,
    messages: [
      { id: 'm7', sender: 'buyer', text: 'Hi! Love your work. Can you do custom colors?', time: '3h ago', read: false },
    ]
  },
  {
    id: 'c4',
    name: 'Dom_Darius',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'Shipped! Tracking number added.',
    time: '1d ago',
    unread: 0,
    messages: [
      { id: 'm8', sender: 'seller', text: 'Your order has been shipped! Tracking number added.', time: '1d ago', read: true },
    ]
  },
]

export default function MessagesPage() {
  const [activeId, setActiveId] = useState('c1')
  const [conversations, setConversations] = useState(mockConversations)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const active = conversations.find(c => c.id === activeId)
  const otherConversations = conversations.filter(c => c.id !== activeId)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active?.messages.length])

  const sendMessage = () => {
    if (!input.trim() || !active) return
    const newMsg: Message = {
      id: `m${Date.now()}`,
      sender: 'seller',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    }
    setConversations(prev => prev.map(c =>
      c.id === activeId
        ? { ...c, messages: [...c.messages, newMsg], lastMessage: input.trim(), time: 'Just now' }
        : c
    ))
    setInput('')
  }

  return (
    <div className="p-0">{/* full stretch */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar — Conversations */}
        <div className="w-80 border-r border-noir-800/50 flex flex-col">
          <div className="p-4 border-b border-noir-800/50">
            <h1 className="font-serif italic text-xl text-noir-50 mb-3">Messages</h1>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full bg-noir-900 border border-noir-800 rounded-lg pl-9 pr-3 py-2 text-sm text-noir-100 placeholder:text-noir-500 focus:outline-none focus:border-rose/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {otherConversations.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  setActiveId(c.id)
                  setConversations(prev => prev.map(conv =>
                    conv.id === c.id ? { ...conv, unread: 0 } : conv
                  ))
                }}
                className={`w-full flex items-center gap-3 p-4 border-b border-noir-800/30 hover:bg-noir-800/20 transition-colors text-left ${activeId === c.id ? 'bg-noir-800/30' : ''}`}
              >
                <div className="relative">
                  <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                  {c.unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose rounded-full text-[10px] flex items-center justify-center text-noir-50 font-medium">{c.unread}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-medium text-noir-200 truncate">{c.name}</p>
                    <span className="text-[10px] text-noir-500 shrink-0">{c.time}</span>
                  </div>
                  <p className={`text-xs truncate ${c.unread > 0 ? 'text-noir-200 font-medium' : 'text-noir-500'}`}>{c.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {active && (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-noir-800/50">
              <div className="flex items-center gap-3">
                <img src={active.avatar} alt={active.name} className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-medium text-noir-200">{active.name}</p>
                  <p className="text-[10px] text-emerald-400">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-noir-800 text-noir-400 hover:text-noir-200 transition-colors"><Phone size={18} /></button>
                <button className="p-2 rounded-lg hover:bg-noir-800 text-noir-400 hover:text-noir-200 transition-colors"><Video size={18} /></button>
                <button className="p-2 rounded-lg hover:bg-noir-800 text-noir-400 hover:text-noir-200 transition-colors"><MoreVertical size={18} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {active.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm ${
                    msg.sender === 'seller'
                      ? 'bg-rose-dark text-noir-50 rounded-br-md'
                      : 'bg-noir-800 text-noir-200 rounded-bl-md'
                  }`}>
                    <p className="leading-relaxed">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === 'seller' ? 'text-rose/60' : 'text-noir-500'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-noir-800/50">
              <div className="flex items-end gap-2">
                <button className="p-2 rounded-lg text-noir-500 hover:text-noir-300 transition-colors"><Paperclip size={20} /></button>
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
                <button className="p-2 rounded-lg text-noir-500 hover:text-noir-300 transition-colors"><Image size={20} /></button>
                <button className="p-2 rounded-lg text-noir-500 hover:text-noir-300 transition-colors"><Smile size={20} /></button>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="p-2.5 rounded-xl bg-rose-dark hover:bg-rose text-noir-50 disabled:opacity-30 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
