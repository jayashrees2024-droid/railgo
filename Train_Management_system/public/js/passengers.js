
const API_URL = "/api/users/all-bookings";

const table = document.getElementById("passengerTable");
const searchInput = document.getElementById("passengerSearch");

let allBookings = [];

// Safely display text
function safe(value) {
    return String(value ?? "-").replace(/[&<>"']/g, function(char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];
    });
}

// Format date
function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return safe(value);
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

// Load passenger bookings
async function loadPassengers() {
    if (!table) {
        console.error("Passenger table not found. Check passengers.html.");
        return;
    }

    table.innerHTML = `
        <tr>
            <td colspan="8" class="text-center py-4">
                Loading passenger bookings...
            </td>
        </tr>
    `;

    try {
        const response = await fetch(API_URL);
        const responseText = await response.text();

        let data;

        try {
            data = JSON.parse(responseText);
        } catch (error) {
            throw new Error(
                "The bookings API did not return JSON. Check the API route."
            );
        }

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to load passenger bookings."
            );
        }

        // Support different backend response formats
        if (Array.isArray(data)) {
            allBookings = data;
        } else if (Array.isArray(data.bookings)) {
            allBookings = data.bookings;
        } else if (Array.isArray(data.allBookings)) {
            allBookings = data.allBookings;
        } else if (Array.isArray(data.tickets)) {
            allBookings = data.tickets;
        } else {
            throw new Error(
                "The API response does not contain a bookings array. Check routes/userRoutes.js."
            );
        }

        updateStats();
        displayPassengers(allBookings);

    } catch (error) {
        console.error("Passenger loading error:", error);

        table.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger py-4">
                    ${safe(error.message)}
                </td>
            </tr>
        `;

        // Reset summary cards when loading fails
        setText("totalBookings", "—");
        setText("totalPassengers", "—");
        setText("totalTrains", "—");
    }
}

// Update summary cards
function updateStats() {
    const passengers = new Set(
        allBookings.map(function(item) {
            return item.username || item.passengerName;
        }).filter(Boolean)
    );

    const trainNumbers = new Set(
        allBookings.map(function(item) {
            return item.trainNumber;
        }).filter(Boolean)
    );

    setText("totalBookings", allBookings.length);
    setText("totalPassengers", passengers.size);
    setText("totalTrains", trainNumbers.size);
}

// Update an element's text
function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

// Display bookings in the table
function displayPassengers(bookings) {
    if (!table) return;

    table.innerHTML = "";

    if (bookings.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5">
                    <div class="fs-2 mb-2">🚆</div>
                    <strong>No user bookings yet</strong>
                    <div class="text-secondary small mt-1">
                        Passenger records will appear here when users book tickets.
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    bookings.forEach(function(booking) {
        const row = document.createElement("tr");

        const passengerName =
            booking.passengerName || booking.username || "-";

        const username = booking.username || "-";
        const trainNumber = booking.trainNumber || "-";
        const source = booking.source || "-";
        const destination = booking.destination || "-";
        const journeyDate = formatDate(booking.journeyDate);
        const seats = booking.seats ?? booking.seatNumber ?? "-";
        const fare = booking.fare ?? "-";
        const bookingDate = formatDate(
            booking.bookingDate || booking.createdAt
        );

        row.innerHTML = `
            <td><strong>${safe(passengerName)}</strong></td>
            <td>${safe(username)}</td>
            <td><span class="train-badge">${safe(trainNumber)}</span></td>
            <td>${safe(source)} → ${safe(destination)}</td>
            <td>${journeyDate}</td>
            <td>${safe(seats)}</td>
            <td>${fare === "-" ? "-" : "₹" + safe(fare)}</td>
            <td>${bookingDate}</td>
        `;

        table.appendChild(row);
    });
}

// Search passenger bookings
if (searchInput) {
    searchInput.addEventListener("input", function() {
        const query = this.value.trim().toLowerCase();

        const filtered = allBookings.filter(function(booking) {
            return [
                booking.passengerName,
                booking.username,
                booking.trainNumber,
                booking.trainName,
                booking.source,
                booking.destination
            ].some(function(value) {
                return String(value ?? "")
                    .toLowerCase()
                    .includes(query);
            });
        });

        displayPassengers(filtered);
    });
}

// Start loading
loadPassengers();
