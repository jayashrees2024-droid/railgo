async function loadDashboard() {

    try {

        const trainResponse = await fetch("/api/trains");
        const trains = await trainResponse.json();

        const stationResponse = await fetch("/api/stations");
        const stations = await stationResponse.json();

        const scheduleResponse = await fetch("/api/schedules");
        const schedules = await scheduleResponse.json();

        const passengerResponse = await fetch("/api/passengers");
        const passengers = await passengerResponse.json();

        const ticketResponse = await fetch("/api/tickets");
        const tickets = await ticketResponse.json();


        document.getElementById("trainCount").textContent =
            trains.length;

        document.getElementById("stationCount").textContent =
            stations.length;

        document.getElementById("scheduleCount").textContent =
            schedules.length;

        document.getElementById("passengerCount").textContent =
            passengers.length;

        document.getElementById("ticketCount").textContent =
            tickets.length;


    } catch (error) {

        console.log("Dashboard error:", error);

    }

}


loadDashboard();