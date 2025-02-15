require("dotenv").config();
const fetch = require("node-fetch");

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "❌ Method Not Allowed. Use POST." };
    }

    const { email } = JSON.parse(event.body || "{}");

    if (!email) {
        return { statusCode: 400, body: "❌ Missing email." };
    }

    try {
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

        const result = await response.json();

        return { 
            statusCode: 200, 
            body: JSON.stringify({ 
                success: true, 
                data: result,
                meetingLink: "https://app.reclaim.ai/m/yawdie-gamer/quick-meeting" // Your Reclaim meeting link
            }) 
        };

    } catch (error) {
        console.error("❌ Scheduling API Error:", error);
        return { statusCode: 500, body: "❌ Failed to schedule." };
    }
};
