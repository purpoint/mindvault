import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import api from '../services/api'

const STORAGE_KEY = 'mindvault_chat_history'

const suggestedQuestions = [
  { icon: '📋', text: 'Summarize this document' },
  { icon: '🔍', text: 'What are the main topics?' },
  { icon: '💡', text: 'What are the key takeaways?' },
  { icon: '❓', text: 'What questions does this answer?' },
]

function EmptyState({ onSuggest, selectedDoc }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-4">
      <div className="relative mb-6">
        <motion.div
          className="w-20 h-20 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-4xl"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          🧠
        </motion.div>
        {[1, 2, 3].map(i => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-2xl border border-violet-500/20"
            animate={{ scale: [1, 1.5 + i * 0.3], opacity: [0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
          />
        ))}
      </div>

      <h3 className="text-white font-display font-semibold text-xl mb-2">
        {selectedDoc ? `Chatting with: ${selectedDoc.originalName}` : 'Ready to answer'}
      </h3>
      <p className="text-zinc-500 text-sm text-center max-w-xs mb-8">
        {selectedDoc
          ? 'Ask me anything about this specific document.'
          : 'Select a document from the left, or ask about all your documents.'}
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
        {suggestedQuestions.map((q, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            onClick={() => onSuggest(q.text)}
            className="glass-card px-4 py-3 text-left hover:border-violet-500/50 transition-all group"
          >
            <span className="text-lg block mb-1">{q.icon}</span>
            <span className="text-zinc-300 text-xs group-hover:text-violet-300 transition-colors leading-relaxed">
              {q.text}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function ChatMessage({ message, onCopy }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy && onCopy()
  }

  const formatTime = (ts) => {
    if (!ts) return ''
    return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {message.role === 'assistant' && (
        <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs mr-3 mt-1 flex-shrink-0">
          🧠
        </div>
      )}

      <div className={`max-w-2xl ${message.role === 'user' ? 'max-w-md' : ''}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          message.role === 'user'
            ? 'bg-violet-600 text-white rounded-tr-sm'
            : `${message.isError ? 'bg-red-500/10 border border-red-500/20 text-red-300' : 'glass-card text-zinc-100'} rounded-tl-sm`
        }`}>
          {message.role === 'assistant' ? (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="text-violet-300 font-semibold">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
                li: ({ children }) => <li className="text-zinc-200">{children}</li>,
                code: ({ children }) => <code className="bg-zinc-700 px-1 rounded text-violet-300 text-xs">{children}</code>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            message.content
          )}
        </div>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {message.sources && message.sources.map((source, j) => (
            <span key={j} className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/20">
              📄 {source}
            </span>
          ))}
          <div className="flex items-center gap-2 ml-auto">
            {message.role === 'assistant' && (
              <button
                onClick={handleCopy}
                className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                {copied ? '✅ Copied' : '📋 Copy'}
              </button>
            )}
            {message.timestamp && (
              <span className="text-zinc-600 text-xs">{formatTime(message.timestamp)}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Chat() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [toast, setToast] = useState('')
  const [documents, setDocuments] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [docsLoading, setDocsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) navigate('/login')
    if (user) fetchDocuments()
  }, [user, loading])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {}
  }, [messages])

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/api/upload')
      const completed = res.data.documents.filter(d => d.status === 'completed')
      setDocuments(completed)
    } catch {}
    finally { setDocsLoading(false) }
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  const sendMessage = async (text) => {
    const question = text || input.trim()
    if (!question || thinking) return

    const userMessage = { role: 'user', content: question, timestamp: Date.now() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setThinking(true)

    try {
      // Send documentId if a specific doc is selected
      const payload = { question }
      if (selectedDoc) payload.documentId = selectedDoc._id

      const res = await api.post('/api/query', payload)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.sources || [],
        timestamp: Date.now()
      }])
    } catch (err) {
      const errorMsg = err.response?.status === 401
        ? 'Your session expired. Please login again.'
        : err.response?.status === 429
        ? 'Too many requests. Please wait a moment and try again.'
        : err.response?.data?.message || 'Something went wrong. Please check your connection and try again.'

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ ${errorMsg}`,
        sources: [],
        timestamp: Date.now(),
        isError: true
      }])
    } finally {
      setThinking(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    localStorage.removeItem(STORAGE_KEY)
    showToast('Chat cleared')
  }

  const isEmpty = messages.length === 0

  return (
    <div className="min-h-screen flex" style={{ background: 'radial-gradient(ellipse at top, #1a0a2e 0%, #0a0a0f 60%)' }}>

      {/* ── DOCUMENT SELECTOR SIDEBAR ── */}
      <div className="w-64 flex-shrink-0 border-r border-white/5 flex flex-col">

        {/* Sidebar header */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-white text-sm font-semibold">Documents</h2>
            <button
              onClick={() => navigate('/upload')}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              + Add
            </button>
          </div>
          <p className="text-zinc-600 text-xs">Select to focus on one doc</p>
        </div>

        {/* All docs option */}
        <div className="px-3 pt-3">
          <button
            onClick={() => { setSelectedDoc(null); setMessages([]); }}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 ${
              !selectedDoc
                ? 'bg-violet-600/20 border border-violet-500/30 text-violet-300'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🧠</span>
            <div>
              <p className="text-xs font-medium">All Documents</p>
              <p className="text-xs opacity-60">Search everything</p>
            </div>
          </button>
        </div>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {docsLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-zinc-600 text-xs">No documents yet</p>
              <button
                onClick={() => navigate('/upload')}
                className="text-violet-400 text-xs mt-1 hover:text-violet-300"
              >
                Upload PDF →
              </button>
            </div>
          ) : (
            documents.map((doc, i) => (
              <motion.button
                key={doc._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  setSelectedDoc(doc._id === selectedDoc?._id ? null : doc)
                  setMessages([])
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${
                  selectedDoc?._id === doc._id
                    ? 'bg-violet-600/20 border border-violet-500/30'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5">📄</span>
                  <div className="min-w-0">
                    <p className={`text-xs font-medium truncate ${
                      selectedDoc?._id === doc._id ? 'text-violet-300' : 'text-zinc-300'
                    }`}>
                      {doc.originalName.replace('.pdf', '')}
                    </p>
                    <p className="text-zinc-600 text-xs mt-0.5">{doc.chunkCount} chunks</p>
                  </div>
                  {selectedDoc?._id === doc._id && (
                    <span className="ml-auto text-violet-400 text-xs">✓</span>
                  )}
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* Selected doc indicator */}
        {selectedDoc && (
          <div className="px-3 py-3 border-t border-white/5">
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-3 py-2">
              <p className="text-violet-300 text-xs font-medium">Focused on:</p>
              <p className="text-zinc-400 text-xs truncate mt-0.5">{selectedDoc.originalName}</p>
              <button
                onClick={() => { setSelectedDoc(null); setMessages([]) }}
                className="text-zinc-600 hover:text-red-400 text-xs mt-1 transition-colors"
              >
                × Clear focus
              </button>
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="px-3 py-3 border-t border-white/5 space-y-1">
          <button onClick={() => navigate('/dashboard')} className="w-full text-left text-xs text-zinc-500 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
            🏠 Dashboard
          </button>
          <button onClick={() => navigate('/upload')} className="w-full text-left text-xs text-zinc-500 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
            📤 Upload PDF
          </button>
        </div>
      </div>

      {/* ── MAIN CHAT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm"
              animate={{ scale: thinking ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.6, repeat: thinking ? Infinity : 0 }}
            >
              🧠
            </motion.div>
            <div>
              <h1 className="text-white font-semibold text-sm">
                {selectedDoc ? selectedDoc.originalName.replace('.pdf', '') : 'MindVault AI'}
              </h1>
              <p className="text-zinc-500 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                {selectedDoc ? 'Focused on this document' : 'Searching all documents'}
              </p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-xs text-zinc-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg border border-white/5 hover:border-red-500/20"
            >
              🗑️ Clear chat
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl mx-auto w-full">
          {isEmpty ? (
            <EmptyState onSuggest={sendMessage} selectedDoc={selectedDoc} />
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <ChatMessage
                    key={i}
                    message={msg}
                    onCopy={() => showToast('Copied!')}
                  />
                ))}
              </AnimatePresence>

              {thinking && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs mr-3 mt-1">🧠</div>
                  <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-violet-400 rounded-full"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                      <span className="text-zinc-500 text-xs">
                        {selectedDoc ? `Searching ${selectedDoc.originalName}...` : 'Searching knowledge base...'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-white/5 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            {selectedDoc && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                  📄 {selectedDoc.originalName}
                </span>
                <span className="text-zinc-600 text-xs">only</span>
              </div>
            )}
            <div className="flex items-end gap-3 glass-card px-4 py-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedDoc ? `Ask about ${selectedDoc.originalName}...` : 'Ask anything about your documents...'}
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-zinc-500 text-sm resize-none focus:outline-none max-h-32"
                style={{ minHeight: '24px' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || thinking}
                className="bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-all flex-shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
            <p className="text-center text-zinc-600 text-xs mt-2">Enter to send • Shift+Enter for new line</p>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-24 left-1/2 bg-zinc-800 border border-zinc-700 text-white text-xs px-4 py-2 rounded-full shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}