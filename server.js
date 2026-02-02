import express from "express";
import { askAgent } from "./rag.js";
import "dotenv/config";

const app = express();
app.use(express.json());

import fs from "fs";

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

app.post("/feedback", async (req, res) => {
  try {
    const { question, answer, score, comments } = req.body;
    
    if (!question || !answer || score === undefined) {
      return res.status(400).json({ error: "Missing required feedback fields" });
    }

    const feedbackEntry = {
      timestamp: new Date().toISOString(),
      question,
      answer,
      score, // e.g., 1 for thumbs up, 0 for thumbs down
      comments: comments || ""
    };

    let feedbackData = [];
    if (fs.existsSync("feedback.json")) {
      const fileContent = fs.readFileSync("feedback.json", "utf8");
      feedbackData = JSON.parse(fileContent || "[]");
    }

    feedbackData.push(feedbackEntry);
    fs.writeFileSync("feedback.json", JSON.stringify(feedbackData, null, 2));

    console.log(`Feedback received for: "${question}" (Score: ${score})`);
    res.json({ message: "Feedback saved successfully" });
  } catch (error) {
    console.error("Feedback error:", error);
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AI Agent running on port ${PORT}`);
});
