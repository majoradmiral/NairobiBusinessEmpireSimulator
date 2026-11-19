import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import type { District } from '../sim/types';

function colorFor(district: District): string {
  if (district.vitality < 0.45) return '#d9485f';
  if (district.vitality < 0.62) return '#e8a33d';
  return '#3ddc97';
}

export function MapView({ districts, selectedId }: { districts: District[]; selectedId?: string }) {
  return (
    <MapContainer
      center={[-1.283, 36.84] as [number, number]}
      zoom={11}
      scrollWheelZoom
      className="map"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {districts.map((district) => (
        <CircleMarker
          key={district.id}
          center={[district.center.lat, district.center.lng] as [number, number]}
          radius={8 + district.footTraffic * 12}
          pathOptions={{
            color: selectedId === district.id ? '#ffffff' : colorFor(district),
            weight: selectedId === district.id ? 3 : 1,
            fillColor: colorFor(district),
            fillOpacity: 0.5,
          }}
        >
          <Popup>
            <strong>{district.name}</strong>
            <br />
            Vitality {Math.round(district.vitality * 100)}% · Traffic{' '}
            {Math.round(district.footTraffic * 100)}%
            <br />
            Sentiment {Math.round(district.sentiment * 100)}% · Enforcement{' '}
            {Math.round(district.enforcement * 100)}%
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
