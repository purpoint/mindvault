import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const features = [
  { icon: '📄', title: 'Upload Any PDF', desc: 'Notes, research papers, textbooks — any PDF becomes part of your AI knowledge base instantly.' },
  { icon: '🧠', title: 'Semantic Understanding', desc: 'AI embeddings understand meaning, not just keywords. Ask naturally and get intelligent answers.' },
  { icon: '⚡', title: 'RAG Architecture', desc: 'Retrieval-Augmented Generation finds relevant chunks and generates grounded, hallucination-free answers.' },
  { icon: '🔒', title: 'Your Data Only', desc: 'Every answer comes exclusively from your uploaded documents. Private, secure, and trustworthy.' },
  { icon: '📌', title: 'Source Citations', desc: 'Every response tells you exactly which document and section it came from. Full transparency.' },
  { icon: '🎯', title: 'Document Focus', desc: 'Select specific documents to query or search across your entire knowledge base at once.' },
]

const techStack = [
  { name: 'React', color: 'bg-cyan-500' },
  { name: 'Node.js', color: 'bg-green-500' },
  { name: 'MongoDB', color: 'bg-emerald-500' },
  { name: 'Pinecone', color: 'bg-violet-500' },
  { name: 'Hugging Face', color: 'bg-yellow-500' },
  { name: 'Groq LLM', color: 'bg-blue-500' },
]

const stats = [
  { value: '384D', label: 'Vector Dimensions' },
  { value: '<2s', label: 'Query Response' },
  { value: '100%', label: 'Free to Use' },
  { value: '∞', label: 'Documents' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>

      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5 sticky top-0 z-50" style={{ background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-sm">🧠</div>
          <h1 className="text-lg font-display font-bold gradient-text">MindVault</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="text-sm text-zinc-400 hover:text-white transition-colors">Sign in</button>
          <button onClick={() => navigate('/register')} className="text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-violet-500/25 hover:-translate-y-0.5">
            Get started free
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center text-center px-6 pt-28 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-violet-600/15 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-40 left-[20%] w-[300px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-60 right-[15%] w-[250px] h-[250px] bg-pink-500/8 blur-[100px] rounded-full pointer-events-none" />

        {/* Grid pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 max-w-3xl">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs px-4 py-2 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
            Powered by RAG + Vector Search + LLM
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-[1.1] mb-6 tracking-tight">
            Your AI-Powered
            <span className="block gradient-text mt-2">Second Brain</span>
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload documents. Ask questions. Get intelligent answers grounded in <span className="text-zinc-200">your own knowledge</span> — not the internet.
          </p>

          <div className="flex items-center justify-center gap-4">
            <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/register')}
              className="bg-violet-600 hover:bg-violet-500 text-white font-medium px-8 py-4 rounded-xl transition-all shadow-xl shadow-violet-500/30 text-lg">
              Start building your vault →
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/login')}
              className="text-zinc-400 hover:text-white px-6 py-4 rounded-xl border border-white/10 hover:border-white/25 transition-all">
              Sign in
            </motion.button>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="relative z-10 mt-16 flex items-center gap-8 glass-card px-8 py-4">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-xl font-bold gradient-text">{s.value}</div>
              <div className="text-zinc-500 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Hero preview */}
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
          className="relative z-10 mt-16 w-full max-w-3xl">
          <div className="glass-card p-1 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(56,189,248,0.08))' }}>
            <div className="bg-[#0d0d14] rounded-xl p-6">
              {/* Window dots */}
              <div className="flex items-center gap-2 mb-5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="text-zinc-600 text-xs ml-3">MindVault Chat — SDG_3.pdf</span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-violet-600 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-sm">
                    What are the main strategies for fighting climate change?
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs flex-shrink-0 mt-1">🧠</div>
                  <div className="glass-card px-4 py-3 text-sm text-zinc-300 rounded-2xl rounded-tl-sm max-w-md">
                    <p className="font-semibold text-violet-300 mb-2">Key Climate Strategies</p>
                    <p className="text-zinc-400 text-xs leading-relaxed">Based on your documents, the main strategies include transitioning to renewable energy sources, enhancing carbon sequestration through reforestation, and implementing sustainable urban development...</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/20">📄 SDG_3.pdf</span>
                      <span className="text-zinc-600 text-xs ml-auto">2.1s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Glow effect under preview */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-16 bg-violet-600/10 blur-[40px] rounded-full" />
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-6 py-24 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="text-violet-400 text-sm font-medium mb-2">HOW IT WORKS</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white">Three steps to your AI assistant</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Upload PDFs', desc: 'Drag and drop any PDF. Text is extracted and cleaned automatically.', icon: '📤' },
            { step: '02', title: 'AI Processes', desc: 'Documents are chunked, embedded into 384-dimensional vectors, and stored in Pinecone.', icon: '⚡' },
            { step: '03', title: 'Ask Anything', desc: 'Type a question. RAG retrieves relevant chunks and generates a grounded answer.', icon: '💬' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="relative glass-card p-6 group hover:border-violet-500/30 transition-all">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-violet-500/30">
                {s.step}
              </div>
              <div className="text-3xl mb-4 mt-2">{s.icon}</div>
              <h3 className="text-white font-semibold mb-2">{s.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="text-violet-400 text-sm font-medium mb-2">FEATURES</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">Built for real knowledge work</h2>
          <p className="text-zinc-500 max-w-xl mx-auto">Production-grade AI architecture — not another chatbot wrapper.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="glass-card p-6 hover:border-violet-500/30 transition-all group">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold mb-2 text-sm group-hover:text-violet-300 transition-colors">{f.title}</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section className="px-6 py-24 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="text-violet-400 text-sm font-medium mb-2">ARCHITECTURE</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">Production tech stack</h2>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="glass-card p-8">
          {/* Pipeline visualization */}
          <div className="flex items-center justify-between gap-2 mb-8 overflow-x-auto pb-2">
            {['Upload PDF', 'Extract Text', 'Chunk', 'Embed', 'Store Vector', 'Query', 'Generate'].map((step, i) => (
              <div key={i} className="flex items-center gap-2 flex-shrink-0">
                <div className="bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs px-3 py-1.5 rounded-lg whitespace-nowrap">
                  {step}
                </div>
                {i < 6 && <span className="text-zinc-600">→</span>}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {techStack.map((tech, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full">
                <div className={`w-2 h-2 rounded-full ${tech.color}`} />
                <span className="text-zinc-300 text-sm">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center glass-card p-14 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-violet-600/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-3xl mx-auto mb-6">🧠</div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Ready to build your second brain?
            </h2>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              Upload your first document and experience the power of AI-driven semantic search.
            </p>
            <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/register')}
              className="bg-violet-600 hover:bg-violet-500 text-white font-medium px-10 py-4 rounded-xl transition-all shadow-xl shadow-violet-500/30 text-lg">
              Get started free →
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 px-8 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-violet-600/20 flex items-center justify-center text-xs">🧠</div>
            <span className="gradient-text font-display font-bold text-sm">MindVault</span>
          </div>
          <p className="text-zinc-600 text-xs">
            Built with React • Node.js • Pinecone • Hugging Face • Groq
          </p>
          <p className="text-zinc-700 text-xs">© 2026 Manan Patel</p>
        </div>
      </footer>
    </div>
  )
}