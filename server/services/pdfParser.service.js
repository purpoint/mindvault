const pdfParse = require('pdf-parse')
const fs = require('fs')

const clean = (t) => t
  .replace(/\n{3,}/g, '\n\n')
  .replace(/\s{2,}/g, ' ')
  .replace(/[^\x20-\x7E\n]/g, '')
  .trim()

// pdf-parse (pdf.js 1.9) intermittently throws "bad XRef entry" on the first
// parse of a perfectly valid file, then succeeds on an immediate retry, so a
// single failure is not treated as a bad document.
async function parseWithRetry(buffer, attempts = 3) {
  let lastError
  for (let i = 1; i <= attempts; i++) {
    try {
      return await pdfParse(buffer)
    } catch (err) {
      lastError = err
      console.log(`⚠️  PDF parse attempt ${i}/${attempts} failed: ${err.message}`)
      await new Promise(r => setTimeout(r, 150))
    }
  }
  throw lastError
}

async function extractTextFromPDF(filePath) {
  let data
  try {
    const dataBuffer = fs.readFileSync(filePath)
    data = await parseWithRetry(dataBuffer)
  } catch (error) {
    throw new Error(`Could not read this PDF (${error.message}). It may be corrupted or password-protected.`)
  }

  let cleanText = clean(data.text || '')

  // Little or no embedded text: the PDF is probably a scan, so fall back to OCR.
  if (cleanText.length < 100) {
    console.log('📸 Little embedded text — attempting OCR...')
    try {
      const { createWorker } = require('tesseract.js')
      const worker = await createWorker('eng')
      const { data: { text: ocrText } } = await worker.recognize(filePath)
      await worker.terminate()

      if (ocrText && ocrText.trim().length > cleanText.length) {
        cleanText = clean(ocrText)
        console.log(`📸 OCR extracted ${cleanText.length} characters`)
      }
    } catch (ocrError) {
      console.log('⚠️  OCR failed:', ocrError.message)
    }
  }

  return { text: cleanText, pages: data.numpages, info: data.info }
}

module.exports = { extractTextFromPDF }
