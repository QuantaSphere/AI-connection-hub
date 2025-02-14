// app.js (inside netlify/functions/)
const fetch = require("node-fetch");

exports.handler = async function(event) {
    try {
        const body = JSON.parse(event.body);
        const userMessage = body.message;

        const response = await fetch("https://lambent-cendol-123456.netlify.app/.netlify/functions/app", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer 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"
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [{ role: "user", content: userMessage }],
                max_tokens: 100
            })
        });

        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify({ response: data.choices[0].message.content })
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" })
        };
    }
};
