const cors = require('cors');
const express = require('express');
const app = express();

app.use(cors());  // Allow all origins for debugging
app.use(express.json());

app.post("/chat", (req, res) => {
    const userMessage = req.body.message || "No message received";
    res.json({ message: `AI Response to: ${userMessage}` });
});

app.listen(5000, () => console.log("Server running on port 5000"));
