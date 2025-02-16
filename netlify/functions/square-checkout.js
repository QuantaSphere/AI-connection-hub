require("dotenv").config();
const fetch = require("node-fetch");

exports.handler = async (event) => {
    console.log("✅ Square Checkout Function Called");

    if (event.httpMethod !== "POST") {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ success: false, error: "Method Not Allowed. Use POST." }) 
        };
    }

    try {
        const { productName, productPrice } = JSON.parse(event.body || "{}");

        if (!productName || !productPrice) {
            console.error("❌ Missing product details");
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, error: "❌ Missing product name or price." })
            };
        }

        console.log(`🔍 Creating Checkout for: ${productName} - $${productPrice}`);

        const response = await fetch("https://connect.squareupsandbox.com/v2/checkout/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
                idempotency_key: new Date().getTime().toString(),
                order: {
                    location_id: process.env.SQUARE_LOCATION_ID,
                    line_items: [
                        {
                            name: productName,
                            quantity: "1",
                            base_price_money: {
                                amount: productPrice * 100, // Convert price to cents
                                currency: "USD"
                            }
                        }
                    ]
                },
                redirect_url: "https://quantasphere.netlify.app/products/"
            })
        });

        const resultText = await response.text();
        console.log("🔍 Square API Response:", resultText);

        let result;
        try {
            result = JSON.parse(resultText);
        } catch (error) {
            console.error("❌ Failed to parse Square API response:", resultText);
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, error: "❌ Unexpected response from Square API." })
            };
        }

        if (!response.ok) {
            console.error("❌ Square API Error:", result);
            return { 
                statusCode: response.status, 
                body: JSON.stringify({ success: false, error: result.message || "❌ Failed to create checkout." }) 
            };
        }

        console.log("✅ Checkout Created Successfully:", result);

        return { 
            statusCode: 200,
            body: JSON.stringify({ 
                success: true, 
                checkoutUrl: result.checkout.checkout_page_url 
            }) 
        };

    } catch (error) {
        console.error("❌ Square API Error:", error);
        return { 
            statusCode: 500,
            body: JSON.stringify({ success: false, error: "❌ Failed to process Square Checkout." }) 
        };
    }
};
