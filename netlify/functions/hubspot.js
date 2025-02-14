app.post("/.netlify/functions/hubspot-lead", async (req, res) => {
    try {
        const { email, firstName, lastName } = req.body;

        // ✅ Check if email is provided
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

        // ✅ Check if response is OK before parsing
        if (!hubspotResponse.ok) {
            const errorText = await hubspotResponse.text(); // Read as text if JSON fails
            console.error("🚨 HubSpot API Error:", errorText);
            return res.status(500).json({ error: "HubSpot API request failed", details: errorText });
        }

        // ✅ Parse JSON safely
        const data = await hubspotResponse.json().catch(() => null);

        if (!data) {
            console.error("🚨 HubSpot API returned empty response");
            return res.status(500).json({ error: "HubSpot API returned empty response" });
        }

        res.json({ message: "Lead added successfully!", data });

    } catch (error) {
        console.error("🚨 HubSpot API Error:", error);
        res.status(500).json({ error: "Failed to send data to HubSpot", details: error.message });
    }
});
