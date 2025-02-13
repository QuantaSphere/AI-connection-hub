const cors = require('cors');
const express = require('express');
const app = express();

app.use(cors({
    origin: "https://lambent-cendol-123456.netlify.app", // Allow only Netlify
    methods: "GET, POST, OPTIONS",
    allowedHeaders: "Content-Type, Authorization"
}));

app.listen(5000, () => console.log("Server running on port 5000"));
