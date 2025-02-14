require("dotenv").config();
const fetch = require("node-fetch");

exports.handler = async (event) => {
    try {
        if (!event.body) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing request body" }) };
        }

        const { name, email, message } = JSON.parse(event.body);
        const HUBSPOT_API_URL = "https://api.hubapi.com/crm/v3/objects/contacts";
        const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY; // ✅ Secure API Key from Netlify

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

        const response = await fetch(`${HUBSPOT_API_URL}?hapikey=${HUBSPOT_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
