import { useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

const defaultCenter = [12.9716, 77.5946];
const containerStyle = {
  width: '100%',
  height: '420px',
  borderRadius: '12px'
};

function pointToLatLng(point) {
  const lng = point?.coordinates?.[0];
  const lat = point?.coordinates?.[1];
  if (lng == null || lat == null) return null;
  return [Number(lat), Number(lng)];
}

function createMarkerIcon(color) {
  return L.divIcon({
    className: '',
    html: `
      <span style="
        display:block;
        width:18px;
        height:18px;
        border-radius:999px;
        background:${color};
        border:3px solid rgba(255,255,255,0.96);
        box-shadow:0 10px 24px rgba(15,23,42,0.28);
      "></span>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
}

const reportIcon = createMarkerIcon('#dc2626');
const requestIcon = createMarkerIcon('#2563eb');

export default function AdminMonitoringMap({ reports = [], requests = [] }) {
  const center = useMemo(() => {
    const first = reports[0] || requests[0];
    const point = first?.location ? pointToLatLng(first.location) : null;
    return point || defaultCenter;
  }, [reports, requests]);

  const reportMarkers = useMemo(
    () =>
      reports
        .map((report) => ({
          id: report._id,
          position: pointToLatLng(report.location),
          title: report.disasterType,
          subtitle: report.location?.address || null
        }))
        .filter((marker) => marker.position),
    [reports]
  );

  const requestMarkers = useMemo(
    () =>
      requests
        .map((request) => ({
          id: request._id,
          position: pointToLatLng(request.location),
          title: `${request.type} x${request.quantity}`,
          subtitle: request.location?.address || null
        }))
        .filter((marker) => marker.position),
    [requests]
  );

  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-500 dark:text-slate-400">
        Red markers: disaster reports • Blue markers: resource requests
      </div>

      <div className="overflow-hidden rounded-xl border border-[rgb(var(--line))]">
        <MapContainer center={center} zoom={11} scrollWheelZoom style={containerStyle}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {reportMarkers.map((marker) => (
            <Marker key={`report_${marker.id}`} position={marker.position} icon={reportIcon}>
              <Popup>
                <div className="text-sm font-semibold">{marker.title}</div>
                {marker.subtitle && <div className="mt-1 text-xs text-slate-600">{marker.subtitle}</div>}
              </Popup>
            </Marker>
          ))}

          {requestMarkers.map((marker) => (
            <Marker key={`request_${marker.id}`} position={marker.position} icon={requestIcon}>
              <Popup>
                <div className="text-sm font-semibold">{marker.title}</div>
                {marker.subtitle && <div className="mt-1 text-xs text-slate-600">{marker.subtitle}</div>}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
