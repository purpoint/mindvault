async function generateEmbedding(text) {
  const response = await fetch(
    'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: text,
        options: { wait_for_model: true }
      })
    }
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Embedding failed: ${err}`)
  }

  const data = await response.json()

  // Debug: check what shape we're getting
  console.log('Embedding shape:', Array.isArray(data), Array.isArray(data[0]), typeof data[0])

  if (Array.isArray(data) && typeof data[0] === 'number') return data
  if (Array.isArray(data[0]) && Array.isArray(data[0][0])) return data[0][0]
  if (Array.isArray(data[0])) return data[0]
  return data
}

module.exports = { generateEmbedding }