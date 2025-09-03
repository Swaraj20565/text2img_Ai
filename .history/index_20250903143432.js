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
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image-preview",
    });

    const result = await model.generateContent(prompt);

    // Extract inline image data
    const parts = result.response.candidates[0].content.parts;

    for (const part of parts) {
      if (part.inlineData) {
        const imageBase64 = part.inlineData.data;
        // Send as Data URL so frontend can render directly
        return res.json({
          image: `data:image/png;base64,${imageBase64}`,
        });
      }
    }

    return res.status(500).json({ error: "No image returned" });
  } catch (err) {
    console.error("Error generating image:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});
