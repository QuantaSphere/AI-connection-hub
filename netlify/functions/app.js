const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // ✅ Loaded from Netlify Environment Variables
});

exports.handler = async (event) => {
    try {
        // ✅ Allow CORS for your frontend
        const headers = {
            "Access-Control-Allow-Origin": "*", // Adjust if needed
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        // ✅ Handle preflight OPTIONS request
        if (event.httpMethod === "OPTIONS") {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: "CORS preflight successful" }),
            };
        }

        // ✅ Parse incoming request body
        const body = JSON.parse(event.body);
        const userMessage = body.message || "No message received";

        // ✅ Call OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: userMessage }],
            temperature: 0.7
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ response: response.choices[0].message.content }),
        };

    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error generating AI response", details: error.message }),
        };
    }
};
