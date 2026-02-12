"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon issues in Next.js/Webpack
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Trento city center coordinates
const TRENTO_COORDS: [number, number] = [46.0697, 11.1211];

interface MapProps {
  center?: [number, number]; 
  zoom?: number;
}

export default function Map({ center = TRENTO_COORDS, zoom = 13 }: MapProps) {
  return (
    <MapContainer 
      center={TRENTO_COORDS} // Force center to Trento
      zoom={zoom} 
      
      // --- Disable all interactions for static view ---
      dragging={false}          // Disable panning
      touchZoom={false}         // Disable touch zoom
      doubleClickZoom={false}   // Disable double click zoom
      scrollWheelZoom={false}   // Disable scroll wheel zoom
      boxZoom={false}           // Disable box zoom
      keyboard={false}          // Disable keyboard navigation
      zoomControl={false}       // Hide zoom controls
      
      className="w-full h-full rounded-[32px] z-0" 
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      
      <Marker position={TRENTO_COORDS} icon={icon}>
        <Popup className="font-sans text-sm">
          👋 I'm in Trento!
        </Popup>
      </Marker>
    </MapContainer>
  );
}