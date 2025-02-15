require("dotenv").config();
const fetch = require("node-fetch");

exports.handler = async (event) => {
    console.log("🔍 Received Request for Scheduling...");

    if (event.httpMethod !== "POST") {
        console.error("❌ Method Not Allowed: Only POST requests are accepted.");
        return { 
            statusCode: 405, 
            body: JSON.stringify({ success: false, error: "❌ Method Not Allowed. Use POST." }) 
        };
    }

    const { email } = JSON.parse(event.body || "{}");

    if (!email) {
        console.error("❌ Missing Email in Request");
        return { 
            statusCode: 400, 
            body: JSON.stringify({ success: false, error: "❌ Missing email." }) 
        };
    }

    if (!process.env.HUBSPOT_API_KEY) {
        console.error("❌ Missing HUBSPOT_API_KEY in Environment Variables");
        return { 
            statusCode: 500, 
            body: JSON.stringify({ success: false, error: "❌ Server misconfiguration. API key is missing." }) 
        };
    }

    try {
        console.log("🚀 Sending request to HubSpot API...");

        const response = await fetch("https://api.hubapi.com/crm/v3/objects/meetings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.HUBSPOT_API_KEY}`
            },
            body: JSON.stringify({
                properties: {
                    hs_meeting_type: "Smart Meeting",  // ✅ Correct HubSpot field name
                    hs_meeting_duration: 1800,  // ✅ Duration in SECONDS (30 min = 1800 sec)
                },
                associations: [
                    {
                        "to": {  // ✅ REQUIRED: Who this meeting is associated with
                            "email": email
                        },
                        "associationCategory": "HUBSPOT_DEFINED",
                        "associationTypeId": 3 // ✅ 3 = Contact
                    }
                ]
            })
        });

        const resultText = await response.text();
        console.log("🔍 HubSpot API Response:", resultText);

        let result;
        try {
            result = JSON.parse(resultText);
        } catch (error) {
            console.error("❌ Failed to parse HubSpot API JSON:", resultText);
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, error: "❌ Unexpected response from HubSpot API." })
            };
        }

        if (!response.ok) {
            console.error("❌ HubSpot API Error:", result);
            return { 
                statusCode: response.status, 
                body: JSON.stringify({ success: false, error: result.message || "❌ Failed to schedule." }) 
            };
        }

        console.log("✅ Meeting Scheduled Successfully:", result);

        return { 
            statusCode: 200, 
            body: JSON.stringify({ 
                success: true, 
                data: result,
                meetingLink: "https://meetings.hubspot.com/your-meeting" 
            }) 
        };

    } catch (error) {
        console.error("❌ Scheduling API Error:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ success: false, error: "❌ Failed to schedule due to server error." }) 
        };
    }
};
