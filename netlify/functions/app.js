require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { OpenAI } = require('openai');

const app = express();
app.use(cors({ 
    origin: [
        "https://quantasphere.github.io", 
        "https://quantaspherenetlifyapp.netlify.app/netlify/functions/"
    ], 
    methods: "GET, POST"
}));
app.use(express.json());

// ✅ Ensure OpenAI API Key is loaded
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// ✅ Correct POST route for Netlify
app.post("/netlify-chat", async (req, res) => {
    try {
        const userMessage = req.body.message || "No message received";

        // ✅ Call OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: userMessage }],
            temperature: 0.7
        });

        // ✅ Return AI's response
        res.json({ response: response.choices[0].message.content });

    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        res.status(500).json({ error: "Error generating AI response", details: error.message });
    }
});

// Debug Route
app.get("/", (req, res) => {
    res.json({ message: "API is running! Use POST /netlify-chat to chat with AI." });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
