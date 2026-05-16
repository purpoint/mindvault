const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

dotenv.config()

const app = express()

const rateLimit = require('express-rate-limit')

// Rate limiting — prevent API spam
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // max 20 requests per minute per IP
  message: { message: 'Too many requests. Please wait a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Strict limit for AI queries (expensive)
const queryLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10, // max 10 AI queries per minute
  message: { message: 'Too many AI queries. Please wait a minute.' },
})

const PORT = process.env.PORT || 5000

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

// Routes (we'll fill these in later phases)
app.use('/api/auth', apiLimiter, require('./routes/auth.routes'))
app.use('/api/upload', apiLimiter, require('./routes/upload.routes'))
app.use('/api/query', queryLimiter, require('./routes/query.routes'))

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'MindVault API is running ✅',
    version: '1.0.0'
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})