require("dotenv").config();
const fetch = require("node-fetch");

exports.handler = async (event) => {
    try {
        const { name, email, message } = JSON.parse(event.body);
        const HUBSPOT_API_URL = "https://api.hubapi.com/crm/v3/objects/contacts";
        const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY; // ✅ Secure access in backend

        if (!HUBSPOT_API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Missing HubSpot API Key" }),
            };
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

        const result = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, hubspotResponse: result }),
        };
    } catch (error) {
        console.error("❌ Error in Netlify HubSpot Function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to send data to HubSpot" }),
        };
    }
};
