// rag.js
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import "dotenv/config";

const model = new ChatGoogleGenerativeAI({
  modelName:"gemini-3-flash-preview",
  apiKey: process.env.GOOGLE_API_KEY,
  maxOutputTokens: 2048,
});

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

    const response = await model.invoke([
      ["human", `You are a helpful AI agent. Answer ONLY from the context provided below.\n\nContext:\n${context}\n\nQuestion: ${question}`]
    ]);

    return response.content;
  } catch (error) {
    console.error("Error in RAG process:", error);
    return "An error occurred while processing your request.";
  }
}
