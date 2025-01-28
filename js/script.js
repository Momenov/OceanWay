// JavaScript for dynamic content and interactivity

        // Example data to simulate real-time updates
        const mockData = {
            plasticCollected: 1234, // in kg
            submarinesActive: 5
        };

        // Function to update the dashboard stats
        function updateDashboard() {
            const plasticCollectedElem = document.getElementById("plastic-collected");
            const submarinesActiveElem = document.getElementById("submarines-active");

            plasticCollectedElem.textContent = `${mockData.plasticCollected} kg`;
            submarinesActiveElem.textContent = `${mockData.submarinesActive}`;
        }

        // Initialize Chart.js for analytics section
        function renderAnalyticsChart() {
            const ctx = document.getElementById("chart").getContext("2d");
            new Chart(ctx, {
                type: "bar",
                data: {
                    labels: ["Jan", "Feb", "Mar", "Apr", "May"], // Example months
                    datasets: [
                        {
                            label: "Plastic Collected (kg)",
                            data: [500, 700, 1200, 1500, 2000],
                            backgroundColor: "#007BFF",
                            borderColor: "#0056b3",
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: "top"
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Simulate real-time updates (for example, every 5 seconds)
        setInterval(() => {
            mockData.plasticCollected += Math.floor(Math.random() * 50); // Simulate new plastic collected
            updateDashboard();
        }, 5000);

        // Initialize everything when the page loads
        document.addEventListener("DOMContentLoaded", () => {
            updateDashboard();
            renderAnalyticsChart();
        });