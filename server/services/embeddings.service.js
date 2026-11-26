// Local embedding generation using Transformers.js.
// Runs sentence-transformers/all-MiniLM-L6-v2 in-process: no API key,
// no rate limits, no credits. Output is 384-dimensional, mean-pooled and
// L2-normalised — identical in shape and semantics to the hosted
// sentence-transformers endpoint this previously called, so vectors already
// stored in Pinecone remain compatible.

let extractorPromise = null

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const { pipeline, env } = await import('@xenova/transformers')
      // Only fetch from the hub; don't look for local model folders.
      env.allowLocalModels = false
      console.log('🧠 Loading local embedding model (first run downloads ~25MB)...')
      const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
      console.log('✅ Embedding model ready')
      return pipe
    })().catch(err => {
      extractorPromise = null // allow a later retry instead of caching the failure
      throw err
    })
  }
  return extractorPromise
}

async function generateEmbedding(text) {
  const extractor = await getExtractor()
  const output = await extractor(text, { pooling: 'mean', normalize: true })
  const vector = Array.from(output.data)

  if (!Array.isArray(vector) || vector.length === 0) {
    throw new Error('Embedding failed: empty vector returned')
  }
  return vector
}

module.exports = { generateEmbedding, getExtractor }
