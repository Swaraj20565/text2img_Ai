import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt required" });
    }

    // Use Gemini image model (preview model)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

    const result = await model.generateContent(prompt);
    console.log('====================================');
    console.log(result);
    console.log('====================================');
  }
  catch(err){

  }
});