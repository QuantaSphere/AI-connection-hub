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

    if (!process.env.RECLAIM_API_KEY) {
        console.error("❌ Missing RECLAIM_API_KEY in Environment Variables");
        return { 
            statusCode: 500, 
            body: JSON.stringify({ success: false, error: "❌ Server misconfiguration. API key is missing." }) 
        };
    }

    try {
        console.log("🚀 Sending request to Reclaim API...");
        const response = await fetch("https://api.reclaim.ai/v1/scheduling", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.RECLAIM_API_KEY}`
            },
            body: JSON.stringify({
                inviteeEmail: email,
                meetingType: "Smart Meeting",
                durationMinutes: 30
            })
        });

        const resultText = await response.text(); // Capture raw response
        console.log("🔍 Reclaim API Response:", resultText);

        let result;
        try {
            result = JSON.parse(resultText);
        } catch (error) {
            console.error("❌ Failed to parse Reclaim API JSON:", resultText);
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, error: "❌ Unexpected response from Reclaim API." })
            };
        }

        if (!response.ok) {
            console.error("❌ Reclaim API Error:", result);
            return { 
                statusCode: response.status, 
                body: JSON.stringify({ success: false, error: result.error || "❌ Failed to schedule." }) 
            };
        }

        console.log("✅ Meeting Scheduled Successfully:", result);

        return { 
            statusCode: 200, 
            body: JSON.stringify({ 
                success: true, 
                data: result,
                meetingLink: "https://app.reclaim.ai/m/yawdie-gamer/quick-meeting" 
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
