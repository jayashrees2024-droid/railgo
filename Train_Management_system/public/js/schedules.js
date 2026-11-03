const API_URL = "/api/schedules";
const TRAIN_API_URL = "/api/trains";

const scheduleForm = document.getElementById("scheduleForm");
const scheduleTable = document.getElementById("scheduleTable");
const scheduleSearch = document.getElementById("scheduleSearch");

let allSchedules = [];
let editingScheduleId = null;

document.addEventListener("DOMContentLoaded", async function () {
    await loadTrains();
    await loadSchedules();

    if (scheduleSearch) {
        scheduleSearch.addEventListener("input", filterSchedules);
    }
});

// LOAD TRAINS
async function loadTrains() {
    try {
        const response = await fetch(TRAIN_API_URL);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load trains.");
        }

        // Support both array and { trains: [...] } responses
        const trains = Array.isArray(data)
            ? data
            : (Array.isArray(data.trains) ? data.trains : []);

        const dropdown = document.getElementById("trainSelect");

        if (!dropdown) return;

        dropdown.innerHTML = '<option value="">Select Train</option>';

        trains.forEach(function (train) {
            const option = document.createElement("option");

            option.value = train._id;
            option.textContent =
                train.trainNumber + " - " + train.trainName;

            option.dataset.trainNumber = train.trainNumber || "";
            option.dataset.trainName = train.trainName || "";
            option.dataset.source = train.source || "";
            option.dataset.destination = train.destination || "";
            option.dataset.departureTime = train.departureTime || "";
            option.dataset.arrivalTime = train.arrivalTime || "";

            dropdown.appendChild(option);
        });

    } catch (error) {
        console.error("Load trains error:", error);
        showMessage("Unable to load trains. Check the server.");
    }
}

// AUTO-FILL TRAIN DETAILS
const trainSelect = document.getElementById("trainSelect");

if (trainSelect) {
    trainSelect.addEventListener("change", function () {
        const selected = trainSelect.options[trainSelect.selectedIndex];

        if (!selected || !selected.value) {
            setValue("trainNumber", "");
            setValue("trainName", "");
            setValue("source", "");
            setValue("destination", "");
            setValue("departureTime", "");
            setValue("arrivalTime", "");
            return;
        }

        setValue("trainNumber", selected.dataset.trainNumber);
        setValue("trainName", selected.dataset.trainName);
        setValue("source", selected.dataset.source);
        setValue("destination", selected.dataset.destination);
        setValue("departureTime", selected.dataset.departureTime);
        setValue("arrivalTime", selected.dataset.arrivalTime);
    });
}

// HELPER: SET INPUT VALUE
function setValue(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.value = value || "";
    }
}

// HELPER: GET INPUT VALUE
function getValue(id) {
    const element = document.getElementById(id);

    return element ? element.value.trim() : "";
}

// ADD OR UPDATE SCHEDULE
if (scheduleForm) {
    scheduleForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const schedule = {
            trainNumber: getValue("trainNumber"),
            trainName: getValue("trainName"),
            source: getValue("source"),
            destination: getValue("destination"),
            departureTime: getValue("departureTime"),
            arrivalTime: getValue("arrivalTime"),
            journeyDate: getValue("journeyDate"),
            scheduleStatus: getValue("scheduleStatus")
        };

        if (
            !schedule.trainNumber ||
            !schedule.trainName ||
            !schedule.source ||
            !schedule.destination ||
            !schedule.departureTime ||
            !schedule.arrivalTime ||
            !schedule.journeyDate ||
            !schedule.scheduleStatus
        ) {
            alert("Please fill all required schedule details.");
            return;
        }

        try {
            const url = editingScheduleId
                ? API_URL + "/" + encodeURIComponent(editingScheduleId)
                : API_URL;

            const response = await fetch(url, {
                method: editingScheduleId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(schedule)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to save schedule."
                );
            }

            alert(data.message || "Schedule saved successfully.");

            scheduleForm.reset();
            editingScheduleId = null;
            updateSubmitButton();

            await loadSchedules();

        } catch (error) {
            console.error("Save schedule error:", error);
            alert(error.message || "Unable to save schedule.");
        }
    });
}

// LOAD SAVED SCHEDULES
async function loadSchedules() {
    if (!scheduleTable) {
        console.error("Schedule table was not found.");
        return;
    }

    scheduleTable.innerHTML = `
        <tr>
            <td colspan="9" class="text-center">
                Loading schedules...
            </td>
        </tr>
    `;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load schedules.");
        }

        // IMPORTANT FIX:
        // API returns { success: true, schedules: [...] }
        allSchedules = Array.isArray(data)
            ? data
            : (Array.isArray(data.schedules) ? data.schedules : []);

        displaySchedules(allSchedules);

    } catch (error) {
        console.error("Load schedules error:", error);

        scheduleTable.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-danger">
                    Unable to load schedules. Check the server.
                </td>
            </tr>
        `;
    }
}

// DISPLAY SCHEDULES IN TABLE
function displaySchedules(schedules) {
    if (!scheduleTable) return;

    scheduleTable.innerHTML = "";

    if (!schedules || schedules.length === 0) {
        scheduleTable.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">
                    No schedules found.
                </td>
            </tr>
        `;
        return;
    }

    schedules.forEach(function (schedule) {
        const row = document.createElement("tr");

        addCell(row, schedule.trainNumber);
        addCell(row, schedule.trainName);
        addCell(row, schedule.source);
        addCell(row, schedule.destination);
        addCell(row, schedule.departureTime);
        addCell(row, schedule.arrivalTime);
        addCell(row, formatDate(schedule.journeyDate));
        addCell(row, schedule.scheduleStatus || schedule.status);

        const actions = document.createElement("td");

        // EDIT BUTTON
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "btn btn-warning btn-sm me-1 mb-1";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function () {
            editSchedule(schedule);
        });

        // DELETE BUTTON
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-danger btn-sm mb-1";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            deleteSchedule(schedule._id);
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);
        row.appendChild(actions);

        scheduleTable.appendChild(row);
    });
}

// ADD TABLE CELL
function addCell(row, value) {
    const cell = document.createElement("td");

    cell.textContent =
        value === undefined || value === null || value === ""
            ? "-"
            : value;

    row.appendChild(cell);
}

// FORMAT DATE
function formatDate(date) {
    if (!date) return "";

    const dateText = String(date);

    return dateText.includes("T")
        ? dateText.split("T")[0]
        : dateText;
}

// SEARCH SCHEDULES
function filterSchedules() {
    if (!scheduleSearch) return;

    const searchText = scheduleSearch.value.toLowerCase().trim();

    const filteredSchedules = allSchedules.filter(function (schedule) {
        return [
            schedule.trainNumber,
            schedule.trainName,
            schedule.source,
            schedule.destination,
            schedule.departureTime,
            schedule.arrivalTime,
            formatDate(schedule.journeyDate),
            schedule.scheduleStatus,
            schedule.status
        ].some(function (value) {
            return String(value || "")
                .toLowerCase()
                .includes(searchText);
        });
    });

    displaySchedules(filteredSchedules);
}

// EDIT SCHEDULE
function editSchedule(schedule) {
    editingScheduleId = schedule._id;

    const dropdown = document.getElementById("trainSelect");

    if (dropdown) {
        const matchingOption = Array.from(dropdown.options).find(
            function (option) {
                return option.dataset.trainNumber ===
                    String(schedule.trainNumber);
            }
        );

        dropdown.value = matchingOption ? matchingOption.value : "";
    }

    setValue("trainNumber", schedule.trainNumber);
    setValue("trainName", schedule.trainName);
    setValue("source", schedule.source);
    setValue("destination", schedule.destination);
    setValue("departureTime", schedule.departureTime);
    setValue("arrivalTime", schedule.arrivalTime);
    setValue("journeyDate", formatDate(schedule.journeyDate));
    setValue(
        "scheduleStatus",
        schedule.scheduleStatus || schedule.status
    );

    updateSubmitButton();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// DELETE SCHEDULE
async function deleteSchedule(id) {
    if (!id) {
        alert("Schedule ID is missing.");
        return;
    }

    if (!confirm("Are you sure you want to delete this schedule?")) {
        return;
    }

    try {
        const response = await fetch(
            API_URL + "/" + encodeURIComponent(id),
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to delete schedule."
            );
        }

        alert(data.message || "Schedule deleted successfully.");

        await loadSchedules();

    } catch (error) {
        console.error("Delete schedule error:", error);
        alert(error.message || "Unable to delete schedule.");
    }
}

// UPDATE FORM BUTTON
function updateSubmitButton() {
    if (!scheduleForm) return;

    const button = scheduleForm.querySelector(
        'button[type="submit"]'
    );

    if (button) {
        button.innerHTML = editingScheduleId
            ? "Update Schedule"
            : "Add Schedule";
    }
}

// SIMPLE MESSAGE
function showMessage(message) {
    console.warn(message);
}
