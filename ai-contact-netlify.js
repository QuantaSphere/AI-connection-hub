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
    try {
        const response = await fetch("/.netlify/functions/hubspot", { // ✅ Calls Netlify function instead
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
        return null; // Returning null to handle errors better
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
        const userMessage = userInput.value.trim();
        if (!userMessage) return; // Prevent empty messages

        chatMessages.innerHTML += `<p><strong>You:</strong> ${userMessage}</p>`;
        userInput.value = "";

        try {
            const aiResponse = await getAIResponse(userMessage);
            chatMessages.innerHTML += `<p><strong>AI:</strong> ${aiResponse}</p>`;

            // ✅ Ask for user details only AFTER AI response is shown
            setTimeout(async () => {
                const userName = prompt("Enter your name:");
                const userEmail = prompt("Enter your email:");

                if (userName && userEmail) {
                    const hubspotResponse = await sendToHubSpot(userName, userEmail, userMessage);
                    if (hubspotResponse) {
                        chatMessages.innerHTML += `<p><strong>AI:</strong> Thank you, ${userName}. I'll save this for future reference!</p>`;
                    } else {
                        chatMessages.innerHTML += `<p><strong>AI:</strong> Sorry, I couldn't save your info. Please try again later.</p>`;
                    }
                }
            }, 1000); // Delay prompts to avoid UI blocking
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
