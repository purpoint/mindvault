import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

const aiTips = [
  { icon: '🧠', title: 'RAG Architecture', desc: 'Retrieval-Augmented Generation grounds AI answers in your actual documents, eliminating hallucinations completely.' },
  { icon: '📐', title: 'Vector Embeddings', desc: 'Each chunk of your document becomes 384 numbers representing its semantic meaning in high-dimensional space.' },
  { icon: '🔍', title: 'Cosine Similarity', desc: 'MindVault finds relevant chunks by measuring the mathematical angle between your query vector and stored vectors.' },
  { icon: '✂️', title: 'Smart Chunking', desc: 'Documents split into 500-word overlapping chunks to preserve context at boundaries — no information lost.' },
  { icon: '⚡', title: 'Groq Speed', desc: 'Groq runs Llama 3.1 on custom LPU hardware — delivering AI responses up to 10x faster than standard GPUs.' },
  { icon: '🗄️', title: 'Pinecone Index', desc: 'Your vectors live in a distributed index optimized for millisecond-level similarity search across millions of vectors.' },
]

function Sidebar({ user, logout, navigate, docs }) {
  const [tipIndex, setTipIndex] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const totalChunks = docs.reduce((a, d) => a + (d.chunkCount || 0), 0)
  const completed = docs.filter(d => d.status === 'completed').length

  useEffect(() => {
    const interval = setInterval(() => setTipIndex(prev => (prev + 1) % aiTips.length), 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Sidebar toggle button — always visible */}
      <button
        onClick={() => setSidebarOpen(p => !p)}
        className="fixed top-4 left-4 z-50 w-8 h-8 rounded-lg border border-white/10 hover:border-violet-500/50 flex items-center justify-center text-zinc-400 hover:text-violet-300 transition-all bg-zinc-900/80 backdrop-blur-sm"
      >
        {sidebarOpen ? '←' : '→'}
      </button>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 272, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex-shrink-0 border-r border-white/5 overflow-hidden h-screen sticky top-0"
          >
            <div className="w-[272px] h-full flex flex-col px-4 py-6 gap-4">

              {/* Logo */}
              <div className="flex items-center gap-2 px-2 mb-2 pl-10">
                <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-sm">🧠</div>
                <span className="font-display font-bold gradient-text text-lg">MindVault</span>
              </div>

              {/* Nav */}
              <nav className="space-y-1">
                {[
                  { icon: '🏠', label: 'Dashboard', path: '/dashboard', active: true },
                  { icon: '💬', label: 'Chat', path: '/chat', badge: completed > 0 ? completed : null },
                  { icon: '📤', label: 'Upload', path: '/upload' },
                ].map((item, i) => (
                  <button key={i} onClick={() => navigate(item.path)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                      item.active
                        ? 'bg-violet-600/20 text-violet-300 border border-violet-500/20'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}>
                    <div className="flex items-center gap-3">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-xs bg-violet-600 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>
                    )}
                  </button>
                ))}
              </nav>

              {/* Knowledge Health */}
              <div className="glass-card p-4">
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">Knowledge Health</p>
                <div className="space-y-3">
                  {[
                    { label: 'Documents', value: docs.length, max: 10, color: 'bg-blue-500' },
                    { label: 'Chunks stored', value: totalChunks, max: Math.max(totalChunks, 50), color: 'bg-violet-500' },
                    { label: 'Processed', value: completed, max: Math.max(docs.length, 1), color: 'bg-green-500' },
                  ].map((bar, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-600">{bar.label}</span>
                        <span className="text-zinc-400 font-medium">{bar.value}</span>
                      </div>
                      <div className="w-full bg-zinc-800/80 rounded-full h-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((bar.value / bar.max) * 100, 100)}%` }}
                          transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                          className={`${bar.color} h-1.5 rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Tips */}
              <div className="flex-1 glass-card p-4 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.07), rgba(56,189,248,0.03))' }}>
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">Did you know?</p>
                <AnimatePresence mode="wait">
                  <motion.div key={tipIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="text-2xl mb-2">{aiTips[tipIndex].icon}</div>
                    <p className="text-violet-300 text-xs font-semibold mb-1">{aiTips[tipIndex].title}</p>
                    <p className="text-zinc-500 text-xs leading-relaxed">{aiTips[tipIndex].desc}</p>
                  </motion.div>
                </AnimatePresence>
                <div className="flex gap-1 mt-4">
                  {aiTips.map((_, i) => (
                    <button key={i} onClick={() => setTipIndex(i)}
                      className={`h-1 rounded-full transition-all ${i === tipIndex ? 'bg-violet-400 w-6' : 'bg-zinc-700 w-1.5'}`}
                    />
                  ))}
                </div>
              </div>

              {/* User card */}
              <div className="glass-card p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-600/25 border border-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-300 flex-shrink-0">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{user?.name}</p>
                  <p className="text-zinc-600 text-xs truncate">{user?.email}</p>
                </div>
                <button onClick={() => { logout(); navigate('/login') }}
                  className="text-zinc-600 hover:text-red-400 transition-colors text-xs px-2 py-1 rounded hover:bg-red-500/10">
                  Out
                </button>
              </div>

            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}

export default function Dashboard() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [docs, setDocs] = useState([])

  useEffect(() => {
    if (!loading && !user) navigate('/login')
    if (user) fetchDocs()
  }, [user, loading])

  const fetchDocs = async () => {
    try {
      const res = await api.get('/api/upload')
      setDocs(res.data.documents)
    } catch {}
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const completed = docs.filter(d => d.status === 'completed').length
  const processing = docs.filter(d => d.status === 'processing').length
  const totalChunks = docs.reduce((a, d) => a + (d.chunkCount || 0), 0)
  const recentDocs = docs.slice(0, 4)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen flex" style={{ background: '#0a0a0f' }}>

      <Sidebar user={user} logout={logout} navigate={navigate} docs={docs} />

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-y-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-white/5 sticky top-0 z-10"
          style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)' }}>
          <div className="pl-10">
            <h2 className="text-white font-semibold text-sm">Dashboard</h2>
            <p className="text-zinc-600 text-xs">Overview of your knowledge base</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/upload')}
              className="text-xs bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-violet-500/20 hover:-translate-y-0.5">
              + Upload PDF
            </button>
            <button onClick={() => navigate('/chat')}
              className="text-xs border border-white/10 hover:border-violet-500/40 text-zinc-400 hover:text-white px-4 py-2 rounded-xl transition-all">
              💬 Chat
            </button>
          </div>
        </div>

        <div className="px-8 py-8 max-w-5xl">

          {/* Greeting */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl font-display font-bold text-white">
              {greeting}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              {completed > 0
                ? `${completed} document${completed > 1 ? 's' : ''} ready — ask me anything about them.`
                : 'Upload your first PDF to start building your second brain.'}
            </p>
          </motion.div>

          {/* Stats grid */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Documents', value: docs.length, icon: '📄', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/8' },
              { label: 'Processed', value: completed, icon: '✅', color: 'text-green-400', border: 'border-green-500/20', bg: 'bg-green-500/8' },
              { label: 'Processing', value: processing, icon: '⚙️', color: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/8' },
              { label: 'Total Chunks', value: totalChunks, icon: '✂️', color: 'text-violet-400', border: 'border-violet-500/20', bg: 'bg-violet-500/8' },
            ].map((stat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className={`glass-card p-5 border ${stat.border} ${stat.bg} hover:scale-[1.02] transition-transform cursor-default`}>
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-zinc-500 text-xs mt-0.5">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick actions */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3 mb-8">
            <div onClick={() => navigate('/chat')}
              className="glass-card p-5 cursor-pointer hover:border-violet-500/40 transition-all group"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(124,58,237,0.02))' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💬</div>
                <div>
                  <p className="text-white font-semibold group-hover:text-violet-300 transition-colors">Ask MindVault</p>
                  <p className="text-zinc-500 text-xs mt-0.5">Chat with your knowledge base using AI</p>
                </div>
              </div>
            </div>
            <div onClick={() => navigate('/upload')}
              className="glass-card p-5 cursor-pointer hover:border-violet-500/40 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📤</div>
                <div>
                  <p className="text-white font-semibold group-hover:text-violet-300 transition-colors">Upload PDF</p>
                  <p className="text-zinc-500 text-xs mt-0.5">Add documents to your vault</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent documents */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Recent Documents</h3>
              <button onClick={() => navigate('/upload')} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                Manage all →
              </button>
            </div>

            {recentDocs.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-zinc-400 font-medium mb-1">No documents yet</p>
                <p className="text-zinc-600 text-sm mb-5">Upload your first PDF to get started</p>
                <button onClick={() => navigate('/upload')}
                  className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-violet-500/20">
                  Upload your first PDF
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentDocs.map((doc, i) => (
                  <motion.div key={doc._id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    onClick={() => navigate('/chat')}
                    className="glass-card p-4 flex items-center gap-4 hover:border-violet-500/25 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-lg flex-shrink-0">
                      📄
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate group-hover:text-violet-300 transition-colors">{doc.originalName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-zinc-600 text-xs">{(doc.fileSize / 1024).toFixed(0)} KB</span>
                        <span className="text-zinc-700 text-xs">•</span>
                        <span className="text-zinc-600 text-xs">{doc.chunkCount || 0} chunks</span>
                        <span className="text-zinc-700 text-xs">•</span>
                        <span className="text-zinc-600 text-xs">{new Date(doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                      doc.status === 'completed' ? 'bg-green-500/12 text-green-400 border border-green-500/20' :
                      doc.status === 'processing' ? 'bg-yellow-500/12 text-yellow-400 border border-yellow-500/20' :
                      'bg-zinc-800 text-zinc-500 border border-zinc-700'
                    }`}>
                      {doc.status === 'completed' ? '✅ Ready' : doc.status === 'processing' ? '⚙️ Processing' : '⏳ Uploaded'}
                    </span>
                    <span className="text-zinc-700 group-hover:text-violet-400 transition-colors text-sm">→</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Chat CTA */}
          {completed > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              onClick={() => navigate('/chat')}
              className="mt-6 glass-card p-5 cursor-pointer hover:border-violet-500/40 transition-all group"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.07), rgba(56,189,248,0.03))' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center"
                    animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}>
                    🧠
                  </motion.div>
                  <div>
                    <p className="text-white text-sm font-medium">{completed} document{completed > 1 ? 's' : ''} ready to query</p>
                    <p className="text-zinc-500 text-xs">Click to start chatting with your knowledge base</p>
                  </div>
                </div>
                <span className="text-violet-400 text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
                  Chat now →
                </span>
              </div>
            </motion.div>
          )}

          {/* Tech stack footer */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-8 pt-6 border-t border-white/5 flex items-center gap-4 flex-wrap">
            <span className="text-zinc-700 text-xs">Powered by:</span>
            {[
              { name: 'Pinecone', color: 'bg-violet-500' },
              { name: 'Hugging Face', color: 'bg-yellow-500' },
              { name: 'Groq LLM', color: 'bg-blue-500' },
              { name: 'MongoDB', color: 'bg-green-500' },
              { name: 'React', color: 'bg-cyan-500' },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${t.color}`} />
                <span className="text-zinc-600 text-xs">{t.name}</span>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </div>
  )
}