const mongoose = require('mongoose')

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'completed', 'failed'],
    default: 'uploaded',
  },
  chunkCount: {
    type: Number,
    default: 0,
  },
  summary: {
    type: String,
    default: '',
  },
}, { timestamps: true })

module.exports = mongoose.model('Document', documentSchema)