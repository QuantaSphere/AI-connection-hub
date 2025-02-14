require("dotenv").config();
const fetch = require("node-fetch");

exports.handler = async (event) => {
    try {
        if (event.httpMethod !== "POST") {
            return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
        }

        const { name, email, message } = JSON.parse(event.body || "{}");

        if (!name || !email || !message) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields: name, email, message" }) };
        }

        const HUBSPOT_API_URL = "https://api.hubapi.com/crm/v3/objects/contacts";
        const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY; // ✅ Secure API Key

        if (!HUBSPOT_API_KEY) {
            console.error("❌ HubSpot API Key Missing!");
            return { statusCode: 500, body: JSON.stringify({ error: "Server Error: Missing HubSpot API Key" }) };
        }

        const data = {
            properties: {
                "email": email,
                "firstname": name,
                "message": message
            }
        };

        const response = await fetch(HUBSPOT_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${HUBSPOT_API_KEY}` // ✅ Correct Bearer Token Authorization
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            return { statusCode: response.status, body: JSON.stringify({ error: "HubSpot API error", details: errorText }) };
        }

        const result = await response.json();
        return { statusCode: 200, body: JSON.stringify({ success: true, hubspotResponse: result }) };
    } catch (error) {
        console.error("❌ HubSpot Netlify Function Error:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Failed to send data to HubSpot", details: error.message }) };
    }
};
