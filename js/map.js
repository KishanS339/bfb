/* ============================================
   NagaraSeva — Leaflet Map Visualization
   ============================================ */

class MapVisualization {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.map = null;
    this.markers = [];
    this.wards = [];
    
    // Bengaluru Coordinates
    this.center = [12.9716, 77.5946];
    this.zoom = 12;
    
    // Custom Marker Icons
    this.icons = {
      'Road Damage': this.createIcon('🚧', '#D50000'),
      'Water Supply': this.createIcon('💧', '#00BCD4'),
      'Garbage': this.createIcon('🗑️', '#FF6F00'),
      'Street Light': this.createIcon('💡', '#FFB74D'),
      'Drainage': this.createIcon('🌊', '#303F9F'),
      'Tree Fall': this.createIcon('🌳', '#00C853'),
      'default': this.createIcon('📋', '#9E9E9E')
    };

    this.initMap();
  }

  createIcon(emoji, color) {
    return L.divIcon({
      className: 'custom-map-marker',
      html: `<div style="
        background: ${color};
        width: 32px; height: 32px;
        display: flex; align-items: center; justify-content: center;
        border-radius: 50%; border: 2px solid white;
        box-shadow: 0 4px 12px ${color}80;
        font-size: 16px;
      ">${emoji}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  }

  initMap() {
    // Initialize Leaflet
    this.map = L.map(this.containerId, {
      zoomControl: false // Custom position if needed
    }).setView(this.center, this.zoom);

    // Add Dark UI Tile Layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Fetch and load data
    this.loadData();
  }

  async loadData() {
    try {
      // Create some pseudo-wards for the sidebar based on generic Bengaluru areas
      this.wards = [
        { name: 'Koramangala', grievances: 0 },
        { name: 'Indiranagar', grievances: 0 },
        { name: 'Jayanagar', grievances: 0 },
        { name: 'Whitefield', grievances: 0 },
        { name: 'Malleshwaram', grievances: 0 },
        { name: 'HSR Layout', grievances: 0 }
      ];

      // Fetch real grievances from API
      // Since map page is public but needs token, we use API
      // Wait, is map page public? We just added auth check, so user is logged in.
      let response;
      try {
        // First try to get ALL grievances (if admin) or just fetch from public if we add a public route
        // For now, let's use the '/api/grievances' which might just return all for admins or filter for citizens.
        // Actually the backend allows fetching all grievances if authenticated (it returns based on filters).
        response = await fetch('http://localhost:5000/api/grievances', {
          headers: { 'Authorization': `Bearer ${NagaraSevaAPI.getToken()}` }
        });
      } catch (e) {
        console.error("API error", e);
      }

      const data = response && response.ok ? await response.json() : { grievances: [] };
      const grievances = data.grievances;
      
      this.renderMarkers(grievances);

      // Update ward stats based on fetched data
      grievances.forEach(g => {
        if (g.location && g.location.ward) {
          const w = this.wards.find(w => w.name === g.location.ward || w.name.includes(g.location.ward));
          if (w) w.grievances++;
        }
      });
      
      // Update sidebar DOM if it exists
      this.updateSidebar();

    } catch (error) {
      console.error('Error loading map data:', error);
    }
  }

  renderMarkers(grievances) {
    // Clear existing
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    // Helper to generate a random coordinate near Bengaluru center
    // Only used if the grievance doesn't have real coordinates saved
    const getRandomCoord = () => {
      const lat = this.center[0] + (Math.random() - 0.5) * 0.15;
      const lng = this.center[1] + (Math.random() - 0.5) * 0.15;
      return [lat, lng];
    };

    grievances.forEach(g => {
      // Use existing coordinates, or generate random ones near BLR for demo
      const latlng = (g.location && g.location.coordinates && g.location.coordinates.lat) 
        ? [g.location.coordinates.lat, g.location.coordinates.lng] 
        : getRandomCoord();

      const icon = this.icons[g.category] || this.icons['default'];
      
      const marker = L.marker(latlng, { icon }).addTo(this.map);
      
      // Custom popup styling
      const popupContent = `
        <div style="font-family: var(--font-family); color: #333; min-width: 200px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${g.title}</div>
          <div style="font-size: 12px; color: #666; margin-bottom: 8px;">${g.grievanceId} • ${g.category}</div>
          <div style="display:inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; 
               background: ${g.status === 'Resolved' ? '#e8f5e9' : '#fff3e0'};
               color: ${g.status === 'Resolved' ? '#2e7d32' : '#f57c00'};">
            ${g.status}
          </div>
          <div style="margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px;">
            <a href="grievance-detail.html?id=${g.grievanceId}" style="color: #00BCD4; text-decoration: none; font-size: 12px; font-weight: 500;">View Details →</a>
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      this.markers.push(marker);
    });
  }

  updateSidebar() {
    const wardList = document.getElementById('ward-list');
    if (wardList && this.wards.length > 0) {
      wardList.innerHTML = '';
      const sorted = [...this.wards].sort((a, b) => b.grievances - a.grievances);
      sorted.slice(0, 8).forEach(ward => {
        const item = document.createElement('div');
        item.className = 'ward-item';
        item.innerHTML = `<span>${ward.name}</span><span class="ward-count">${ward.grievances}</span>`;
        wardList.appendChild(item);
      });
    }
  }
}
