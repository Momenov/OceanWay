 hotspots = [
    { id: "North Pacific Gyre", lat: 30, lng: -150, collected: false }, // North Pacific Gyre
    { id: "South Pacific Gyre", lat: -30, lng: -130, collected: false }, // South Pacific Gyre
    { id: "North Atlantic Gyre", lat: 30, lng: -50, collected: false }, // North Atlantic Gyre
    { id: "South Atlantic Gyre", lat: -30, lng: -10, collected: false }, // South Atlantic Gyre
    { id: "Indian Ocean Gyre", lat: -20, lng: 80, collected: false }, // Indian Ocean Gyre
  ];
  
  // Add hotspots to the map
  hotspots.forEach((hotspot) => {
    hotspot.marker = L.circleMarker([hotspot.lat, hotspot.lng], {
      radius: 8,
      color: "red",
      fillColor: "red",
      fillOpacity: 0.7,
    })
      .addTo(map)
      .bindPopup(`<strong>${hotspot.id}</strong><br>Location: (${hotspot.lat}, ${hotspot.lng})<br>Status: Uncollected`);
  });
  

function generateOceanHotspots(numHotspots) {
    const generatedHotspots = [];
    for (let i = 0; i < numHotspots; i++) {
      const ocean = oceans[Math.floor(Math.random() * oceans.length)]; // Pick a random ocean
      const lat = (Math.random() * (ocean.latMax - ocean.latMin) + ocean.latMin).toFixed(3);
      const lng = (Math.random() * (ocean.lngMax - ocean.lngMin) + ocean.lngMin).toFixed(3);
  
      generatedHotspots.push({ id: `Hotspot ${i + 1}`, lat: lat, lng: lng});
    }
    return generatedHotspots;
  }
  

  function assignSubmarineToHotspot(submarine) {
    let closestHotspot = null;
    let minDistance = Infinity;
  
    hotspots.forEach((hotspot) => {
      if (!hotspot.collected) { // Only consider uncollected hotspots
        const distance = Math.sqrt(
          Math.pow(submarine.lat - hotspot.lat, 2) +
          Math.pow(submarine.lng - hotspot.lng, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestHotspot = hotspot;
        }
      }
    });
  
    if (closestHotspot) {
      submarine.targetHotspot = closestHotspot;
  
      // Calculate the direction (angle) toward the assigned hotspot
      const dx = closestHotspot.lng - submarine.lng;
      const dy = closestHotspot.lat - submarine.lat;
      submarine.direction = Math.atan2(dy, dx) * (180 / Math.PI); // Convert radians to degrees
    }
  }
  
  


  function checkProximityToHotspot(submarine) {
    hotspots.forEach((hotspot) => {
      if (!hotspot.collected) {
        const distance = Math.sqrt(
          Math.pow(submarine.lat - hotspot.lat, 2) +
          Math.pow(submarine.lng - hotspot.lng, 2)
        );
  
        if (distance < 0.5) { // If submarine is within 0.5 degrees
          hotspot.collected = true; // Mark as collected
          submarine.plasticCollected = (submarine.plasticCollected || 0) + Math.floor(Math.random() * 100);
  
          // Update hotspot marker
          hotspot.marker.setStyle({ color: "green", fillColor: "green" });
          hotspot.marker.bindPopup(`
            <strong>${hotspot.id}</strong><br>
            Location: (${hotspot.lat}, ${hotspot.lng})<br>
            Status: Collected<br>
            Plastic Collected: ${Math.floor(Math.random() * 100)} kg
          `);
  
          hotspot.marker.openPopup(); // Show popup
        }
      }
    });
  }
  
  