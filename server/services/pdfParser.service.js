const pdfParse = require('pdf-parse')
const fs = require('fs')

async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath)
    const data = await pdfParse(dataBuffer)

    let cleanText = data.text
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s{2,}/g, ' ')
      .replace(/[^\x20-\x7E\n]/g, '')
      .trim()

    // If pdf-parse extracted very little text, try OCR
    if (cleanText.length < 100) {
      console.log('📸 Text extraction poor — attempting OCR...')
      try {
        const { createWorker } = require('tesseract.js')
        const worker = await createWorker('eng')

        // Convert PDF first page to image-like buffer for OCR
        // tesseract.js can read PDF directly in some cases
        const { data: { text: ocrText } } = await worker.recognize(filePath)
        await worker.terminate()

        if (ocrText && ocrText.trim().length > cleanText.length) {
          cleanText = ocrText
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\s{2,}/g, ' ')
            .trim()
          console.log(`📸 OCR extracted ${cleanText.length} characters`)
        }
      } catch (ocrError) {
        console.log('⚠️ OCR failed, using original text:', ocrError.message)
      }
    }

    return {
      text: cleanText,
      pages: data.numpages,
      info: data.info
    }
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error.message}`)
  }
}

module.exports = { extractTextFromPDF }