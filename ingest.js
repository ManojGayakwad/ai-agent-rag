// ingest.js
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import fs from "fs";
import path from "path";
import "dotenv/config";

const DATA_DIR = "data";
const pdfFiles = fs.readdirSync(DATA_DIR).filter(file => file.endsWith(".pdf"));

if (pdfFiles.length === 0) {
  console.log("No PDF files found in data directory. Please add some .pdf files.");
  process.exit(1);
}

const allDocs = [];

for (const file of pdfFiles) {
  console.log(`Loading PDF: ${file}...`);
  const loader = new PDFLoader(path.join(DATA_DIR, file));
  const docs = await loader.load();
  allDocs.push(...docs);
}

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const splitDocs = await splitter.splitDocuments(allDocs);

const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: "text-embedding-004",
});

console.log(`Ingesting ${splitDocs.length} document chunks into Qdrant...`);

await QdrantVectorStore.fromDocuments(splitDocs, embeddings, {
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
  collectionName: "knowledge_base",
});

console.log("Ingestion complete!");
