require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.OPENAI_API_KEY; // Get API key from Render

// ✅ Add a homepage route to prevent "Cannot GET /"
app.get("/", (req, res) => {
    res.send("AI Connection Hub Backend is Running! 🚀");
});

// ✅ Main AI chat route
app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!apiKey) {
            console.error("Error: Missing OpenAI API Key");
            return res.status(500).json({ error: "Missing API Key" });
        }

        console.log("Sending request to OpenAI with message:", userMessage);

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
        console.log("OpenAI Response:", data);

        if (!data.choices) {
            console.error("Error: OpenAI response invalid", data);
            return res.status(500).json({ error: "Invalid OpenAI response" });
        }

        res.json({ response: data.choices[0].message.content });
    } catch (error) {
        console.error("Error Fetching OpenAI:", error);
        res.status(500).json({ error: "Failed to fetch AI response" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
