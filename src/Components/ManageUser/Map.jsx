import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Static Data ---
// This array replaces the 'users' prop that was passed into the component.
const staticUsers = [
  {
    _id: "user1",
    latitude: 10.5276, // Thrissur
    longitude: 76.2144,
    userName: "thrissur_admin",
    companyName: "Ebhoom Solutions",
    modelName: "Hydro-Analyzer Pro",
    adminType: "Admin",
    analyzerHealth: "Good",
  },
  {
    _id: "user2",
    latitude: 9.9312, // Kochi
    longitude: 76.2673,
    userName: "kochi_site_1",
    companyName: "Port Logistics",
    modelName: "Enviro-Monitor 5",
    adminType: "User",
    analyzerHealth: "Needs Attention",
  },
  {
    _id: "user3",
    latitude: 8.5241, // Thiruvananthapuram
    longitude: 76.9366,
    userName: "tvm_research",
    companyName: "Capital Tech Park",
    modelName: "Hydro-Analyzer Pro",
    adminType: "Admin",
    analyzerHealth: "Good",
  },
  {
    _id: "user4",
    latitude: 11.2588, // Kozhikode
    longitude: 75.7804,
    userName: "calicut_branch",
    companyName: "Malabar Industries",
    modelName: "Enviro-Monitor 3",
    adminType: "User",
    analyzerHealth: "Good",
  },
];


const KeralaMap = () => {
  // Center of Kerala
  const defaultPosition = [10.5, 76.5]; 

  // --- Marker Icons ---
  const greenIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    shadowSize: [41, 41],
  });

  const redIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    shadowSize: [41, 41],
  });

  return (
    <MapContainer center={defaultPosition} zoom={8} style={{ height: "600px", width: "100%", borderRadius: "10px" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.ebhoom.com/">Ebhoom Solutions</a> contributors'
      />

      {/* Mapping over the staticUsers array to display markers */}
      {staticUsers.map((user) => {
        // Logic to determine marker color based on static data
        const isHealthy = user.analyzerHealth === "Good";

        return (
          <Marker
            key={user._id}
            position={[user.latitude, user.longitude]}
            icon={isHealthy ? greenIcon : redIcon}
          >
            <Popup>
              <div>
                <h5>User ID: {user.userName}</h5>
                <p>Company Name: <strong>{user.companyName}</strong></p>
                <p>Model Name: <strong>{user.modelName}</strong></p>
                <p>Admin Type: <strong>{user.adminType}</strong></p>
                <p>Status: <strong style={{ color: isHealthy ? 'green' : 'red' }}>{user.analyzerHealth}</strong></p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default KeralaMap;