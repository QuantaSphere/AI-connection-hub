document.querySelectorAll(".buyNow").forEach((button) => {
    button.addEventListener("click", async (event) => {
        const productName = event.target.getAttribute("data-product-name");
        const productPrice = event.target.getAttribute("data-product-price");

        if (!productName || !productPrice) {
            alert("❌ Product details are missing.");
            return;
        }

        try {
            const response = await fetch("/.netlify/functions/square-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productName: productName,
                    productPrice: parseFloat(productPrice)
                })
            });

            const result = await response.json();

            if (result.success) {
                window.location.href = result.checkoutUrl; // ✅ Redirect to Square Payment Page
            } else {
                alert("Error processing payment: " + result.error);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });
});
