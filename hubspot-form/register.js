document.getElementById("hubspotForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent default form submission

    // ✅ Make sure to use unique variable names
    const fullName = document.getElementById("name")?.value || "";
    const email = document.getElementById("email")?.value || "";
    const message = document.getElementById("message")?.value || "";

    if (!fullName || !email || !message) {
        document.getElementById("formStatus").innerHTML = "❌ Please fill in all fields.";
        return;
    }

    try {
        const response = await fetch("/.netlify/functions/hubspot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: fullName, email, message })
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
