import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';
dotenv.config();

const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    checkCompatibility: false
});

async function runTest() {
    try {
        console.log("Testing connection to:", process.env.QDRANT_URL);
        const result = await client.getCollections();
        console.log('Successfully connected! Collections:', result.collections);
    } catch (err) {
        console.error('Connectivity Error:', err.message);
        if (err.cause) console.error('Root Cause:', err.cause);
    }
}

runTest();