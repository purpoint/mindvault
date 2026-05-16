import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { registerUser } from '../services/auth'

const floatingNodes = [
  { x: 8, y: 20 }, { x: 20, y: 45 }, { x: 12, y: 70 },
  { x: 35, y: 15 }, { x: 42, y: 75 }, { x: 65, y: 12 },
  { x: 72, y: 42 }, { x: 82, y: 18 }, { x: 88, y: 68 },
  { x: 68, y: 78 }, { x: 52, y: 52 }, { x: 18, y: 88 },
]

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const data = await registerUser(name, email, password)
      login(data.user, data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 40% 30%, #1e0a35 0%, #0a0a0f 65%)' }}>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute inset-0 w-full h-full">
          {[[0,1],[1,3],[3,5],[5,7],[7,8],[1,4],[4,10],[6,7],[9,10],[2,4]].map(([a,b], i) => (
            <motion.line key={i}
              x1={`${floatingNodes[a]?.x}%`} y1={`${floatingNodes[a]?.y}%`}
              x2={`${floatingNodes[b]?.x}%`} y2={`${floatingNodes[b]?.y}%`}
              stroke="rgba(139,92,246,0.12)" strokeWidth="1"
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
        </svg>
        {floatingNodes.map((node, i) => (
          <motion.div key={i} className="absolute rounded-full bg-violet-500/25"
            style={{ left: `${node.x}%`, top: `${node.y}%`, width: 4, height: 4 }}
            animate={{ y: [0, -12, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 4 + i * 0.3, repeat: Infinity, delay: i * 0.3 }} />
        ))}
        <motion.div className="absolute w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)', top: '10%', right: '5%' }}
          animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 7, repeat: Infinity }} />
        <motion.div className="absolute left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent)' }}
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10">

        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 text-3xl mb-4 relative">
            🧠
            <motion.div className="absolute inset-0 rounded-2xl border border-violet-500/20"
              animate={{ scale: [1, 1.3], opacity: [0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity }} />
          </motion.div>
          <h1 className="text-3xl font-display font-bold gradient-text">MindVault</h1>
          <p className="text-zinc-500 mt-1.5 text-sm">Your AI-powered second brain</p>
        </div>

        <div className="rounded-2xl border border-white/8 p-8"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)' }}>

          <h2 className="text-xl font-semibold text-white mb-1">Create your account</h2>
          <p className="text-zinc-500 text-sm mb-6">Start building your AI knowledge vault today</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
              <span>⚠️</span> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Full name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Manan Ghodasara" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-violet-500/70 transition-all" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-violet-500/70 transition-all" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-violet-500/70 transition-all" />
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-violet-500/25 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create my vault →'}
            </motion.button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5">
            <div className="flex items-center justify-center gap-4 text-xs text-zinc-600">
              <span>🔒 JWT Secured</span>
              <span>•</span>
              <span>🧠 RAG Powered</span>
              <span>•</span>
              <span>🆓 100% Free</span>
            </div>
          </div>

          <p className="text-center text-zinc-600 text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}