const { extractTextFromPDF } = require('./pdfParser.service')
const { chunkText } = require('./chunker.service')
const { generateEmbedding } = require('./embeddings.service')
const { upsertVectors } = require('./pinecone.service')
const Document = require('../models/Document.model')
const path = require('path')

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function processDocument(documentId) {
  try {
    const document = await Document.findById(documentId)
    if (!document) throw new Error('Document not found')

    await Document.findByIdAndUpdate(documentId, { status: 'processing' })

    const filePath = path.join(__dirname, '../uploads/', document.filename)
    const { text, pages } = await extractTextFromPDF(filePath)

    if (!text || text.length < 50) {
      await Document.findByIdAndUpdate(documentId, { status: 'failed' })
      throw new Error('Could not extract text from PDF')
    }

    console.log(`📄 Extracted ${text.length} characters from ${document.originalName}`)

    const chunks = chunkText(text, 500, 50)
    console.log(`✂️  Created ${chunks.length} chunks`)

    console.log(`🔢 Generating embeddings for ${chunks.length} chunks...`)
    const vectors = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      try {
        const embedding = await generateEmbedding(chunk.text)

        // Validate embedding is a proper array of numbers
        if (!Array.isArray(embedding) || embedding.length === 0) {
          console.error(`  ⚠️ Invalid embedding for chunk ${i + 1}, skipping`)
          continue
        }

        vectors.push({
          id: `${documentId}-chunk-${i}`,
          values: embedding,
          metadata: {
            text: chunk.text,
            documentId: documentId.toString(),
            userId: document.userId.toString(),
            filename: document.originalName,
            chunkIndex: i,
          }
        })
        console.log(`  ✅ Chunk ${i + 1}/${chunks.length} embedded — vector length: ${embedding.length}`)

        if (i < chunks.length - 1) await wait(500)

      } catch (err) {
        console.error(`  ❌ Chunk ${i + 1} failed: ${err.message}`)
      }
    }

    console.log(`📦 Total vectors ready to upsert: ${vectors.length}`)

    if (vectors.length > 0) {
      await upsertVectors(vectors)
      console.log(`🚀 Stored ${vectors.length} vectors in Pinecone`)
    } else {
      console.error('❌ No valid vectors to upsert')
    }

    await Document.findByIdAndUpdate(documentId, {
      status: vectors.length > 0 ? 'completed' : 'failed',
      chunkCount: vectors.length,
    })

    console.log(`✅ Processing complete: ${vectors.length} vectors stored`)
    return { documentId, totalChunks: vectors.length, pages }

  } catch (error) {
    await Document.findByIdAndUpdate(documentId, { status: 'failed' })
    throw error
  }
}

module.exports = { processDocument }