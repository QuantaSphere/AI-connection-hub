require("dotenv").config();
const fetch = require("node-fetch");

exports.handler = async (event) => {
    try {
        if (event.httpMethod !== "POST") {
            return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed: Use POST instead" }) };
        }

        const { name, email, message } = JSON.parse(event.body || "{}");

        if (!name || !email || !message) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields: name, email, message" }) };
        }

        const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
        if (!HUBSPOT_API_KEY) {
            console.error("❌ HubSpot API Key Missing!");
            return { statusCode: 500, body: JSON.stringify({ error: "Server Error: Missing HubSpot API Key" }) };
        }

        const HUBSPOT_API_URL = "https://api.hubapi.com/crm/v3/objects/contacts";
        const SEARCH_URL = "https://api.hubapi.com/crm/v3/objects/contacts/search";

        // ✅ Check if the contact already exists
        const searchResponse = await fetch(SEARCH_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${HUBSPOT_API_KEY}`
            },
            body: JSON.stringify({
                filterGroups: [{
                    filters: [{
                        propertyName: "email",
                        operator: "EQ",
                        value: email
                    }]
                }]
            })
        });

        const searchData = await searchResponse.json();

        if (searchData.results && searchData.results.length > 0) {
            // ✅ Contact already exists, update instead of failing
            const existingContactId = searchData.results[0].id;
            console.log(`✅ Contact already exists, updating ID: ${existingContactId}`);

            const updateResponse = await fetch(`${HUBSPOT_API_URL}/${existingContactId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${HUBSPOT_API_KEY}`
                },
                body: JSON.stringify({
                    properties: {
                        "firstname": name,
                        "message": message
                    }
                })
            });

            const updateResult = await updateResponse.json();
            return { statusCode: 200, body: JSON.stringify({ success: true, message: "Contact updated", hubspotResponse: updateResult }) };
        }

        // ✅ If contact does not exist, create a new one
        const data = {
            properties: {
                "email": email,
                "firstname": name,
                "message": message
            }
        };

        const createResponse = await fetch(HUBSPOT_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${HUBSPOT_API_KEY}`
            },
            body: JSON.stringify(data)
        });

        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            return { statusCode: createResponse.status, body: JSON.stringify({ error: "HubSpot API error", details: errorText }) };
        }

        const result = await createResponse.json();
        return { statusCode: 200, body: JSON.stringify({ success: true, message: "New contact created", hubspotResponse: result }) };

    } catch (error) {
        console.error("❌ HubSpot Netlify Function Error:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Failed to send data to HubSpot", details: error.message }) };
    }
};
