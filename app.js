require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { OpenAI } = require('openai');

const app = express();
app.use(cors({ 
    origin: [
        "https://quantasphere.github.io", 
        "https://lambent-cendol-123456.netlify.app"
    ], 
    methods: "GET, POST"
}));

app.use(express.json());

// Initialize OpenAI with the API key from `.env`
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY  // ✅ Uses `.env` for security
});

// ✅ Ensure `/netlify-chat` Uses OpenAI Securely
app.post("/netlify-chat", async (req, res) => {
    try {
        const userMessage = req.body.message || "No message received";

        // Call OpenAI with the API key from `.env`
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: userMessage }],
            temperature: 0.7
        });

        // Return the AI's response
        const aiResponse = response.choices[0].message.content;
        res.json({ response: aiResponse });

    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        res.status(500).json({ error: "Error generating AI response" });
    }
});

// Debug Route
app.get("/", (req, res) => {
    res.json({ message: "API is running! Use POST /netlify-chat to chat with AI." });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
