const Document = require('../models/Document.model')
const { processDocument } = require('../services/processor.service')
const fs = require('fs')

// Upload a PDF
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    // Save document metadata to MongoDB
    const document = await Document.create({
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      status: 'uploaded',
    })

    res.status(201).json({
      message: 'File uploaded successfully',
      document,
    })

    // Process document in background (after response sent)
    processDocument(document._id)
      .then(result => {
        console.log(`✅ Processing complete: ${result.totalChunks} chunks created`)
      })
      .catch(err => {
        console.error(`❌ Processing failed: ${err.message}`)
      })

  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message })
  }
}

// Get all documents for logged in user
exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
    res.json({ documents })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch documents' })
  }
}

// Delete a document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id
    })

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    // Delete file from disk
    const filePath = `uploads/${document.filename}`
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

    await document.deleteOne()
    res.json({ message: 'Document deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message })
  }
}