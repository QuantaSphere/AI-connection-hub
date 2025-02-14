async function getAIResponse(userMessage) {
    const API_URL = "https://quantasphere.netlify.app/.netlify/functions/app/netlify-chat";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error("🚨 Error fetching AI response from Netlify:", error);
        return "Error: AI response not available.";
    }
}

// ✅ HubSpot API Integration for Lead Collection
async function sendToHubSpot(name, email, message) {
    const HUBSPOT_API_URL = "https://api.hubapi.com/crm/v3/objects/contacts";
    const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY; // ✅ Fetch from Netlify env variables


    const data = {
        properties: {
            "email": email,
            "firstname": name,
            "message": message
        }
    };

    try {
        const response = await fetch(`${HUBSPOT_API_URL}?hapikey=${HUBSPOT_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log("✅ HubSpot Lead Created:", result);
        return result;
    } catch (error) {
        console.error("❌ Error sending data to HubSpot:", error);
    }
}

// ✅ Ensure `initChat()` is defined
function initChat() {
    console.log("✅ AI Chat script initialized.");
    const chatButton = document.getElementById("openChat");
    const chatBox = document.getElementById("chatBox");
    const userInput = document.getElementById("userInput");
    const sendButton = document.getElementById("sendMessage");
    const chatMessages = document.getElementById("chatMessages");

    chatButton.addEventListener("click", function () {
        chatBox.style.display = chatBox.style.display === "none" ? "block" : "none";
    });

    sendButton.addEventListener("click", async function () {
        const userMessage = userInput.value;
        chatMessages.innerHTML += `<p><strong>You:</strong> ${userMessage}</p>`;
        userInput.value = "";

        try {
            const aiResponse = await getAIResponse(userMessage);
            chatMessages.innerHTML += `<p><strong>AI:</strong> ${aiResponse}</p>`;

            // ✅ Capture user details for HubSpot (Modify UI to collect name/email)
            const userName = prompt("Enter your name:");
            const userEmail = prompt("Enter your email:");

            if (userName && userEmail) {
                await sendToHubSpot(userName, userEmail, userMessage);
            }
        } catch (error) {
            console.error("Error fetching AI response:", error);
            chatMessages.innerHTML += `<p><strong>AI:</strong> Error fetching response. Try again later.</p>`;
        }
    });
}

// ✅ Ensure `initChat()` is globally available
window.initChat = initChat;

// ✅ Auto-run `initChat()` after script loads
initChat();
