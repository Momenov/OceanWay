/*****************************************
         * 1. MAP INITIALIZATION WITH LEAFLET
         *****************************************/
        // Create the map centered at some default location (e.g., 0,0)
        const map = L.map('map').setView([0, 0], 2);

        // Add a basic tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(map);

        // Create a marker to represent the submarine's position
        // We'll move it dynamically as we get new data
        const submarineMarker = L.marker([0, 0]).addTo(map);
        submarineMarker.bindPopup("Submarine 001");

        /*****************************************
         * 2. CHART INITIALIZATION WITH CHART.JS
         *****************************************/
        const ctx = document.getElementById('telemetry-chart').getContext('2d');
        const telemetryChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],  // We'll dynamically add time points
                datasets: [
                    {
                        label: 'Battery (%)',
                        data: [],
                        borderColor: 'teal',
                        backgroundColor: 'rgba(0,128,128,0.1)',
                        fill: true
                    },
                    {
                        label: 'Speed (m/s)',
                        data: [],
                        borderColor: '#ff6600',
                        backgroundColor: 'rgba(255, 102, 0, 0.1)',
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                animation: {
                    duration: 500
                },
                scales: {
                    x: {
                        ticks: { color: '#333' }
                    },
                    y: {
                        suggestedMin: 0,
                        suggestedMax: 100,
                        ticks: { color: '#333' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#333' } }
                }
            }
        });

        /*****************************************
        * 3. DATA SIMULATION OR API CALLS
        *****************************************/

        // Define bounding boxes for major gyres (approx. lat/lon ranges)
        const gyres = [
            // North Pacific Gyre (near Great Pacific Garbage Patch)
            {
                name: "North Pacific Gyre",
                latMin: 30, latMax: 45,
                lngMin: -170, lngMax: -140
            },
            // South Pacific Gyre
            {
                name: "South Pacific Gyre",
                latMin: -40, latMax: -15,
                lngMin: -130, lngMax: -80
            },
            // North Atlantic Gyre
            {
                name: "North Atlantic Gyre",
                latMin: 15, latMax: 35,
                lngMin: -70, lngMax: -30
            },
            // South Atlantic Gyre
            {
                name: "South Atlantic Gyre",
                latMin: -40, latMax: -15,
                lngMin: -55, lngMax: 0
            },
            // Indian Ocean Gyre
            {
                name: "Indian Ocean Gyre",
                latMin: -30, latMax: -10,
                lngMin: 40, lngMax: 100
            }
        ];

        function getSubmarineDataMock() {
            // 1. Pick a random gyre
            const randomIndex = Math.floor(Math.random() * gyres.length);
            const g = gyres[randomIndex];

            // 2. Generate random lat/lng within that bounding box
            const lat = (Math.random() * (g.latMax - g.latMin) + g.latMin).toFixed(3);
            const lng = (Math.random() * (g.lngMax - g.lngMin) + g.lngMin).toFixed(3);

            // 3. Random battery, plastic, speed
            const battery = Math.floor(Math.random() * 100);
            const plasticCollected = Math.floor(Math.random() * 50);
            const speed = (Math.random() * 10).toFixed(2);

            return {
                lat,
                lng,
                battery,
                plasticCollected,
                speed,
                gyreName: g.name 
            };
        }



        // Function to update the UI with fresh data
        function updateDashboard(data) {
            const { lat, lng, battery, plasticCollected, speed } = data;

            // 1. Move the marker
            submarineMarker.setLatLng([lat, lng]);
            map.setView([lat, lng], 3);
            // 2. Update text fields
            document.getElementById('sub-lat').textContent = lat;
            document.getElementById('sub-lng').textContent = lng;
            document.getElementById('sub-battery').textContent = battery;
            document.getElementById('sub-plastic').textContent = plasticCollected;
            document.getElementById('sub-speed').textContent = speed;

            // 3. Update chart
            const currentTime = new Date().toLocaleTimeString();
            telemetryChart.data.labels.push(currentTime);
            // Battery data
            telemetryChart.data.datasets[0].data.push(battery);
            // Speed data
            telemetryChart.data.datasets[1].data.push(speed);

            // Keep only the last 10 data points
            if (telemetryChart.data.labels.length > 10) {
                telemetryChart.data.labels.shift();
                telemetryChart.data.datasets[0].data.shift();
                telemetryChart.data.datasets[1].data.shift();
            }
            telemetryChart.update();
        }

        // Periodic data fetch/simulation
        let autoUpdateInterval = setInterval(() => {
            const data = getSubmarineDataMock();
            updateDashboard(data);
        }, 3000); // every 5 seconds

        /*****************************************
         * 4. BUTTON HANDLERS
         *****************************************/
        // Center the map on the submarine
        document.getElementById('btn-center').addEventListener('click', () => {
            const latText = document.getElementById('sub-lat').textContent;
            const lngText = document.getElementById('sub-lng').textContent;

            if (latText !== 'N/A' && lngText !== 'N/A') {
                const lat = parseFloat(latText);
                const lng = parseFloat(lngText);
                map.setView([lat, lng], 4); // Zoom level 4 for a closer view
            }
        });

        // Manually refresh data
        document.getElementById('btn-refresh').addEventListener('click', () => {
            const data = getSubmarineDataMock();
            updateDashboard(data);
        });