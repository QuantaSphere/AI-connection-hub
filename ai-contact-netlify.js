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
        } catch (error) {
            console.error("Error fetching AI response:", error);
            chatMessages.innerHTML += `<p><stron
