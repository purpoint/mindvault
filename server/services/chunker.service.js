function chunkText(text, chunkSize = 500, overlap = 50) {
  const words = text.split(' ').filter(w => w.length > 0)
  const chunks = []

  let i = 0
  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    
    if (chunk.trim().length > 50) { // skip tiny chunks
      chunks.push({
        text: chunk.trim(),
        index: chunks.length,
        wordCount: Math.min(chunkSize, words.length - i)
      })
    }

    i += chunkSize - overlap // move forward with overlap
    if (i >= words.length) break
  }

  return chunks
}

module.exports = { chunkText }