
const API_URL = "/api/stations";
const form = document.getElementById("stationForm");
const table = document.getElementById("stationTable");
const stationSearch = document.getElementById("stationSearch");

let editStationId = null;

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const station = {
        stationCode: document.getElementById("stationCode").value.trim(),
        stationName: document.getElementById("stationName").value.trim(),
        city: document.getElementById("city").value.trim(),
        state: document.getElementById("state").value.trim(),
        platformCount: Number(document.getElementById("platformCount").value),
        stationType: document.getElementById("stationType").value,
        contactNumber: document.getElementById("contactNumber").value.trim(),
        stationStatus: document.getElementById("stationStatus").value
    };

    try {
        const url = editStationId
            ? API_URL + "/" + encodeURIComponent(editStationId)
            : API_URL;

        const response = await fetch(url, {
            method: editStationId ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(station)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to save station");
        }

        alert(data.message || (editStationId
            ? "Station updated successfully"
            : "Station added successfully"));

        editStationId = null;
        form.reset();
        changeButtonToAdd();
        await loadStations();

    } catch (error) {
        console.error(error);
        alert(error.message || "Unable to save station");
    }
});

// SEARCH STATIONS
if (stationSearch) {
    stationSearch.addEventListener("input", filterStations);
}

function filterStations() {
    const searchText = stationSearch.value.toLowerCase().trim();

    table.querySelectorAll("tr").forEach(function (row) {
        const rowText = row.textContent.toLowerCase();
        row.style.display = rowText.includes(searchText) ? "" : "none";
    });
}

// DISPLAY STATIONS
async function loadStations() {
    table.innerHTML = `
        <tr><td colspan="9" class="text-center">Loading stations...</td></tr>
    `;

    try {
        const response = await fetch(API_URL);
        const stations = await response.json();

        if (!response.ok) {
            throw new Error(stations.message || "Unable to load stations");
        }

        table.innerHTML = "";

        if (!Array.isArray(stations) || stations.length === 0) {
            table.innerHTML = `
                <tr><td colspan="9" class="text-center">No stations added yet.</td></tr>
            `;
            return;
        }

        stations.forEach(function (station) {
            const row = document.createElement("tr");

            addCell(row, station.stationCode);
            addCell(row, station.stationName);
            addCell(row, station.city);
            addCell(row, station.state);
            addCell(row, station.platformCount ?? "-");
            addCell(row, station.stationType || "-");
            addCell(row, station.contactNumber || "-");
            addCell(row, station.stationStatus || "-");

            const actionCell = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "btn btn-warning btn-sm me-1 mb-1";
            editButton.innerHTML = '<i class="bi bi-pencil"></i> Edit';
            editButton.addEventListener("click", function () {
                editStation(station._id);
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "btn btn-danger btn-sm mb-1";
            deleteButton.innerHTML = '<i class="bi bi-trash"></i> Delete';
            deleteButton.addEventListener("click", function () {
                deleteStation(station._id);
            });

            actionCell.appendChild(editButton);
            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);
            table.appendChild(row);
        });

        filterStations();

    } catch (error) {
        console.error(error);
        table.innerHTML = `
            <tr><td colspan="9" class="text-center text-danger">
                Unable to load stations. Check your server.
            </td></tr>
        `;
    }
}

function addCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value === undefined || value === null ? "-" : value;
    row.appendChild(cell);
}

// EDIT STATION
async function editStation(id) {
    try {
        const response = await fetch(API_URL);
        const stations = await response.json();

        if (!response.ok) {
            throw new Error("Unable to load stations");
        }

        const station = stations.find(function (item) {
            return item._id === id;
        });

        if (!station) {
            alert("Station not found");
            return;
        }

        document.getElementById("stationCode").value = station.stationCode || "";
        document.getElementById("stationName").value = station.stationName || "";
        document.getElementById("city").value = station.city || "";
        document.getElementById("state").value = station.state || "";
        document.getElementById("platformCount").value = station.platformCount ?? "";
        document.getElementById("stationType").value = station.stationType || "";
        document.getElementById("contactNumber").value = station.contactNumber || "";
        document.getElementById("stationStatus").value = station.stationStatus || "";

        editStationId = id;
        changeButtonToUpdate();

        window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error) {
        console.error(error);
        alert(error.message || "Unable to edit station");
    }
}

// DELETE STATION
async function deleteStation(id) {
    if (!confirm("Are you sure you want to delete this station?")) {
        return;
    }

    try {
        const response = await fetch(
            API_URL + "/" + encodeURIComponent(id),
            { method: "DELETE" }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to delete station");
        }

        alert(data.message || "Station deleted successfully");
        await loadStations();

    } catch (error) {
        console.error(error);
        alert(error.message || "Unable to delete station");
    }
}

function changeButtonToUpdate() {
    const button = form.querySelector("button[type='submit']");
    button.innerHTML = '<i class="bi bi-pencil-square"></i> Update Station';
}

function changeButtonToAdd() {
    const button = form.querySelector("button[type='submit']");
    button.innerHTML = '<i class="bi bi-plus-circle"></i> Add Station';
}

// INITIAL LOAD
loadStations();
