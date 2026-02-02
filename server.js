import express from "express";
import { askAgent } from "./rag.js";
import "dotenv/config";

const app = express();
app.use(express.json());

app.post("/agent", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "No question provided" });
    }
    
    console.log(`Processing question: ${question}`);
    const answer = await askAgent(question);
    res.json({ answer });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AI Agent running on port ${PORT}`);
});
