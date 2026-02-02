# Simple RAG Application with Google Gemini

This is a Retrieval-Augmented Generation (RAG) application built with Node.js, LangChain, Google Gemini, and Qdrant.

## What is RAG?

**Retrieval-Augmented Generation (RAG)** is a technique used to give Large Language Models (LLMs) like Gemini access to specific, up-to-date information that wasn't included in their original training data.

It works in three main steps:
1.  **Retrieval**: When you ask a question, the system searches a "knowledge base" (a vector database like Qdrant) for documents related to your query.
2.  **Augmentation**: The system takes the retrieved information and adds it to your original question as "context".
3.  **Generation**: The LLM uses this extra context to generate an accurate, grounded answer.

### Why use RAG?
-   **Accuracy**: Reduces "hallucinations" by forcing the AI to answer based on provided facts.
-   **Up-to-date**: You can update the knowledge base anytime without retraining the model.
-   **Privacy**: You can feed the AI internal documents without them being part of a public training set.

---

## Setup Instructions

### 1. Prerequisites
-   [Node.js](https://nodejs.org/) installed.
-   [Qdrant](https://qdrant.tech/documentation/quickstart/) running locally (usually at `http://localhost:6333`).
    -   *Easiest way: `docker run -p 6333:6333 qdrant/qdrant`*

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
QDRANT_URL=https://your-qdrant-cluster-url:6333
QDRANT_API_KEY=your_qdrant_api_key
PORT=3000
```

### 3. Installation
```bash
pnpm install
# or
npm install
```

---

## Usage

### 0. Diagnostics (Optional)
Check your connection to Qdrant Cloud:
```bash
node test-connection.js
```

### 1. Ingest Data
Add your text data to `data/docs.txt`, then run the ingestion script to populate your Qdrant Cloud collection:
```bash
npm run ingest
```

### 2. Run the Server
Start the AI Agent server:
```bash
npm run start
```

### 3. Ask a Question
Send a POST request to the `/agent` endpoint:
```bash
curl -X POST http://localhost:3000/agent \
     -H "Content-Type: application/json" \
     -d '{"question": "How do I install the Nexus Hub?"}'
```

Alternatively, run the direct test script:
```bash
node test-rag.js
```

---

## Project Structure
-   `ingest.js`: Processes `data/docs.txt`, splits text into chunks, creates embeddings using Gemini, and stores them in Qdrant Cloud.
-   `rag.js`: Handles the retrieval logic from Qdrant Cloud and generates responses using the Gemini LLM.
-   `server.js`: An Express server that exposes the RAG agent via an API.
-   `test-connection.js`: Utility to verify Qdrant Cloud connectivity.
-   `test-rag.js`: Utility to test the induction chain without starting the server.
-   `data/docs.txt`: The source of truth for the knowledge base.
