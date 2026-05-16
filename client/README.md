# 🧠 MindVault — AI Personal Knowledge System

> Upload your PDFs. Ask anything. Get intelligent answers grounded in your own knowledge.

MindVault is a full-stack AI SaaS application that implements a complete **RAG (Retrieval-Augmented Generation)** pipeline. Upload documents, ask natural language questions, and receive AI-generated answers with source citations.

![RAG](https://img.shields.io/badge/RAG-Architecture-violet?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-6C47FF?style=for-the-badge)

---

## 🚀 Live Demo

Coming soon — deploying to Vercel + Render

---

## 🎯 What This Project Does

Modern users store knowledge across fragmented sources — PDFs, notes, research papers. Traditional search relies on keywords, making retrieval inefficient and unintelligent.

**MindVault solves this** by creating a semantic AI knowledge assistant that:
- Understands meaning, not just keywords
- Retrieves contextually relevant information
- Generates grounded answers from YOUR documents
- Cites exactly which document the answer came from

---

## 🏗️ Architecture

Upload PDF → Extract Text → Chunk (500w, 50 overlap) → Embed (HuggingFace)
↓
Pinecone Vector DB (384-dim cosine similarity index)
↓
User Query → Embed Query → Similarity Search → Retrieve Top-K Chunks
↓
RAG Prompt → Groq LLM (Llama 3.1) → Grounded Answer + Source Citations

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas |
| Vector Database | Pinecone (384-dim, cosine similarity) |
| Embeddings | Hugging Face (sentence-transformers/all-MiniLM-L6-v2) |
| LLM | Groq API (Llama 3.1 8B Instant) |
| Auth | JWT + bcrypt |
| PDF Processing | pdf-parse + Tesseract.js (OCR) |
| Security | express-rate-limit |

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register/login with bcrypt password hashing
- 📤 **PDF Upload** — Drag-and-drop with upload progress bar
- 🔄 **Auto Processing** — PDF text extraction → chunking → embedding → vector storage
- 🧠 **Semantic Search** — Cosine similarity search across your knowledge base
- 💬 **AI Chat** — RAG-powered answers grounded in your documents
- 📄 **Document Selector** — Focus chat on specific documents or search all
- 📌 **Source Citations** — Every answer shows which document it came from
- 💾 **Chat History** — Conversations saved to MongoDB
- 🛡️ **Rate Limiting** — 10 AI queries/min to prevent abuse
- 🎨 **Premium UI** — Dark theme, glassmorphism, Framer Motion animations
- 📸 **OCR Support** — Scanned PDFs processed with Tesseract.js

---

## 🧠 Key AI Concepts Implemented

**Retrieval-Augmented Generation (RAG)**
Instead of relying on LLM memory (which causes hallucinations), MindVault retrieves relevant chunks from your documents and injects them into the prompt as context.

**Vector Embeddings**
Each text chunk is converted into a 384-dimensional vector using sentence-transformers. Similar meanings produce mathematically similar vectors.

**Cosine Similarity Search**
Pinecone finds the most relevant chunks by measuring the angle between the query vector and stored document vectors.

**Smart Chunking**
Documents split into 500-word chunks with 50-word overlap, ensuring no context is lost at boundaries.

---

## 📁 Project Structure

mindvault/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Route pages
│       ├── context/        # Auth context
│       ├── services/       # API calls
│       └── hooks/          # Custom hooks
└── server/                 # Node.js backend
├── routes/             # API routes
├── controllers/        # Business logic
├── services/           # PDF parsing, chunking, embeddings, Pinecone
├── ai/                 # RAG pipeline + prompt builder
├── models/             # MongoDB schemas
└── middleware/         # Auth + upload + rate limiting

---

## 🏃 Running Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- Pinecone account (free)
- Hugging Face account (free)
- Groq account (free)

### Setup

```bash
# Clone the repo
git clone https://github.com/purpoint/mindvault.git
cd mindvault

# Install frontend dependencies
cd client && npm install

# Install backend dependencies
cd ../server && npm install
```

### Environment Variables

Create `server/.env`:

PORT=8000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
HF_API_KEY=your_huggingface_key
GROQ_API_KEY=your_groq_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=mindvault

Create `client/.env`:

VITE_API_URL=http://localhost:8000

### Run

```bash
# Terminal 1 — Frontend
cd client && npm run dev

# Terminal 2 — Backend
cd server && npm run dev
```

Open `http://localhost:5173`

---

## 💡 Interview Talking Points

| Question | Answer |
|---|---|
| What is RAG? | Retrieve relevant chunks from documents, inject as context, generate grounded answers |
| Why Pinecone over MongoDB? | MongoDB does keyword match; Pinecone does cosine similarity on vectors — finds meaning |
| Why chunk documents? | LLMs have token limits; smaller chunks = precise retrieval; overlap = no context loss |
| What is cosine similarity? | Measures angle between vectors — 1.0 = identical meaning, 0 = unrelated |
| How do you prevent hallucination? | RAG grounds answers in retrieved chunks; prompt says only use this context |
| Why Groq? | Groq is faster and free; RAG context does the heavy lifting, not raw LLM knowledge |

---

## 👨‍💻 Built By

**Manan Ghodasara** — JSS Academy of Technical Education, Bengaluru

---

*Built with React, Node.js, Pinecone, Hugging Face and Groq*

