require("dotenv").config();
const fetch = require("node-fetch");

exports.handler = async (event) => {
    console.log("✅ Square Checkout Function Called");

    if (event.httpMethod !== "POST") {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ success: false, error: "❌ Method Not Allowed. Use POST." }) 
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

        // ✅ Ensure required environment variables exist
        if (!process.env.SQUARE_ACCESS_TOKEN || !process.env.SQUARE_LOCATION_ID) {
            console.error("❌ Missing Square API credentials in environment variables.");
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, error: "❌ Server misconfiguration. Square credentials missing." })
            };
        }

        // ✅ Step 1: Create a Payment Link Instead of Checkout
        console.log("🚀 Creating Square Payment Link...");
        const checkoutResponse = await fetch("https://connect.squareupsandbox.com/v2/checkout/payment-links", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
                "Square-Version": "2025-01-23"
            },
            body: JSON.stringify({
                idempotency_key: new Date().getTime().toString(),
                description: productName,
                order: {
                    location_id: process.env.SQUARE_LOCATION_ID,
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
                    redirect_url: "https://quantasphere.netlify.app/products/"
                }
            })
        });

        // ✅ Fix JSON Parsing Issue
        const checkoutText = await checkoutResponse.text();
        console.log("🔍 Square Payment Link API Response:", checkoutText);

        let checkoutData;
        try {
            checkoutData = JSON.parse(checkoutText);
        } catch (error) {
            console.error("❌ Failed to parse Square API response:", checkoutText);
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, error: "❌ Unexpected response from Square API." })
            };
        }

        if (!checkoutResponse.ok || !checkoutData.payment_link) {
            console.error("❌ Square Payment Link API Error:", checkoutData);
            return { 
                statusCode: 500, 
                body: JSON.stringify({ success: false, error: checkoutData.errors ? checkoutData.errors[0].detail : "❌ Failed to create Square checkout." }) 
            };
        }

        console.log("✅ Checkout Created:", checkoutData.payment_link.url);

        return { 
            statusCode: 200,
            body: JSON.stringify({ 
                success: true, 
                checkoutUrl: checkoutData.payment_link.url
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
