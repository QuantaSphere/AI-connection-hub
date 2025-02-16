require("dotenv").config();
const fetch = require("node-fetch");

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ success: false, error: "❌ Method Not Allowed. Use POST." }) 
        };
    }

    const { productName, productPrice } = JSON.parse(event.body || "{}");

    if (!productName || !productPrice) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ success: false, error: "❌ Missing product details." }) 
        };
    }

    try {
        console.log("🚀 Creating Square Checkout Link...");

        // ✅ Dynamically select API URL based on environment (Sandbox or Production)
        const API_URL = process.env.SQUARE_ENVIRONMENT === "sandbox" 
            ? "https://connect.squareupsandbox.com/v2/checkout"
            : "https://connect.squareup.com/v2/checkout";

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`  // ✅ Use Sandbox token if testing
            },
            body: JSON.stringify({
                idempotency_key: new Date().getTime().toString(), // Unique transaction key
                order: {
                    location_id: process.env.SQUARE_LOCATION_ID,  // ✅ Use Sandbox Location ID if testing
                    line_items: [
                        {
                            name: productName,
                            quantity: "1",
                            base_price_money: {
                                amount: Math.round(productPrice * 100), // Convert to cents
                                currency: "USD"
                            }
                        }
                    ]
                },
                checkout_options: {
                    allow_tipping: false,
                    redirect_url: "https://yourwebsite.com/order-success" // ✅ Change to your success page
                }
            })
        });

        const result = await response.json();

        if (!response.ok) {
            return { 
                statusCode: response.status, 
                body: JSON.stringify({ success: false, error: result.message || "❌ Failed to create checkout link." }) 
            };
        }

        return { 
            statusCode: 200, 
            body: JSON.stringify({ 
                success: true, 
                checkoutUrl: result.checkout.checkout_page_url  // ✅ Redirect user to Square Payment Page
            }) 
        };

    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ success: false, error: "❌ Square API Error." }) 
        };
    }
};
