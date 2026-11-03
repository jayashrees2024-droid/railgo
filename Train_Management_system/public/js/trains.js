
const trainForm = document.getElementById("trainForm");
const trainTable = document.getElementById("trainTable");
const messageBox = document.getElementById("message");
const trainSearch = document.getElementById("trainSearch");

document.addEventListener("DOMContentLoaded", function () {
    loadTrains();
});

function showMessage(message, type) {
    messageBox.innerHTML = "";

    const alertBox = document.createElement("div");
    alertBox.className = "alert alert-" + type;
    alertBox.textContent = message;
    messageBox.appendChild(alertBox);

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Safely read JSON responses and detect HTML error pages.
async function readApiResponse(response) {
    const text = await response.text();

    let data;

    try {
        data = JSON.parse(text);
    } catch (error) {
        throw new Error(
            "The server returned HTML instead of JSON. Check the API URL and routes/trainRoutes.js."
        );
    }

    if (!response.ok) {
        throw new Error(
            data.message || "Request failed with status " + response.status
        );
    }

    return data;
}

// SEARCH
if (trainSearch) {
    trainSearch.addEventListener("input", filterTrains);
}

function filterTrains() {
    if (!trainSearch || !trainTable) return;

    const searchText = trainSearch.value.toLowerCase().trim();

    trainTable.querySelectorAll("tr").forEach(function (row) {
        row.style.display = row.textContent.toLowerCase().includes(searchText)
            ? ""
            : "none";
    });
}

// LOAD TRAINS
async function loadTrains() {
    trainTable.innerHTML =
        '<tr><td colspan="11" class="text-center">Loading trains...</td></tr>';

    try {
        const response = await fetch("/api/trains", {
            headers: { "Accept": "application/json" }
        });

        const trains = await readApiResponse(response);

        if (!Array.isArray(trains)) {
            throw new Error("The train API did not return a train list.");
        }

        trainTable.innerHTML = "";

        if (trains.length === 0) {
            trainTable.innerHTML =
                '<tr><td colspan="11" class="text-center">No trains added yet.</td></tr>';
            return;
        }

        trains.forEach(function (train) {
            const row = document.createElement("tr");

            addCell(row, train.trainNumber);
            addCell(row, train.trainName);
            addCell(row, train.trainType);
            addCell(row, train.source);
            addCell(row, train.destination);
            addCell(row, train.totalSeats);
            addCell(row, train.availableSeats ?? "Not set");
            addCell(row, train.fare == null ? "Not set" : "₹" + train.fare);
            addCell(row, train.departureTime);
            addCell(row, train.arrivalTime);

            const actionCell = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "btn btn-sm btn-warning me-1 mb-1";
            editButton.textContent = "Edit";
            editButton.addEventListener("click", function () {
                editTrain(train);
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "btn btn-sm btn-danger mb-1";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", function () {
                deleteTrain(train._id);
            });

            actionCell.appendChild(editButton);
            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);
            trainTable.appendChild(row);
        });

        filterTrains();

    } catch (error) {
        console.error("Load trains error:", error);

        trainTable.innerHTML =
            '<tr><td colspan="11" class="text-center text-danger"></td></tr>';

        trainTable.querySelector("td").textContent = error.message;
    }
}

function addCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value == null ? "-" : value;
    row.appendChild(cell);
}

// ADD OR UPDATE TRAIN
if (trainForm) {
    trainForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const trainId = document.getElementById("trainId").value;
        const totalSeats = Number(document.getElementById("totalSeats").value);
        const fare = Number(document.getElementById("fare").value);

        if (!Number.isInteger(totalSeats) || totalSeats < 1) {
            showMessage("Total seats must be a whole number greater than zero.", "danger");
            return;
        }

        if (!Number.isFinite(fare) || fare < 0) {
            showMessage("Please enter a valid fare per seat.", "danger");
            return;
        }

        const source = document.getElementById("source").value.trim();
        const destination = document.getElementById("destination").value.trim();

        if (source.toLowerCase() === destination.toLowerCase()) {
            showMessage("Source and destination must be different.", "danger");
            return;
        }

        const trainData = {
            trainNumber: document.getElementById("trainNumber").value.trim(),
            trainName: document.getElementById("trainName").value.trim(),
            trainType: document.getElementById("trainType").value,
            source: source,
            destination: destination,
            totalSeats: totalSeats,
            fare: fare,
            departureTime: document.getElementById("departureTime").value,
            arrivalTime: document.getElementById("arrivalTime").value
        };

        const saveButton = document.getElementById("saveButton");
        saveButton.disabled = true;
        saveButton.textContent = trainId ? "Updating..." : "Adding...";

        try {
            const url = trainId
                ? "/api/trains/" + encodeURIComponent(trainId)
                : "/api/trains";

            const response = await fetch(url, {
                method: trainId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(trainData)
            });

            const data = await readApiResponse(response);

            showMessage(data.message || "Train saved successfully.", "success");
            resetForm();
            await loadTrains();

        } catch (error) {
            console.error("Save train error:", error);
            showMessage(error.message || "Unable to save train.", "danger");

        } finally {
            saveButton.disabled = false;
            saveButton.innerHTML =
                document.getElementById("trainId").value
                    ? '<i class="bi bi-check-circle"></i> Update Train'
                    : '<i class="bi bi-plus-circle"></i> Add Train';
        }
    });
}

// EDIT TRAIN
function editTrain(train) {
    document.getElementById("trainId").value = train._id;
    document.getElementById("trainNumber").value = train.trainNumber || "";
    document.getElementById("trainName").value = train.trainName || "";
    document.getElementById("trainType").value = train.trainType || "";
    document.getElementById("totalSeats").value = train.totalSeats ?? "";
    document.getElementById("fare").value = train.fare ?? "";
    document.getElementById("source").value = train.source || "";
    document.getElementById("destination").value = train.destination || "";
    document.getElementById("departureTime").value = train.departureTime || "";
    document.getElementById("arrivalTime").value = train.arrivalTime || "";

    document.getElementById("formHeading").textContent = "Edit Train";
    document.getElementById("saveButton").innerHTML =
        '<i class="bi bi-check-circle"></i> Update Train';
    document.getElementById("cancelEditButton").hidden = false;

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// CANCEL EDIT
const cancelButton = document.getElementById("cancelEditButton");

if (cancelButton) {
    cancelButton.addEventListener("click", resetForm);
}

// RESET FORM
function resetForm() {
    trainForm.reset();
    document.getElementById("trainId").value = "";
    document.getElementById("formHeading").textContent = "Add New Train";
    document.getElementById("saveButton").innerHTML =
        '<i class="bi bi-plus-circle"></i> Add Train';
    document.getElementById("cancelEditButton").hidden = true;
}

// DELETE TRAIN
async function deleteTrain(id) {
    if (!confirm("Are you sure you want to delete this train?")) {
        return;
    }

    try {
        const response = await fetch(
            "/api/trains/" + encodeURIComponent(id),
            {
                method: "DELETE",
                headers: { "Accept": "application/json" }
            }
        );

        const data = await readApiResponse(response);

        showMessage(data.message || "Train deleted successfully.", "success");
        await loadTrains();

    } catch (error) {
        console.error("Delete train error:", error);
        showMessage(error.message || "Unable to delete train.", "danger");
    }
}
