const router = require('express').Router()
const authMiddleware = require('../middleware/auth.middleware')
const uploadMiddleware = require('../middleware/upload.middleware')
const {
  uploadDocument,
  getDocuments,
  deleteDocument
} = require('../controllers/upload.controller')

router.post('/', authMiddleware, uploadMiddleware.single('pdf'), uploadDocument)
router.get('/', authMiddleware, getDocuments)
router.delete('/:id', authMiddleware, deleteDocument)

module.exports = router