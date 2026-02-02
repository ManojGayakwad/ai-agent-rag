// ingest.js
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { QdrantVectorStore } from "@langchain/qdrant";
import fs from "fs";
import "dotenv/config";

const text = fs.readFileSync("data/docs.txt", "utf8");

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 100,
});

const docs = await splitter.createDocuments([text]);

const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: "text-embedding-004", // Latest Google embedding model
});

console.log("Ingesting documents into Qdrant...");

await QdrantVectorStore.fromDocuments(docs, embeddings, {
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
  collectionName: "knowledge_base",
});

console.log("Ingestion complete!");
