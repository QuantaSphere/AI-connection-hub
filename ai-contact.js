const apiKey = "YOUR_OPENAI_API_KEY_HERE"; // Do NOT hardcode API keys!


async function getAIResponse(userMessage) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: [{ role: "user", content: userMessage }],
            max_tokens: 100
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
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

        const aiResponse = await getAIResponse(userMessage);
        chatMessages.innerHTML += `<p><strong>AI:</strong> ${aiResponse}</p>`;
    });
});
