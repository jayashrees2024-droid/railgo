
const API_URL = "/api/tickets";

let allTickets = [];

// LOAD ALL TICKETS
async function loadTickets() {
    const table = document.getElementById("ticketTable");

    if (!table) return;

    table.innerHTML = `
        <tr>
            <td colspan="8" class="text-center">Loading tickets...</td>
        </tr>
    `;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load tickets");
        }

        allTickets = Array.isArray(data)
            ? data
            : Array.isArray(data.tickets)
                ? data.tickets
                : Array.isArray(data.bookings)
                    ? data.bookings
                    : [];

        displayTickets(allTickets);
        updateTicketCounts(allTickets);

    } catch (error) {
        console.error("Ticket loading error:", error);

        table.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">
                    Unable to load tickets. Check the API route.
                </td>
            </tr>
        `;
    }
}

// DISPLAY TICKETS
function displayTickets(tickets) {
    const table = document.getElementById("ticketTable");

    if (!table) return;

    table.innerHTML = "";

    if (tickets.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">No tickets found</td>
            </tr>
        `;
        return;
    }

    tickets.forEach(function(ticket) {
        const row = document.createElement("tr");

        function addCell(value) {
            const cell = document.createElement("td");

            cell.textContent =
                value === undefined || value === null || value === ""
                    ? "-"
                    : value;

            row.appendChild(cell);
        }

        addCell(ticket.passengerName);
        addCell(ticket.trainNumber);
        addCell(ticket.source);
        addCell(ticket.destination);
        addCell(ticket.journeyDate);
        addCell(ticket.seats ?? ticket.seatNumber);
        addCell("₹" + (ticket.fare ?? 0));

        const status = ticket.status || "Booked";
        const statusCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className =
            "badge " +
            (status.toLowerCase() === "cancelled"
                ? "bg-danger"
                : "bg-success");

        badge.textContent = status;

        statusCell.appendChild(badge);
        row.appendChild(statusCell);

        table.appendChild(row);
    });
}

// SEARCH TICKETS
function searchTickets() {
    const searchInput = document.getElementById("ticketSearch");

    if (!searchInput) return;

    const searchText = searchInput.value.toLowerCase().trim();

    const filteredTickets = allTickets.filter(function(ticket) {
        return (
            String(ticket.passengerName || "").toLowerCase().includes(searchText) ||
            String(ticket.username || "").toLowerCase().includes(searchText) ||
            String(ticket.trainNumber || "").toLowerCase().includes(searchText) ||
            String(ticket.source || "").toLowerCase().includes(searchText) ||
            String(ticket.destination || "").toLowerCase().includes(searchText)
        );
    });

    displayTickets(filteredTickets);
}

// UPDATE COUNTS IF ELEMENTS EXIST
function updateTicketCounts(tickets) {
    const total = document.getElementById("totalTickets");
    const booked = document.getElementById("bookedTickets");
    const cancelled = document.getElementById("cancelledTickets");

    if (total) {
        total.textContent = tickets.length;
    }

    if (booked) {
        booked.textContent = tickets.filter(function(ticket) {
            return (ticket.status || "Booked").toLowerCase() !== "cancelled";
        }).length;
    }

    if (cancelled) {
        cancelled.textContent = tickets.filter(function(ticket) {
            return (ticket.status || "").toLowerCase() === "cancelled";
        }).length;
    }
}

// LOGOUT
function adminLogout() {
    const confirmed = confirm("Are you sure you want to logout?");

    if (!confirmed) return;

    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    sessionStorage.removeItem("admin");
    sessionStorage.removeItem("adminToken");

    window.location.href = "index.html";
}

// INITIALIZE PAGE
document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById("ticketSearch");

    if (searchInput) {
        searchInput.addEventListener("input", searchTickets);
    }

    loadTickets();
});
