require('dotenv').config();
const cors = require('cors');
const express = require('express');
const serverless = require('serverless-http');
const { OpenAI } = require('openai');

const app = express();

// ✅ Apply CORS
app.use(cors({
    origin: [
        "https://quantasphere.github.io",
        "https://quantasphere.netlify.app"
    ],
    methods: "GET, POST"
}));

app.use(express.json());

// ✅ Ensure OpenAI API Key is loaded
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// ✅ Define Router (Required for Netlify)
const router = express.Router();

// ✅ Debugging Route (Check if Function Works)
router.get("/", (req, res) => {
    res.json({ message: "✅ Netlify function is running!" });
});

// ✅ AI Chat Route
router.post("/netlify-chat", async (req, res) => {
    try {
        const userMessage = req.body.message || "No message received";

        // ✅ Call OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: userMessage }],
            temperature: 0.7
        });

        res.json({ response: response.choices[0].message.content });

    } catch (error) {
        console.error("❌ OpenAI API Error:", error);
        res.status(500).json({ error: "Error generating AI response", details: error.message });
    }
});

// ✅ Fix: Use `/.netlify/functions/app` to match Netlify's expected path
app.use("/.netlify/functions/app", router);

// ✅ Export as Netlify Function
module.exports.handler = serverless(app);
