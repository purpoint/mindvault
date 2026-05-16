const { runRAG } = require('../ai/ragPipeline')
const Chat = require('../models/Chat.model')

// Ask a question
exports.queryKnowledge = async (req, res) => {
  try {
    const { question, documentId, chatId } = req.body

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ message: 'Question is required' })
    }

    console.log(`\n💬 Query from user ${req.user.id}: "${question}"`)

    const { answer, sources } = await runRAG(question, req.user.id, documentId || null)

    // Save to chat history
    let chat
    if (chatId) {
      chat = await Chat.findById(chatId)
    }
    if (!chat) {
      chat = await Chat.create({
        userId: req.user.id,
        title: question.slice(0, 50),
        messages: []
      })
    }

    chat.messages.push({ role: 'user', content: question, sources: [] })
    chat.messages.push({ role: 'assistant', content: answer, sources })
    await chat.save()

    res.json({ answer, sources, question, chatId: chat._id })

  } catch (error) {
    console.error('Query error:', error.message)
    res.status(500).json({ message: 'Failed to process query', error: error.message })
  }
}

// Get all chats for user
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id })
      .select('title createdAt messages')
      .sort({ updatedAt: -1 })
      .limit(20)
    res.json({ chats })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chats' })
  }
}

// Get single chat
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user.id })
    if (!chat) return res.status(404).json({ message: 'Chat not found' })
    res.json({ chat })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chat' })
  }
}

// Delete chat
exports.deleteChat = async (req, res) => {
  try {
    await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
    res.json({ message: 'Chat deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete chat' })
  }
}