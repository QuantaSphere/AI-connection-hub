const cors = require('cors');
const express = require('express');
const app = express();

app.use(cors({ 
    origin: [
        "https://quantasphere.github.io", 
        "https://lambent-cendol-123456.netlify.app"
    ], 
    methods: "GET, POST"
}));

app.use(express.json());

// GitHub Pages API Endpoint
app.post("/chat", (req, res) => {
    const userMessage = req.body.message || "No message received";
    res.json({ message: `GitHub AI Response to: ${userMessage}` });
});

// Netlify API Endpoint
app.post("/netlify-chat", (req, res) => {
    const userMessage = req.body.message || "No message received";
    res.json({ message: `Netlify AI Response to: ${userMessage}` });
});

// Debug Route to Check API is Running
app.get("/", (req, res) => {
    res.json({ message: "API is running! Use /chat (GitHub) or /netlify-chat (Netlify) with POST requests." });
});

// Start the Express Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
