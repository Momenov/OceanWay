/*****************************************
 * 1. Map Initialization with Leaflet
 *****************************************/
const map = L.map("map").setView([20, 0], 2); // Centered on a generic location

// Add a base tile layer (OpenStreetMap)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 20,
    attribution: '&copy; <a href="#">OceanWay</a> contributors',
}).addTo(map);


function avoidOverlappingPaths(submarine, allSubmarines) {
    allSubmarines.forEach((otherSubmarine) => {
        if (submarine.id !== otherSubmarine.id) {
            const distance = Math.sqrt(
                Math.pow(submarine.lat - otherSubmarine.lat, 2) +
                Math.pow(submarine.lng - otherSubmarine.lng, 2)
            );

            if (distance < 2) {
                // Adjust direction to avoid collision
                submarine.direction += 30; // Change direction by 30 degrees
            }
        }
    });
}


/*****************************************
 * 2. Ocean Regions
 *****************************************/
// Define bounding boxes for major oceans
const oceans = [
    { name: "Pacific Ocean", latMin: -50, latMax: 50, lngMin: -180, lngMax: -100 },
    { name: "Atlantic Ocean", latMin: -40, latMax: 40, lngMin: -70, lngMax: -20 },
    { name: "Indian Ocean", latMin: -40, latMax: 10, lngMin: 20, lngMax: 100 },
    { name: "Southern Ocean", latMin: -60, latMax: -50, lngMin: -180, lngMax: 180 },
];


/*****************************************
 * 3. Submarine Data and Markers
 *****************************************/
// Define data for multiple submarines
const submarines = [
    { id: "Submarine 001", lat: 34.05, lng: -118.25, direction: 90, speed: 99, battery: 100, iconUrl: "../resources/3190967.png", marker: null }, // Los Angeles
    { id: "Submarine 002", lat: 19.43, lng: -99.13, direction: 180, speed: 70, battery: 100, iconUrl: "../resources/3190967.png", marker: null }, // Mexico City
    { id: "Submarine 003", lat: 37.77, lng: -122.42, direction: 270, speed: 84, battery: 100, iconUrl: "../resources/3190967.png", marker: null }, // San Francisco
    { id: "Submarine 004", lat: -33.92, lng: 18.42, direction: 360, speed: 123, battery: 10, iconUrl: "../resources/3190967.png", marker: null }, // Cape Town
  ];
  

let selectedSubmarine = null; // Initially, no submarine is selected


// Assign initial random positions within ocean regions
submarines.forEach((submarine) => {
    const ocean = oceans[Math.floor(Math.random() * oceans.length)]; // Pick a random ocean
    submarine.lat = (Math.random() * (ocean.latMax - ocean.latMin) + ocean.latMin).toFixed(3);
    submarine.lng = (Math.random() * (ocean.lngMax - ocean.lngMin) + ocean.lngMin).toFixed(3);

    const submarineIcon = L.icon({
        iconUrl: submarine.iconUrl, // Unique icon for each submarine
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
    });

    // Add a marker for the submarine
    const marker = L.marker([submarine.lat, submarine.lng], { icon: submarineIcon })
        .addTo(map)
        .bindPopup(`
      <div>
        <strong>${submarine.id}</strong><br>
        Location: (${submarine.lat}, ${submarine.lng})
      </div>
    `);

    submarine.marker = marker; // Store the marker in the submarine object

    submarine.trail = L.polyline([], { color: "red", weight: 2 }).addTo(map);

    // Add click event to update the dashboard and chart
    marker.on("click", () => {
        selectedSubmarine = submarine; // Set the clicked submarine as selected
        updateDashboard(selectedSubmarine); // Update the dashboard immediately on click
    });
});


/*****************************************
 * 4. Simulate Submarine Movement
 *****************************************/
function simulateSubmarineMovement(submarine) {
    const earthRadius = 6371; // Radius of Earth in km
  
    // Convert speed from km/s to degrees
    const speedInDegrees = (submarine.speed / earthRadius) * (180 / Math.PI);
  
    // Calculate new position based on direction
    const deltaLat = speedInDegrees * Math.cos((submarine.direction * Math.PI) / 180);
    const deltaLng = speedInDegrees * Math.sin((submarine.direction * Math.PI) / 180);
  
    submarine.lat = parseFloat(submarine.lat) + deltaLat;
    submarine.lng = parseFloat(submarine.lng) + deltaLng;
  
    // Check if the submarine has reached the target hotspot
    if (submarine.targetHotspot) {
      const distanceToHotspot = Math.sqrt(
        Math.pow(submarine.lat - submarine.targetHotspot.lat, 2) +
        Math.pow(submarine.lng - submarine.targetHotspot.lng, 2)
      );
  
      if (distanceToHotspot < 0.5) { // Within 0.5 degrees (close enough)
        // Mark the hotspot as collected
        submarine.targetHotspot.collected = true;
        submarine.plasticCollected = (submarine.plasticCollected || 0) + Math.floor(Math.random() * 100);
  
        // Update hotspot marker
        submarine.targetHotspot.marker.setStyle({ color: "green", fillColor: "green" });
        submarine.targetHotspot.marker.bindPopup(`
          <strong>${submarine.targetHotspot.id}</strong><br>
          Location: (${submarine.targetHotspot.lat}, ${submarine.targetHotspot.lng})<br>
          Status: Collected<br>
          Plastic Collected: ${Math.floor(Math.random() * 100)} kg
        `);
  
        submarine.targetHotspot.marker.openPopup(); // Show popup
  
        // Clear the target to allow reassignment
        submarine.targetHotspot = null;
      }
    }
  
    // Smoothly animate the marker's position
    submarine.marker.setLatLng([submarine.lat, submarine.lng]);

  
    // Update popup content dynamically
    submarine.marker.setPopupContent(`
      <div>
        <strong>${submarine.id}</strong><br>
        Location: (${submarine.lat.toFixed(3)}, ${submarine.lng.toFixed(3)})<br>
        Speed: ${(submarine.speed * 1000).toFixed(2)} m/s<br>
        Battery: ${submarine.battery.toFixed(1)}%<br>
        Plastic Collected: ${submarine.plasticCollected || 0} kg
      </div>
    `);
  
    // Add position to trail
    submarine.trail.addLatLng([submarine.lat, submarine.lng]);
  
    // Simulate slower battery drain
    submarine.battery = Math.max(0, submarine.battery - Math.random() * 0.1); // Reduce battery by 0-0.1% per update
  }
  



/*****************************************
 *  Real-Time Submarine Movement
 *****************************************/
function updateRealTimeMovement() {
    submarines.forEach((submarine) => {
        simulateSubmarineMovement(submarine); // Simulate movement for each submarine
    });

    // Update the status panel and chart for the selected submarine
    if (selectedSubmarine) {
        updateDashboard(selectedSubmarine);
    }
}


/*****************************************
 *  Real-Time Status Updates
 *****************************************/
function updateRealTimeStatus() {
    if (selectedSubmarine) {
        updateDashboard(selectedSubmarine); // Update the dashboard for the selected submarine
    }
}


/*****************************************
 * 5. Chart.js Initialization
 *****************************************/
const ctx = document.getElementById("telemetry-chart").getContext("2d");
const gradientBattery = ctx.createLinearGradient(0, 0, 0, 400);
gradientBattery.addColorStop(0, "rgba(0, 255, 0, 0.6)"); // Green
gradientBattery.addColorStop(1, "rgba(255, 0, 0, 0.6)"); // Red

const gradientSpeed = ctx.createLinearGradient(0, 0, 0, 400);
gradientSpeed.addColorStop(0, "rgba(0, 128, 255, 0.6)"); // Blue
gradientSpeed.addColorStop(1, "rgba(255, 165, 0, 0.6)"); // Orange

const telemetryChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [], // Dynamic timestamps
        datasets: [
            {
                label: "Battery (%)",
                data: [],
                borderColor: "teal",
                backgroundColor: gradientBattery,
                fill: true,
            },
            {
                label: "Speed (m/s)",
                data: [],
                borderColor: "#ff6600",
                backgroundColor: gradientSpeed,
                fill: true,
            },
            {
                label: "Plastic Collected (kg)",
                data: [],
                borderColor: "purple",
                backgroundColor: "rgba(128,0,128,0.1)",
                fill: true,
            },
        ],
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: "#333",
                },
            },
            tooltip: {
                mode: "index",
                intersect: false,
            },
        },
        interaction: {
            mode: "index",
            intersect: false,
        },
        scales: {
            x: {
                ticks: {
                    color: "#333",
                },
            },
            y: {
                ticks: {
                    color: "#333",
                },
                suggestedMin: 0,
                suggestedMax: 100,
            },
        },
    },
});

document.querySelectorAll(".chart-toggle").forEach((button) => {
    button.addEventListener("click", (e) => {
        const datasetIndex = e.target.dataset.dataset;
        const dataset = telemetryChart.data.datasets[datasetIndex];
        dataset.hidden = !dataset.hidden; // Toggle visibility
        telemetryChart.update(); // Update the chart
    });
});


function updateTelemetry(submarine) {
    const currentTime = new Date().toLocaleTimeString();

    // Add data to the chart
    telemetryChart.data.labels.push(currentTime);
    telemetryChart.data.datasets[0].data.push(submarine.battery); // Battery
    telemetryChart.data.datasets[1].data.push(submarine.speed * 1000); // Speed
    telemetryChart.data.datasets[2].data.push(submarine.plasticCollected || 0); // Plastic Collected

    // Keep only the last 10 data points
    if (telemetryChart.data.labels.length > 10) {
        telemetryChart.data.labels.shift();
        telemetryChart.data.datasets[0].data.shift();
        telemetryChart.data.datasets[1].data.shift();
        telemetryChart.data.datasets[2].data.shift();
    }

    telemetryChart.update();
}


/*****************************************
 * 6. Update Dashboard and Chart
 *****************************************/
function updateDashboard(submarine) {
    // Update the status panel
    document.getElementById("sub-id").textContent = submarine.id;
    document.getElementById("sub-lat").textContent = submarine.lat.toFixed(3);
    document.getElementById("sub-lng").textContent = submarine.lng.toFixed(3);
    document.getElementById("sub-battery").textContent = submarine.battery.toFixed(1);
    document.getElementById("sub-speed").textContent = (submarine.speed * 1000).toFixed(2);

    // Update ocean name
    const ocean = oceans.find(
        (ocean) =>
            submarine.lat >= ocean.latMin &&
            submarine.lat <= ocean.latMax &&
            submarine.lng >= ocean.lngMin &&
            submarine.lng <= ocean.lngMax
    );
    document.getElementById("sub-ocean").textContent = ocean ? ocean.name : "Unknown";

    // Update battery progress bar
    const batteryProgress = document.getElementById("battery-progress");
    batteryProgress.style.width = `${submarine.battery}%`;

    // Change progress bar color based on battery level
    batteryProgress.className = "progress"; // Reset class
    if (submarine.battery <= 20) {
        batteryProgress.classList.add("low");
    } else if (submarine.battery <= 50) {
        batteryProgress.classList.add("medium");
    } else {
        batteryProgress.classList.add("high");
    }

    // Update the chart
    const currentTime = new Date().toLocaleTimeString();
    telemetryChart.data.labels.push(currentTime);
    telemetryChart.data.datasets[0].data.push(submarine.battery);
    telemetryChart.data.datasets[1].data.push(submarine.speed * 1000);

    // Keep only the last 10 data points
    if (telemetryChart.data.labels.length > 15) {
        telemetryChart.data.labels.shift();
        telemetryChart.data.datasets[0].data.shift();
        telemetryChart.data.datasets[1].data.shift();
    }
    telemetryChart.update();
}

/*****************************************
 * 7. Periodic Updates
 *****************************************/
setInterval(() => {
    submarines.forEach((submarine) => {
      if (!submarine.targetHotspot) {
        assignSubmarineToHotspot(submarine); // Assign the closest hotspot
      }
      simulateSubmarineMovement(submarine); // Move the submarine
    });
  
    if (selectedSubmarine) {
      updateDashboard(selectedSubmarine); // Update the dashboard for the selected submarine
    }
  }, 1000); // Update every second
  



/*****************************************
 * 8. Real-Time Notifications
 *****************************************/
function checkForCriticalEvents(submarine) {
    const notificationsElement = document.getElementById("notifications");

    // Clear notifications if too many
    if (notificationsElement.children.length > 10) {
        notificationsElement.innerHTML = "";
    }

    // Low battery alert
    if (submarine.battery < 20) {
        const lowBatteryNotification = document.createElement("div");
        lowBatteryNotification.className = "notification";
        lowBatteryNotification.textContent = `${submarine.id} has low battery (${submarine.battery.toFixed(1)}%)!`;
        notificationsElement.appendChild(lowBatteryNotification);
    }

    // Out-of-bounds alert
    const ocean = oceans.find(
        (ocean) =>
            submarine.lat >= ocean.latMin &&
            submarine.lat <= ocean.latMax &&
            submarine.lng >= ocean.lngMin &&
            submarine.lng <= ocean.lngMax
    );
    if (!ocean) {
        const outOfBoundsNotification = document.createElement("div");
        outOfBoundsNotification.className = "notification";
        outOfBoundsNotification.textContent = `${submarine.id} is out of bounds!`;
        notificationsElement.appendChild(outOfBoundsNotification);
    }


}

