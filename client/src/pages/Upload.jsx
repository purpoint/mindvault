import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Upload() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [documents, setDocuments] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (!loading && !user) navigate('/login')
    if (user) fetchDocuments()
  }, [user, loading])

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/api/upload')
      setDocuments(res.data.documents)
    } catch {}
  }

  const handleFile = async (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') { setError('Only PDF files are allowed'); return }
    if (file.size > 10 * 1024 * 1024) { setError('File size must be under 10MB'); return }

    setError('')
    setSuccess('')
    setUploading(true)
    setProgress(0)

    const formData = new FormData()
    formData.append('pdf', file)

    try {
      await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total))
      })
      setSuccess(`"${file.name}" uploaded and processing!`)
      fetchDocuments()
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await api.delete(`/api/upload/${id}`)
      setDocuments(prev => prev.filter(d => d._id !== id))
    } catch { setError('Failed to delete') }
    finally { setDeletingId(null) }
  }

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const completed = documents.filter(d => d.status === 'completed').length
  const totalChunks = documents.reduce((a, d) => a + (d.chunkCount || 0), 0)

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>

      {/* Top nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-10"
        style={{ background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')}
            className="text-zinc-500 hover:text-white transition-colors text-sm flex items-center gap-1">
            ← Dashboard
          </button>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-300 text-sm font-medium">Upload</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/chat')}
            className="text-xs bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl transition-colors">
            💬 Chat with docs
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-1">Knowledge Vault</h1>
          <p className="text-zinc-500 text-sm">Upload PDFs to build your personal AI knowledge base</p>
        </motion.div>

        {/* Stats row */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Documents', value: documents.length, icon: '📄', color: 'text-blue-400' },
            { label: 'Processed', value: completed, icon: '✅', color: 'text-green-400' },
            { label: 'Total Chunks', value: totalChunks, icon: '✂️', color: 'text-violet-400' },
          ].map((s, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-zinc-500 text-xs">{s.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Drop Zone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className={`relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300 mb-4 ${
            dragging
              ? 'border-violet-500 bg-violet-500/10 scale-[1.01]'
              : uploading
              ? 'border-violet-500/50 bg-violet-500/5'
              : 'border-white/10 hover:border-violet-500/50 hover:bg-white/[0.02]'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />

          {/* Background glow when dragging */}
          {dragging && (
            <div className="absolute inset-0 rounded-2xl bg-violet-500/5 pointer-events-none" />
          )}

          <motion.div animate={{ scale: dragging ? 1.1 : 1 }} transition={{ duration: 0.2 }}>
            <div className="text-6xl mb-4">
              {uploading ? '⏳' : dragging ? '📂' : '📄'}
            </div>
          </motion.div>

          {uploading ? (
            <div className="max-w-xs mx-auto">
              <p className="text-white font-medium mb-1">Uploading...</p>
              <p className="text-zinc-500 text-sm mb-4">{progress}% complete</p>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <motion.div className="bg-violet-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }} />
              </div>
            </div>
          ) : (
            <>
              <p className="text-white font-semibold text-lg mb-1">
                {dragging ? 'Drop your PDF here!' : 'Drag & drop your PDF'}
              </p>
              <p className="text-zinc-500 text-sm mb-4">or click to browse files</p>
              <div className="inline-flex items-center gap-4 text-xs text-zinc-600">
                <span>📋 PDF only</span>
                <span>•</span>
                <span>📦 Max 10MB</span>
                <span>•</span>
                <span>🔒 Private to you</span>
              </div>
            </>
          )}
        </motion.div>

        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
              ⚠️ {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
              ✅ {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Documents list */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">
              Your Documents
              <span className="text-zinc-600 font-normal text-sm ml-2">({documents.length})</span>
            </h2>
            {completed > 0 && (
              <button onClick={() => navigate('/chat')}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors border border-violet-500/20 hover:border-violet-500/40 px-3 py-1.5 rounded-lg">
                Chat with these →
              </button>
            )}
          </div>

          {documents.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-zinc-400 font-medium mb-1">No documents yet</p>
              <p className="text-zinc-600 text-sm">Upload your first PDF to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {documents.map((doc, i) => (
                  <motion.div key={doc._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-4 flex items-center gap-4 hover:border-white/15 transition-all"
                  >
                    {/* File icon */}
                    <div className="w-12 h-12 rounded-xl bg-zinc-800/80 flex items-center justify-center text-xl flex-shrink-0 border border-zinc-700/50">
                      📄
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{doc.originalName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-zinc-500 text-xs">{formatSize(doc.fileSize)}</span>
                        <span className="text-zinc-700 text-xs">•</span>
                        <span className="text-zinc-500 text-xs">{doc.chunkCount || 0} chunks</span>
                        <span className="text-zinc-700 text-xs">•</span>
                        <span className="text-zinc-500 text-xs">{formatDate(doc.createdAt)}</span>
                      </div>

                      {/* Processing progress bar */}
                      {doc.status === 'processing' && (
                        <div className="mt-2 w-full bg-zinc-800 rounded-full h-1">
                          <motion.div className="bg-yellow-500 h-1 rounded-full"
                            animate={{ width: ['20%', '80%', '20%'] }}
                            transition={{ duration: 2, repeat: Infinity }} />
                        </div>
                      )}
                    </div>

                    {/* Status badge */}
                    <span className={`text-xs px-3 py-1 rounded-full flex-shrink-0 font-medium ${
                      doc.status === 'completed' ? 'bg-green-500/15 text-green-400 border border-green-500/25' :
                      doc.status === 'processing' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25' :
                      doc.status === 'failed' ? 'bg-red-500/15 text-red-400 border border-red-500/25' :
                      'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}>
                      {doc.status === 'completed' ? '✅ Ready' :
                       doc.status === 'processing' ? '⚙️ Processing' :
                       doc.status === 'failed' ? '❌ Failed' : '⏳ Uploaded'}
                    </span>

                    {/* Delete button */}
                    <button onClick={() => handleDelete(doc._id)}
                      disabled={deletingId === doc._id}
                      className="text-zinc-600 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10 flex-shrink-0">
                      {deletingId === doc._id ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : '🗑️'}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Bottom CTA */}
        {completed > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            onClick={() => navigate('/chat')}
            className="mt-6 glass-card p-5 cursor-pointer hover:border-violet-500/40 transition-all"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(56,189,248,0.03))' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center">🧠</div>
                <div>
                  <p className="text-white text-sm font-medium">{completed} document{completed > 1 ? 's' : ''} ready to query</p>
                  <p className="text-zinc-500 text-xs">Start chatting with your knowledge base</p>
                </div>
              </div>
              <span className="text-violet-400 text-sm font-medium">Open Chat →</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}