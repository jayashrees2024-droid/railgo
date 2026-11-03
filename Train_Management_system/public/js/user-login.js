document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    message.textContent = "Logging in...";
    message.style.color = "#126bfa";

    try {
        const response = await fetch("/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Login failed. Check your username and password.");
        }

        // Save user details
        const userData = {
            name: data.name,
            username: data.username,
            email: data.email
        };

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("username", data.username);

        message.textContent = "Login successful!";
        message.style.color = "green";

        // Open dashboard
        window.location.href = "user-dashboard.html";

    } catch (error) {
        console.error("Login error:", error);

        message.textContent =
            error.message || "Unable to connect to the server.";

        message.style.color = "red";
    }
});