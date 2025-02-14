document.getElementById("hubspotForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent default form submission

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    try {
        const response = await fetch("/.netlify/functions/hubspot", { // ✅ Calls Netlify function
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, message })
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById("formStatus").innerHTML = "✅ Registration successful!";
        } else {
            document.getElementById("formStatus").innerHTML = "❌ Error registering. Try again.";
        }
    } catch (error) {
        console.error("🚨 Registration Error:", error);
        document.getElementById("formStatus").innerHTML = "❌ Something went wrong. Try again later.";
    }
});
