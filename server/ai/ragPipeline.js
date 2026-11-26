const { generateEmbedding } = require('../services/embeddings.service')
const { querySimilar } = require('../services/pinecone.service')
const { buildRAGPrompt } = require('./promptBuilder')
const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Groq retires models on a rolling schedule (llama3-8b-8192 and then
// llama-3.1-8b-instant were both shut down under us). Rather than pin a single
// id that will eventually 404, try a preference list and remember whichever
// one answers. GROQ_MODEL in the environment overrides the list entirely.
const MODEL_CANDIDATES = [
  process.env.GROQ_MODEL,
  'openai/gpt-oss-20b',
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'llama-3.3-70b-versatile',
].filter(Boolean)

let activeModel = null

function isModelMissing(err) {
  const msg = `${err && err.message ? err.message : ''}`
  return err?.status === 404 || /model_not_found|does not exist|decommission/i.test(msg)
}

async function completeWithFallback(prompt) {
  const ordered = activeModel
    ? [activeModel, ...MODEL_CANDIDATES.filter(m => m !== activeModel)]
    : MODEL_CANDIDATES

  let lastError
  for (const model of ordered) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1024,
      })
      if (activeModel !== model) {
        activeModel = model
        console.log(`🤖 Using Groq model: ${model}`)
      }
      return completion.choices[0].message.content
    } catch (err) {
      lastError = err
      // Only walk the list for "this model is gone"; a rate limit or a bad key
      // should surface immediately instead of burning through every candidate.
      if (!isModelMissing(err)) throw err
      console.warn(`⚠️  Groq model ${model} unavailable, trying next...`)
      if (activeModel === model) activeModel = null
    }
  }
  throw lastError
}

async function runRAG(userQuestion, userId, documentId = null) {
  try {
    // Step 1: Convert question to embedding
    console.log(`🔍 Embedding question: "${userQuestion}"`)
    const queryEmbedding = await generateEmbedding(userQuestion)

    // Step 2: Search Pinecone for similar chunks
    console.log('🔎 Searching Pinecone for relevant chunks...')
    const filter = documentId ? { userId, documentId } : { userId }
const matches = await querySimilar(queryEmbedding, 5, filter)
    
    if (!matches || matches.length === 0) {
      return {
        answer: "I couldn't find any relevant information in your uploaded documents. Please make sure you've uploaded and processed some documents first.",
        sources: []
      }
    }

    console.log(`✅ Found ${matches.length} relevant chunks`)

    // Step 3: Build context from matches
    const contextChunks = matches
      .map((m, i) => `[Source ${i + 1} - ${m.metadata.filename}]\n${m.metadata.text}`)
      .join('\n\n---\n\n')

      console.log('Match scores:', matches.map(m => ({ file: m.metadata.filename, score: m.score })))
    // Only show sources with high relevance score (above 0.4)
const sources = [...new Set(
  matches
    .filter(m => m.score > 0.10)
    .map(m => m.metadata.filename)
)]

    // Step 4: Build RAG prompt
    const prompt = buildRAGPrompt(userQuestion, contextChunks)

    // Step 5: Call Groq LLM
    console.log('🤖 Generating answer with Groq...')
    const answer = await completeWithFallback(prompt)

    console.log('✅ Answer generated successfully')

    return { answer, sources }

  } catch (error) {
    console.error('RAG pipeline error:', error.message)
    throw error
  }
}

module.exports = { runRAG }