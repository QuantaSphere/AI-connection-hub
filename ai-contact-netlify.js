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

// ✅ HubSpot API Integration (ONLY for registration, NOT in chat)
async function sendToHubSpot(name, email, message) {
    try {
        const response = await fetch("/.netlify/functions/hubspot", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, message })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error("HubSpot API request failed.");
        }

        console.log("✅ HubSpot Lead Created:", result);
        return result;
    } catch (error) {
        console.error("❌ Error sending data to HubSpot:", error);
        return null;
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

    // ✅ Ensure chat box is initially hidden
    chatBox.style.display = "none";

    chatButton.addEventListener("click", function () {
        if (chatBox.style.display === "none" || chatBox.style.display === "") {
            chatBox.style.display = "block";
            chatButton.innerText = "❌ Close Chat";
        } else {
            chatBox.style.display = "none";
            chatButton.innerText = "💬 Chat with AI";
        }
    });

    sendButton.addEventListener("click", async function () {
        const userMessage = userInput.value.trim();
        if (!userMessage) return; // Prevent empty messages

        chatMessages.innerHTML += `<p><strong>You:</strong> ${userMessage}</p>`;
        userInput.value = "";

        try {
            const aiResponse = await getAIResponse(userMessage);
            chatMessages.innerHTML += `<p><strong>AI:</strong> ${aiResponse}</p>`;
        } catch (error) {
            console.error("Error fetching AI response:", error);
            chatMessages.innerHTML += `<p><strong>AI:</strong> Error fetching response. Try again later.</p>`;
        }
    });
}
document.getElementById("scheduleMeeting").addEventListener("click", async function () {
    const userEmail = document.getElementById("userEmail").value;

    if (!userEmail) {
        document.getElementById("scheduleStatus").innerText = "❌ Please enter an email.";
        return;
    }

    try {
        const response = await fetch("/.netlify/functions/reclaim-schedule", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail })
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById("scheduleStatus").innerText = "✅ Meeting Scheduled!";
        } else {
            document.getElementById("scheduleStatus").innerText = "❌ Error scheduling meeting.";
        }
    } catch (error) {
        console.error("🚨 Scheduling Error:", error);
        document.getElementById("scheduleStatus").innerText = "❌ Something went wrong.";
    }
});

// ✅ Ensure `initChat()` is globally available
window.initChat = initChat;

// ✅ Auto-run `initChat()` after script loads
document.addEventListener("DOMContentLoaded", initChat);
