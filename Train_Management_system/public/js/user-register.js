
document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const message = document.getElementById("message");

    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match!";
        message.style.color = "red";
        return;
    }

    if (password.length < 6) {
        message.textContent = "Password must contain at least 6 characters.";
        message.style.color = "red";
        return;
    }

    message.textContent = "Creating account...";
    message.style.color = "blue";

    try {
        const response = await fetch("/api/users/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                username: username,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Registration failed.");
        }

        message.textContent = "Account created successfully!";
        message.style.color = "green";

        setTimeout(function () {
            window.location.href = "user-login.html";
        }, 1500);

    } catch (error) {
        console.error("Registration error:", error);
        message.textContent = error.message || "Unable to connect to the server.";
        message.style.color = "red";
    }
});