const apiKey = process.env.OPENAI_API_KEY;
async function getAIResponse(userMessage) {
    const response = await fetch("https://ai-connection-hub.onrender.com/netifly-chat", { // ✅ Use the correct Render backend URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
    });

    const data = await response.json();
    return data.response;
}

document.addEventListener("DOMContentLoaded", function () {
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
            chatMessages.innerHTML += `<p><strong>AI:</strong> Error fetching response. Try again later.</p>`;
        }
    });
});
