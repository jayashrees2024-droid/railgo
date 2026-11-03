const userData =
    JSON.parse(localStorage.getItem("user"));


if (!userData) {

    window.location.href =
        "user-login.html";

}


document.getElementById("userName").innerText =
    userData.name;


document.getElementById("navUsername").innerText =
    userData.username;


// ======================================
// LOGOUT
// ======================================

function logout() {

    localStorage.removeItem("user");

    window.location.href =
        "user-login.html";
}


// ======================================
// LOAD TRAINS
// ======================================

async function loadTrains() {

    const content =
        document.getElementById("contentArea");

    content.innerHTML = `
        <div class="table-container">
            <h3 class="mb-3">Available Trains</h3>
            <p>Loading trains...</p>
        </div>
    `;


    try {

        const response =
            await fetch("/api/trains");

        const trains =
            await response.json();


        if (!trains || trains.length === 0) {

            content.innerHTML = `
                <div class="table-container">
                    <h3>Available Trains</h3>
                    <p class="text-muted">
                        No trains available.
                    </p>
                </div>
            `;

            return;
        }


        let rows = "";


        trains.forEach(function(train) {

            rows += `
                <tr>

                    <td>
                        ${train.trainNumber || train.number || "-"}
                    </td>

                    <td>
                        ${train.trainName || train.name || "-"}
                    </td>

                    <td>
                        ${train.source || train.from || "-"}
                    </td>

                    <td>
                        ${train.destination || train.to || "-"}
                    </td>

                </tr>
            `;

        });


        content.innerHTML = `

            <div class="table-container">

                <h3 class="mb-3">
                    Available Trains
                </h3>

                <div class="table-responsive">

                    <table class="table table-hover">

                        <thead class="table-primary">

                            <tr>

                                <th>
                                    Train Number
                                </th>

                                <th>
                                    Train Name
                                </th>

                                <th>
                                    Source
                                </th>

                                <th>
                                    Destination
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            ${rows}

                        </tbody>

                    </table>

                </div>

            </div>
        `;


    } catch (error) {

        content.innerHTML = `
            <div class="alert alert-danger">
                Unable to load trains.
            </div>
        `;

    }

}


// ======================================
// LOAD USER BOOKINGS
// ======================================

async function loadBookings() {

    const content =
        document.getElementById("contentArea");


    try {

        const response =
            await fetch(
                "/api/users/bookings/" +
                userData.username
            );


        const tickets =
            await response.json();


        if (!tickets || tickets.length === 0) {

            content.innerHTML = `
                <div class="table-container">

                    <h3>
                        My Tickets
                    </h3>

                    <p class="text-muted">
                        You have not booked any tickets yet.
                    </p>

                </div>
            `;

            return;
        }


        let rows = "";


        tickets.forEach(function(ticket) {

            rows += `
                <tr>

                    <td>
                        ${ticket.trainNumber}
                    </td>

                    <td>
                        ${ticket.trainName}
                    </td>

                    <td>
                        ${ticket.source}
                    </td>

                    <td>
                        ${ticket.destination}
                    </td>

                    <td>
                        ${ticket.journeyDate}
                    </td>

                    <td>
                        ${ticket.seats}
                    </td>

                    <td>
                        ₹${ticket.fare}
                    </td>

                </tr>
            `;

        });


        content.innerHTML = `

            <div class="table-container">

                <h3 class="mb-3">
                    My Tickets
                </h3>

                <div class="table-responsive">

                    <table class="table table-hover">

                        <thead class="table-dark">

                            <tr>

                                <th>
                                    Train No.
                                </th>

                                <th>
                                    Train
                                </th>

                                <th>
                                    From
                                </th>

                                <th>
                                    To
                                </th>

                                <th>
                                    Date
                                </th>

                                <th>
                                    Seats
                                </th>

                                <th>
                                    Fare
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            ${rows}

                        </tbody>

                    </table>

                </div>

            </div>
        `;


    } catch (error) {

        content.innerHTML = `
            <div class="alert alert-danger">
                Unable to load bookings.
            </div>
        `;

    }

}