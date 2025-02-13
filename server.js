require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// ✅ Fix CORS issue by allowing requests from your frontend
app.use(cors({
    origin: "https://quantasphere.github.io", // Allow requests from your frontend
    methods: "GET,POST",
    allowedHeaders: "Content-Type,Authorization"
}));

app.use(express.json());

const apiKey = process.env.OPENAI_API_KEY; // Get API key from Render

// ✅ Homepage route (for testing)
app.get("/", (req, res) => {
    res.send("AI Connection Hub Backend is Running! 🚀");
});

// ✅ OpenAI Chat Route
app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!apiKey) {
            console.error("🚨 ERROR: Missing OpenAI API Key!");
            return res.status(500).json({ error: "Missing API Key" });
        }

        console.log("📩 Sending request to OpenAI with message:", userMessage);

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [{ role: "user", content: userMessage }],
                max_tokens: 100
            })
        });

        const data = await response.json();
        console.log("📩 OpenAI Response:", JSON.stringify(data, null, 2));

        if (!data.choices) {
            console.error("🚨 ERROR: OpenAI response invalid", data);
            return res.status(500).json({ error: "Invalid OpenAI response" });
        }

        res.json({ response: data.choices[0].message.content });
    } catch (error) {
        console.error("🚨 ERROR Fetching OpenAI:", error);
        res.status(500).json({ error: "Failed to fetch AI response" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
