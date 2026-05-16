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

async function deleteVectorsByDocument(documentId) {
  const idx = getIndex()
  await idx.deleteMany({ documentId })
}

module.exports = { upsertVectors, querySimilar, deleteVectorsByDocument }