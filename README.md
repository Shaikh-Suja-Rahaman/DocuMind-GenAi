<div align="center">
  <h1>📚 DocuMind</h1>
  <p><strong>A minimalist, high-performance Retrieval-Augmented Generation (RAG) platform.</strong></p>
  <p><i>Architected & Developed by <b>Suja Rahaman</b></i></p>

  <br />

  [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![NVIDIA NIM](https://img.shields.io/badge/AI_Engine-NVIDIA_NIM-76B900?style=flat-square&logo=nvidia)](https://build.nvidia.com/)

</div>

---

## 📖 Overview

**DocuMind** transforms your static documents—PDFs, CSVs, and plain text files—into an interactive, conversational intelligence layer. Designed with a focus on simplicity, speed, and accuracy, it ensures that every generated answer is strictly grounded in the context you provide, completely eliminating AI hallucinations.

## ✨ Key Features

- **Minimalist Premium UI**: A clean, distraction-free monochrome interface designed for extended research sessions.
- **Precision Retrieval**: Built on a deterministic semantic pipeline powered by `nv-embedqa-e5-v5` embeddings.
- **Enterprise-Grade AI**: Orchestrated with **Meta Llama 3.1 70B Instruct** via the NVIDIA NIM platform for unparalleled reasoning capabilities.
- **Real-Time Citations**: Every response includes precise, click-to-view source evidence referencing the exact chunks of your uploaded documents.
- **Zero Configuration Fallback**: Seamlessly degrades to mock-responses if you just want to test the UI without an API key.

## 🏗️ Architecture

At its core, DocuMind bridges the gap between fast front-end interactions and heavy machine-learning workflows:

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | `Next.js 16` & `React` | Blazing fast, server-rendered application shell. |
| **Styling** | `Tailwind CSS 4.0` | Utility-first styling for a sleek, responsive design. |
| **Vector DB** | `In-Memory / Qdrant` | Efficient, high-dimensional storage for semantic matching. |
| **Embeddings** | `NVIDIA e5-v5` | Maps text chunks into a 1024-dimension semantic space. |
| **LLM** | `Llama 3.1 70B` | Generates highly accurate, grounded conversational responses. |

## 🚀 Getting Started

Follow these instructions to run the project on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/en) (v18+)
- [pnpm](https://pnpm.io/) package manager
- **(Optional)** An NVIDIA API Key to enable real AI responses.

### 1. Installation

Clone the repository and install the required dependencies:

```bash
git clone <repository-url>
cd notebooklm-rag-pro
pnpm install
```

### 2. Environment Setup

Create a `.env` file in the root directory and add your NVIDIA API key (if you have one):

```env
# Get your key from build.nvidia.com
NVIDIA_API_KEY=nvapi-your-api-key-here
```
> **Note**: If you don't provide an API key, the app will automatically switch to **Mock Mode**, allowing you to explore the UI with dummy data.

### 3. Run the Development Server

Start the local server:

```bash
pnpm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser to start interacting with your documents.

---

<div align="center">
  <p>Built with ❤️ by <b>Suja Rahaman</b></p>
  <p><i>Pushing the boundaries of local document intelligence.</i></p>
</div>
