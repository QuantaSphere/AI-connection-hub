const cors = require('cors');
const express = require('express');
const app = express();

app.use(cors({
    origin: [
        "https://quantasphere.github.io",
        "https://lambent-cendol-123456.netlify.app"
    ],
    methods: "GET, POST, OPTIONS",
    allowedHeaders: "Content-Type, Authorization"
}));

app.listen(5000, () => console.log("Server running on port 5000"));
