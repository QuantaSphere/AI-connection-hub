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
        console.log(`🔎 Searching for HubSpot Contact ID for email: ${email}...`);

        // Step 1: Find the Contact ID from the email
        const searchResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.HUBSPOT_API_KEY}`
            },
            body: JSON.stringify({
                "filterGroups": [
                    {
                        "filters": [
                            {
                                "propertyName": "email",
                                "operator": "EQ",
                                "value": email
                            }
                        ]
                    }
                ],
                "properties": ["id"]
            })
        });

        const searchData = await searchResponse.json();
        
        if (!searchResponse.ok || !searchData.results || searchData.results.length === 0) {
            console.error("❌ Contact not found in HubSpot:", searchData);
            return {
                statusCode: 404,
                body: JSON.stringify({ success: false, error: "❌ Contact not found in HubSpot. Please ensure the email is correct." })
            };
        }

        const contactId = searchData.results[0].id;
        console.log(`✅ Found HubSpot Contact ID: ${contactId}`);

        // Step 2: Calculate Meeting Start/End Time
        const startTime = new Date();
        startTime.setMinutes(startTime.getMinutes() + 10);  // Meeting starts 10 min from now

        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 30);  // Meeting lasts 30 min

        // Step 3: Create the Meeting using Contact ID
        console.log("🚀 Sending request to HubSpot API to create a meeting...");

        const meetingResponse = await fetch("https://api.hubapi.com/crm/v3/objects/meetings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.HUBSPOT_API_KEY}`
            },
            body: JSON.stringify({
                properties: {
                    hs_meeting_title: "Smart Meeting",  // ✅ REQUIRED: Title of meeting
                    hs_meeting_start_time: startTime.toISOString(),  // ✅ REQUIRED: Start time
                    hs_meeting_end_time: endTime.toISOString(),  // ✅ REQUIRED: End time
                    hs_meeting_duration: 1800,  // ✅ Duration in SECONDS (30 min = 1800 sec)
                    hs_meeting_location: "Virtual",  // ✅ REQUIRED: Can be "Virtual" or "In Person"
                    hs_meeting_attendees: [contactId]  // ✅ REQUIRED: List of attendees (Contact ID)
                },
                associations: [
                    {
                        "to": { "id": contactId },  // ✅ Use Contact ID
                        "associationCategory": "HUBSPOT_DEFINED",
                        "associationTypeId": 3 // ✅ 3 = Contact
                    }
                ]
            })
        });

        const resultText = await meetingResponse.text();
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

        if (!meetingResponse.ok) {
            console.error("❌ HubSpot API Error:", result);
            return { 
                statusCode: meetingResponse.status, 
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
