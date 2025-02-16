document.querySelectorAll(".buyNow").forEach(button => {
    button.addEventListener("click", async () => {
        const productName = button.getAttribute("data-name");
        const productPrice = button.getAttribute("data-price");

        try {
            const response = await fetch("/.netlify/functions/square-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productName, productPrice })
            });

            const result = await response.json();

            if (result.success) {
                window.location.href = result.checkoutUrl; // ✅ Redirect to Square Checkout
            } else {
                alert("Error processing payment: " + result.error);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });
});
