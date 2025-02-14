require('dotenv').config();  // Load environment variables (if running locally)
const express = require('express');
const serverless = require('serverless-http');
const fetch = require('node-fetch');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express(); // ✅ Ensures app is properly initialized

app.use(cors({
    origin: [
        "https://quantasphere.github.io",
        "https://quantasphere.netlify.app"
    ],
    methods: "GET, POST"
}));

app.use(express.json());

// ✅ Load API keys from Netlify environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;

// ✅ Initialize OpenAI
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

// ✅ AI Chat API Route
app.post("/netlify-chat", async (req, res) => {
    try {
        const userMessage = req.body.message || "No message received";

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: userMessage }],
            temperature: 0.7
        });

        res.json({ response: response.choices[0].message.content });

    } catch (error) {
        console.error("🚨 OpenAI API Error:", error);
        res.status(500).json({ error: "Error generating AI response", details: error.message });
    }
});

// ✅ HubSpot Lead API Route
app.post("/hubspot-lead", async (req, res) => {
    try {
        const { email, firstName, lastName } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const hubspotResponse = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HUBSPOT_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                properties: {
                    email: email,
                    firstname: firstName || "",
                    lastname: lastName || ""
                }
            })
        });

        // ✅ Log raw response
        const rawResponse = await hubspotResponse.text();
        console.log("🚨 Raw HubSpot Response:", rawResponse);

        if (!rawResponse) {
            console.error("🚨 HubSpot API returned empty response");
            return res.status(500).json({ error: "HubSpot API returned empty response" });
        }

        const data = JSON.parse(rawResponse);

        if (!hubspotResponse.ok) {
            console.error("🚨 HubSpot API Error:", data);
            return res.status(500).json({ error: "HubSpot API request failed", details: data });
        }

        res.json({ message: "Lead added successfully!", data });

    } catch (error) {
        console.error("🚨 HubSpot API Error:", error);
        res.status(500).json({ error: "Failed to send data to HubSpot", details: error.message });
    }
});

// ✅ Debug Route
app.get("/", (req, res) => {
    res.json({ message: "✅ Netlify function is running!" });
});

// ✅ Export for Netlify Functions (Ensuring `app` is defined)
module.exports.handler = serverless(app);
