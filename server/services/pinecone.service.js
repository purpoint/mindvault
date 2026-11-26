const { Pinecone } = require('@pinecone-database/pinecone')

let index = null

function getIndex() {
  if (!index) {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
    index = pc.index(process.env.PINECONE_INDEX)
  }
  return index
}

async function upsertVectors(vectors) {
  const idx = getIndex()

  // Pinecone v7 uses 'records' format
  const records = vectors.map(v => ({
    id: v.id,
    values: Array.from(v.values).map(Number),
    metadata: v.metadata
  }))

  console.log(`Upserting ${records.length} records to Pinecone...`)

  const batchSize = 100
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    await idx.upsert(batch)
  }
}

async function querySimilar(queryVector, topK = 5, filter = {}) {
  const idx = getIndex()
  const result = await idx.query({
    vector: Array.from(queryVector).map(Number),
    topK,
    filter,
    includeMetadata: true,
  })
  return result.matches
}

async function deleteVectorsByDocument(documentId, chunkCount) {
  if (!chunkCount || chunkCount < 1) return

  const idx = getIndex()

  // Serverless indexes don't support delete-by-metadata-filter,
  // so we rebuild the deterministic IDs we used at upsert time.
  const ids = Array.from(
    { length: chunkCount },
    (_, i) => `${documentId}-chunk-${i}`
  )

  // Pinecone accepts max 1000 ids per delete call
  for (let i = 0; i < ids.length; i += 1000) {
    await idx.deleteMany(ids.slice(i, i + 1000))
  }

  console.log(`🗑️  Deleted ${ids.length} vectors for document ${documentId}`)
}

module.exports = { upsertVectors, querySimilar, deleteVectorsByDocument }