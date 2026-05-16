const router = require('express').Router()
const authMiddleware = require('../middleware/auth.middleware')
const { queryKnowledge, getChats, getChatById, deleteChat } = require('../controllers/query.controller')

router.post('/', authMiddleware, queryKnowledge)
router.get('/chats', authMiddleware, getChats)
router.get('/chats/:id', authMiddleware, getChatById)
router.delete('/chats/:id', authMiddleware, deleteChat)

module.exports = router