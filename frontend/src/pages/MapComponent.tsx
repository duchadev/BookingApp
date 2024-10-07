import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import React, { useEffect, useRef } from "react";

interface MapComponentProps {
  placeName: string;
  city: string;
  country: string;
  mapPosition: [number, number] | null; // Accept the position as a prop
}

const MapComponent: React.FC<MapComponentProps> = ({
  placeName,
  city,
  country,
  mapPosition,
}) => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && mapPosition) {
      const map = mapRef.current;
      map.setView(mapPosition, 13);

      L.marker(mapPosition)
        .addTo(map)
        .bindPopup(
          `<b>${placeName}, ${city}, ${country}</b><br>
          <a href="https://www.google.com/maps/search/?api=1&query=${mapPosition[0]},${mapPosition[1]}" target="_blank">Xem trên Google Maps</a>`
        )
        .openPopup();
    }
  }, [mapPosition]);

  return (
    <MapContainer
      // center={[0, 0]} // Initial position on the map
      zoom={1} // Initial zoom level
      style={{ height: "46vh", width: "100%" }}
      ref={(ref) => (mapRef.current = ref)}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
    </MapContainer>
  );
};

export default MapComponent;
