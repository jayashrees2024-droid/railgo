
// ======================================================
// RAILCONNECT - BOOK TICKET
// File: public/js/book-ticket.js
// ======================================================

document.addEventListener("DOMContentLoaded", function () {
    const bookingForm = document.getElementById("bookingForm");
    const message = document.getElementById("message");
    const bookButton = bookingForm
        ? bookingForm.querySelector('button[type="submit"]')
        : null;

    if (!bookingForm) {
        console.error("Booking form not found. Check id='bookingForm'.");
        return;
    }

    if (!message) {
        console.error("Message element not found. Check id='message'.");
        return;
    }

    console.log("Book Ticket JavaScript loaded successfully.");

    function showMessage(text, type) {
        message.innerHTML = "";

        const alertBox = document.createElement("div");
        alertBox.className = "alert alert-" + type;
        alertBox.textContent = text;

        message.appendChild(alertBox);
    }

    function getValue(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : "";
    }

    function getLoggedInUsername() {
        // Check common localStorage keys used by login pages.
        const directKeys = ["username", "loggedInUser"];

        for (const key of directKeys) {
            const value = localStorage.getItem(key);

            if (value && value !== "null" && value !== "undefined") {
                try {
                    const parsed = JSON.parse(value);

                    if (typeof parsed === "string") {
                        return parsed.trim();
                    }

                    if (parsed && parsed.username) {
                        return String(parsed.username).trim();
                    }
                } catch (error) {
                    return value.trim();
                }
            }
        }

        // Check common user-object keys.
        const objectKeys = ["user", "currentUser", "userData"];

        for (const key of objectKeys) {
            try {
                const stored = localStorage.getItem(key);

                if (!stored) continue;

                const user = JSON.parse(stored);

                if (user && user.username) {
                    return String(user.username).trim();
                }
            } catch (error) {
                console.warn("Could not read login data:", key);
            }
        }

        return "";
    }

    bookingForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        console.log("Book Ticket button clicked.");

        if (!bookingForm.checkValidity()) {
            bookingForm.reportValidity();
            return;
        }

        const username = getLoggedInUsername();

        const passengerName = getValue("passengerName");
        const trainName = getValue("trainName");
        const trainNumber = getValue("trainNumber");
        const source = getValue("source");
        const destination = getValue("destination");
        const journeyDate = getValue("journeyDate");
        const seats = Number(getValue("seats"));
        const fare = Number(getValue("fare"));

        if (!username) {
            showMessage(
                "Your login session was not found. Please log in again.",
                "warning"
            );
            console.error(
                "No username found in localStorage. Check your login JavaScript."
            );
            return;
        }

        if (
            !passengerName ||
            !trainName ||
            !trainNumber ||
            !source ||
            !destination ||
            !journeyDate
        ) {
            showMessage("Please fill in all booking details.", "warning");
            return;
        }

        if (!Number.isInteger(seats) || seats < 1) {
            showMessage("Please enter a valid number of seats.", "warning");
            return;
        }

        if (!Number.isFinite(fare) || fare <= 0) {
            showMessage("Please enter a valid total fare.", "warning");
            return;
        }

        const bookingData = {
            username: username,
            passengerName: passengerName,
            trainName: trainName,
            trainNumber: trainNumber,
            source: source,
            destination: destination,
            journeyDate: journeyDate,
            seats: seats,
            fare: fare
        };

        try {
            if (bookButton) {
                bookButton.disabled = true;
                bookButton.textContent = "Booking...";
            }

            showMessage("Processing your booking...", "info");

            const response = await fetch("/api/users/book-ticket", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(bookingData)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                showMessage(
                    data.message || "Booking failed. Please try again.",
                    "danger"
                );
                return;
            }

            const ticket = data.ticket || {};

            showMessage(
                "Ticket booked successfully! PNR: " +
                (ticket.pnr || "Generated") +
                ". Your booking is confirmed.",
                "success"
            );

            bookingForm.reset();

            // Keep the page on the booking screen and show confirmation.
            console.log("Booking successful:", data);

            if (ticket.pnr) {
                const viewPNR = document.createElement("a");
                viewPNR.href =
                    "pnr-status.html?pnr=" +
                    encodeURIComponent(ticket.pnr);
                viewPNR.className = "btn btn-primary mt-2";
                viewPNR.textContent = "View PNR Status";

                message.appendChild(document.createElement("br"));
                message.appendChild(viewPNR);
            }

        } catch (error) {
            console.error("Booking request failed:", error);

            showMessage(
                "Cannot connect to the server. Make sure node server.js is running.",
                "danger"
            );
        } finally {
            if (bookButton) {
                bookButton.disabled = false;
                bookButton.innerHTML =
                    '<i class="bi bi-check-circle-fill"></i> Confirm & Book Ticket';
            }
        }
    });
});