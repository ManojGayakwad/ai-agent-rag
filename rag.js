// rag.js
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import fs from "fs";
import "dotenv/config";

const model = new ChatGoogleGenerativeAI({
  modelName:process.env.MODEL_NAME,
  apiKey: process.env.GOOGLE_API_KEY,
  maxOutputTokens: 2048,
});

// Load few-shot examples from example.jsonl
function loadExamples() {
  try {
    const data = fs.readFileSync("example.jsonl", "utf8");
    return data
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        try {
          const { question, answer } = JSON.parse(line);
          return `Question: ${question}\nAnswer: ${answer}`;
        } catch (e) {
          console.error(`Error parsing JSONL line: "${line}"`, e.message);
          return null;
        }
      })
      .filter(line => line !== null)
      .join("\n\n");
  } catch (error) {
    console.error("Warning: Could not load example.jsonl", error.message);
    return "";
  }
}

const fewShotExamples = loadExamples();

export async function askAgent(question) {
  try {
    const store = await QdrantVectorStore.fromExistingCollection(
      new GoogleGenerativeAIEmbeddings({
        modelName: "text-embedding-004",
      }),
      {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
        collectionName: "knowledge_base",
      }
    );

    const retriever = store.asRetriever(4);
    const docs = await retriever.invoke(question);

    if (docs.length === 0) {
      return "I couldn't find any relevant information in my knowledge base.";
    }

    const context = docs.map(d => d.pageContent).join("\n");

    const prompt = `You are a helpful AI agent. Answer ONLY from the context provided below.
If the answer is not in the context, use the tone and style demonstrated in the examples.

### Examples of how to answer:
${fewShotExamples}

### Context:
${context}

### User Question:
${question}

### Answer:`;

    const response = await model.invoke([
      ["human", prompt]
    ]);

    return response.content;
  } catch (error) {
    console.error("Error in RAG process:", error);
    return "An error occurred while processing your request.";
  }
}
