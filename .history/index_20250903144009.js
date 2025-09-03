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

// ✅ Serve simple frontend at "/"
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Text to Image</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        input { width: 300px; padding: 8px; }
        button { padding: 8px 12px; margin-left: 10px; }
        img { display: block; margin-top: 20px; max-width: 500px; }
      </style>
    </head>
    <body>
      <h2>Text → Image Generator</h2>
      <input id="prompt" type="text" placeholder="Enter your prompt" />
      <button onclick="generateImage()">Generate</button>
      <div id="result"></div>

      <script>
        async function generateImage() {
          const prompt = document.getElementById("prompt").value;
          const resultDiv = document.getElementById("result");
          resultDiv.innerHTML = "Generating...";

          const res = await fetch("/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
          });

          const data = await res.json();
          if (data.image) {
            resultDiv.innerHTML = '<img src="' + data.image + '" />';
          } else {
            resultDiv.innerHTML = "Error: " + (data.error || "No image generated");
          }
        }
      </script>
    </body>
    </html>
  `);
});

// ✅ API to generate image
app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image-preview",
    });

    const result = await model.generateContent(prompt);

    const parts = result.response.candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData) {
        const imageBase64 = part.inlineData.data;
        return res.json({ image: `data:image/png;base64,${imageBase64}` });
      }
    }

    return res.status(500).json({ error: "No image returned" });
  } catch (err) {
    console.error("Error generating image:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
