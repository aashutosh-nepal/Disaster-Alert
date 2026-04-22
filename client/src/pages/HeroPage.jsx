import { createElement, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip } from 'react-leaflet';
import heroIllustration from '../assets/hero.png';
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowRight,
  FiBell,
  FiBox,
  FiCheckCircle,
  FiDatabase,
  FiGitBranch,
  FiMap,
  FiRadio,
  FiShield,
  FiTarget,
  FiUploadCloud,
  FiUsers,
  FiZap,
} from 'react-icons/fi';

const problemPoints = [
  'Communication is slow and unorganized',
  'Emergency reporting is inefficient',
  'Resource requests are not properly tracked',
  'Volunteers lack visibility of urgent needs',
  'Authorities cannot effectively prioritize cases',
];

const roleCards = [
  {
    title: 'Citizen dashboard',
    label: 'report + request',
    icon: FiAlertTriangle,
    copy: 'Citizens report disasters, request food, water, shelter, or medical assistance, and track request status.',
  },
  {
    title: 'Volunteer dashboard',
    label: 'respond + update',
    icon: FiActivity,
    copy: 'Volunteers view nearby requests, accept assignments, respond to incidents, and update progress in real time.',
  },
  {
    title: 'Admin dashboard',
    label: 'monitor + control',
    icon: FiShield,
    copy: 'Admins monitor reports, prioritize urgent cases, manage users, and coordinate resources from one command view.',
  },
];

const architecture = [
  ['React UI', 'Role dashboards for citizens, volunteers, and admins.'],
  ['API Gateway', 'Validation, authentication checks, routing, and request filtering.'],
  ['Express Server', 'REST APIs, business logic, RBAC, and Socket.io event handling.'],
  ['MongoDB', 'Persistent storage for users, disaster reports, resource requests, and response tasks.'],
  ['Real-time Layer', 'Instant updates for alerts, status changes, assignments, and notifications.'],
];

const modules = [
  ['Authentication & access control', 'JWT login, secure roles, and protected routes.'],
  ['Alert & reporting service', 'Collects incident data and broadcasts disaster alerts.'],
  ['Resource coordination service', 'Tracks relief requests, priority, allocation, and completion.'],
  ['Live disaster map', 'Shows real-time disaster and resource locations on Leaflet with live updates.'],
  ['Volunteer response history', 'Records accepted requests and progress updates.'],
  ['Platform settings', 'Admin-oriented controls for users, roles, status, and content.'],
];

const collections = [
  ['Users', 'name, email, password, role'],
  ['DisasterReports', 'userId, location, disasterType, description, status, createdAt'],
  ['ResourceRequests', 'type, quantity, location, status, assignedVolunteer'],
  ['Tasks/Responses', 'requestId, volunteerId, status, updatedAt'],
];

const keyFeatures = [
  ['Authentication', FiShield],
  ['Role-based access', FiUsers],
  ['Disaster reporting', FiAlertTriangle],
  ['Resource requests', FiBox],
  ['Real-time updates', FiRadio],
  ['Status tracking', FiCheckCircle],
];

const advancedFeatures = [
  ['Leaflet live map', FiMap],
  ['Geo-location based alerts', FiBell],
  ['Image upload for reports', FiUploadCloud],
  ['Offline support (PWA)', FiActivity],
];

const flowSteps = [
  'User registers or logs in',
  'Citizen reports disaster or requests help',
  'Data is stored in MongoDB',
  'System notifies volunteers in real time',
  'Volunteer accepts the request',
  'Volunteer updates progress',
  'Admin monitors all activities',
  'Status updates are sent to users',
  'Request is marked completed',
];

const heroPillars = [
  ['Citizens', 'Report incidents with map location and evidence.'],
  ['Volunteers', 'See nearby alerts, accept work, and update field status.'],
  ['Admins', 'Monitor requests, manage users, and prioritize response.'],
];

const heroMetrics = [
  ['Response mode', 'Realtime socket updates'],
  ['Roles', 'Citizen, volunteer, admin'],
  ['Coverage', 'Location-aware operations'],
];

function SectionIntro({ eyebrow, title, copy }) {
  return (
    <div className="max-w-3xl">
      <p className="ops-mono text-xs font-bold uppercase text-[rgb(var(--signal))]">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black leading-tight md:text-5xl">{title}</h2>
      {copy && <p className="mt-4 text-base leading-7 text-[rgb(var(--muted))]">{copy}</p>}
    </div>
  );
}

const districtFeed = [
  {
    id: 'flood-east-ward',
    type: 'Flood',
    place: 'East ward',
    status: 'food + rescue requested',
    severity: 'critical',
    eta: '06 min',
    coords: [12.991, 77.647],
    color: '#ef5b47',
    fill: '#ff7b63',
  },
  {
    id: 'medical-sector-12',
    type: 'Medical',
    place: 'Sector 12',
    status: 'volunteer assigned',
    severity: 'response',
    eta: '12 min',
    coords: [12.964, 77.612],
    color: '#22c55e',
    fill: '#8af1af',
  },
  {
    id: 'shelter-north-school',
    type: 'Shelter',
    place: 'North school',
    status: 'capacity verified',
    severity: 'support',
    eta: '18 min',
    coords: [13.018, 77.583],
    color: '#f5c451',
    fill: '#ffe08a',
  },
  {
    id: 'fire-river-belt',
    type: 'Fire',
    place: 'River belt',
    status: 'hotspot isolated',
    severity: 'critical',
    eta: '04 min',
    coords: [12.947, 77.684],
    color: '#ff7849',
    fill: '#ffb089',
  },
  {
    id: 'water-jayanagar',
    type: 'Water',
    place: 'Jayanagar',
    status: 'tankers rerouted',
    severity: 'support',
    eta: '22 min',
    coords: [12.926, 77.592],
    color: '#2cb7d8',
    fill: '#85e8ff',
  },
];

const severityTone = {
  critical: 'bg-[#ef5b47]/18 text-[#ff9a89] border-[#ef5b47]/35',
  response: 'bg-[#22c55e]/18 text-[#96f1b0] border-[#22c55e]/35',
  support: 'bg-[#2cb7d8]/18 text-[#8cecff] border-[#2cb7d8]/35',
};

const responseHubs = [
  { id: 'hub-central', label: 'Central Command', coords: [12.9716, 77.5946], color: '#f5c451' },
  { id: 'hub-east', label: 'East Relief Hub', coords: [12.983, 77.638], color: '#2cb7d8' },
  { id: 'hub-south', label: 'South Medical Base', coords: [12.935, 77.603], color: '#22c55e' },
];

const zoneLabels = [
  { label: 'North sector', classes: 'left-[10%] top-[24%]' },
  { label: 'River belt', classes: 'right-[10%] top-[36%]' },
  { label: 'Central grid', classes: 'left-[36%] top-[52%]' },
  { label: 'South access', classes: 'left-[18%] bottom-[18%]' },
];

function incidentHub(item) {
  if (item.severity === 'critical') return responseHubs[0];
  if (item.type === 'Water') return responseHubs[1];
  return responseHubs[2];
}

function LiveDistrictBoard() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTick((value) => value + 1);
    }, 2200);

    return () => window.clearInterval(timer);
  }, []);

  const visibleFeed = useMemo(() => {
    const rotated = districtFeed.map((item, index) => ({
      ...item,
      pulse: (tick + index) % 4 === 0,
      intensity: ((tick + index) % 3) + 1,
    }));

    return rotated.slice().sort((a, b) => Number(b.pulse) - Number(a.pulse));
  }, [tick]);

  const boardFeed = useMemo(() => {
    const start = tick % districtFeed.length;
    return Array.from({ length: 4 }, (_, index) => districtFeed[(start + index) % districtFeed.length]);
  }, [tick]);

  const activeIncident = boardFeed[0];
  const routeLines = useMemo(
    () =>
      visibleFeed.map((item) => {
        const hub = incidentHub(item);
        return {
          id: item.id,
          positions: [hub.coords, item.coords],
          color: item.color,
          active: item.id === activeIncident.id,
        };
      }),
    [activeIncident.id, visibleFeed]
  );

  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-[1.5rem] border border-[#d4dbd3] bg-[#eef3ee] text-[#0d1513] shadow-[0_32px_110px_rgba(17,24,23,0.16)]">
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_16%_14%,rgba(239,91,71,0.10),transparent_14rem),radial-gradient(circle_at_82%_24%,rgba(245,196,81,0.10),transparent_12rem),radial-gradient(circle_at_52%_86%,rgba(44,183,216,0.10),transparent_16rem)] pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.32))] pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-[linear-gradient(rgba(17,24,23,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,23,0.045)_1px,transparent_1px)] bg-[length:38px_38px] pointer-events-none" />
      <div className="hero-radar-sweep pointer-events-none absolute left-1/2 top-1/2 z-10 h-[31rem] w-[31rem] -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <div className="hero-scanlines pointer-events-none absolute inset-0 z-10" />
      <div className="pointer-events-none absolute inset-3 z-10 rounded-[1.2rem] border border-[#ffffff]/55" />
      <div className="pointer-events-none absolute left-4 top-4 z-10 h-8 w-8 border-l border-t border-[#f5c451]/42" />
      <div className="pointer-events-none absolute right-4 top-4 z-10 h-8 w-8 border-r border-t border-[#f5c451]/42" />
      <div className="pointer-events-none absolute bottom-4 left-4 z-10 h-8 w-8 border-b border-l border-[#f5c451]/42" />
      <div className="pointer-events-none absolute bottom-4 right-4 z-10 h-8 w-8 border-b border-r border-[#f5c451]/42" />

      <div className="absolute inset-0">
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={11}
          zoomControl={false}
          attributionControl={false}
          dragging={false}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          touchZoom={false}
          boxZoom={false}
          keyboard={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {routeLines.map((route) => (
            <Polyline
              key={route.id}
              positions={route.positions}
              pathOptions={{
                color: route.color,
                weight: route.active ? 3 : 2,
                opacity: route.active ? 0.74 : 0.34,
                dashArray: route.active ? '10 8' : '6 10',
              }}
            />
          ))}

          {responseHubs.map((hub) => (
            <CircleMarker
              key={hub.id}
              center={hub.coords}
              radius={7}
              pathOptions={{
                color: '#f8fafc',
                fillColor: hub.color,
                fillOpacity: 0.96,
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="rounded-md border border-white/12 bg-[#091412]/94 px-2 py-1.5 shadow-lg backdrop-blur">
                  <div className="ops-mono text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: hub.color }}>
                    Response hub
                  </div>
                  <div className="mt-0.5 text-[11px] font-semibold text-white">{hub.label}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}

          {visibleFeed.map((item) => (
            <CircleMarker
              key={item.id}
              center={item.coords}
              radius={item.pulse ? 13 + item.intensity * 2 : 9 + item.intensity}
              pathOptions={{
                color: item.color,
                fillColor: item.fill,
                fillOpacity: item.pulse ? 0.86 : 0.68,
                weight: item.pulse ? 4 : 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -12]} opacity={1} permanent={item.pulse}>
                <div className="rounded-md border border-white/12 bg-[#091412]/92 px-2 py-1.5 shadow-lg backdrop-blur">
                  <div className="ops-mono text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: item.fill }}>
                    {item.type}
                  </div>
                  <div className="mt-0.5 text-[11px] font-semibold text-white">{item.place}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_42%,rgba(17,24,23,0.10)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-10 hidden md:block">
        {zoneLabels.map((zone) => (
          <div
            key={zone.label}
            className={`absolute rounded-full border border-[#cfd7cf] bg-white/72 px-3 py-1.5 ops-mono text-[10px] uppercase tracking-[0.18em] text-[#607068] backdrop-blur ${zone.classes}`}
          >
            {zone.label}
          </div>
        ))}
      </div>

      <div className="absolute left-4 right-4 top-4 z-20 rounded-xl border border-[#d4dbd3] bg-white/84 px-4 py-4 shadow-[0_14px_40px_rgba(17,24,23,0.12)] backdrop-blur-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <p className="ops-mono text-[11px] font-bold uppercase tracking-[0.24em] text-[#63716b]">Operations map</p>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#ef5b47]/30 bg-[#ef5b47]/14 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#ff9a89]">
                <span className="h-2 w-2 rounded-full bg-[#ef5b47]" />
                Active
              </span>
            </div>
            <p className="mt-2 text-xl font-black md:text-2xl text-[#0d1513]">District response board</p>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[#5a6963]">
              Clear incident markers, severity levels, and dispatch routes across the district.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 lg:min-w-[280px]">
            <div className="rounded-lg border border-[#d4dbd3] bg-[#f7faf7]/88 px-3 py-2">
              <div className="ops-mono text-[10px] uppercase tracking-[0.18em] text-[#6a7772]">Incidents</div>
              <div className="mt-1 text-2xl font-black text-[#0d1513]">{districtFeed.length}</div>
            </div>
            <div className="rounded-lg border border-[#d4dbd3] bg-[#f7faf7]/88 px-3 py-2">
              <div className="ops-mono text-[10px] uppercase tracking-[0.18em] text-[#6a7772]">Critical</div>
              <div className="mt-1 text-2xl font-black text-[#0d1513]">{districtFeed.filter((item) => item.severity === 'critical').length}</div>
            </div>
            <div className="rounded-lg border border-[#d4dbd3] bg-[#f7faf7]/88 px-3 py-2">
              <div className="ops-mono text-[10px] uppercase tracking-[0.18em] text-[#6a7772]">Avg dispatch</div>
              <div className="mt-1 text-2xl font-black text-[#0d1513]">11m</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-20 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-[#d4dbd3] bg-white/84 p-4 shadow-[0_14px_40px_rgba(17,24,23,0.12)] backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="ops-mono text-[11px] uppercase tracking-[0.22em] text-[#63716b]">Priority queue</div>
              <div className="mt-1 text-sm font-bold text-[#26312d]">Incidents sorted by urgency</div>
            </div>
            <div className="hidden items-center gap-3 text-[11px] text-[#6a7772] sm:flex">
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#ef5b47]" />Critical</span>
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />Response</span>
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2cb7d8]" />Support</span>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {boardFeed.map(({ id, type, place, status, color, severity, eta }) => (
              <div
                key={id}
                className="grid gap-3 rounded-lg border border-[#d9e0d9] bg-[#f7faf7]/92 px-3 py-3 md:grid-cols-[96px_1fr_auto]"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="ops-mono text-xs font-bold uppercase tracking-[0.16em]" style={{ color }}>
                    {type}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0d1513]">{place}</div>
                  <div className="mt-1 text-xs text-[#5f6d68]">{status}</div>
                </div>
                <div className="flex items-center justify-between gap-3 md:block">
                  <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${severityTone[severity]}`}>
                    {severity}
                  </span>
                  <div className="mt-0 text-right ops-mono text-[10px] uppercase tracking-[0.16em] text-[#70807a] md:mt-2">
                    eta {eta}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#d4dbd3] bg-white/84 p-4 shadow-[0_14px_40px_rgba(17,24,23,0.12)] backdrop-blur-md">
          <div className="ops-mono text-[11px] uppercase tracking-[0.22em] text-[#63716b]">Current focus</div>
          <div className="mt-3 rounded-xl border border-[#d9e0d9] bg-[#f7faf7]/92 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-black text-[#0d1513]">{activeIncident.place}</div>
                <div className="mt-1 text-sm text-[#5f6d68]">{activeIncident.type} incident</div>
              </div>
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${severityTone[activeIncident.severity]}`}>
                {activeIncident.severity}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg border border-[#d9e0d9] bg-white p-3">
                <div className="ops-mono text-[10px] uppercase tracking-[0.18em] text-[#6d7a75]">Status</div>
                <div className="mt-1 font-bold text-[#0d1513]">{activeIncident.status}</div>
              </div>
              <div className="rounded-lg border border-[#d9e0d9] bg-white p-3">
                <div className="ops-mono text-[10px] uppercase tracking-[0.18em] text-[#6d7a75]">Dispatch ETA</div>
                <div className="mt-1 font-bold text-[#0d1513]">{activeIncident.eta}</div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-[#23b8d8]/18 bg-[#23b8d8]/8 px-3 py-3 text-xs leading-6 text-[#b4f4ff]">
              Built for fast visibility across incidents, dispatch, and response status.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f7f1] text-[#111817]">
      <section className="relative min-h-screen px-4 py-5 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(17,24,23,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,23,0.05)_1px,transparent_1px)] bg-[length:44px_44px]" />
          <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_18%_16%,rgba(239,63,53,0.16),transparent_18rem),radial-gradient(circle_at_78%_10%,rgba(35,184,216,0.12),transparent_20rem),linear-gradient(180deg,rgba(255,255,255,0.48),transparent)]" />
          <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#ef3f35]/8 blur-3xl" />
          <div className="absolute right-0 top-28 h-80 w-80 rounded-full bg-[#23b8d8]/10 blur-3xl" />
        </div>

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between rounded-xl border border-[#d7ddd6] bg-white/84 px-4 py-3 shadow-[0_10px_40px_rgba(17,24,23,0.08)] backdrop-blur">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#ef3f35] text-white">
              <FiAlertTriangle />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-black uppercase">Local Disaster Alert</span>
              <span className="ops-mono block text-[11px] text-[#5e6965]">Resource Coordination Platform</span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <Link to="/login" className="btn-ghost">
              Operator login
            </Link>
            <Link to="/register" className="btn-primary">
              Open app
              <FiArrowRight />
            </Link>
          </div>

          <Link to="/login" className="btn-primary md:hidden">
            Open app
          </Link>
        </nav>

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-7rem)] max-w-7xl items-center gap-12 py-10 lg:grid-cols-[0.96fr_1.04fr]">
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d7ddd6] bg-white/86 px-3 py-2 shadow-sm backdrop-blur">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#111817] text-white">
                <FiRadio className="text-xs" />
              </span>
              <span className="ops-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#4f5d58]">
                Local response network
              </span>
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[0.9] sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
              A command center for
              <span className="block text-[#ef3f35]">local disaster response.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#53615c]">
              Coordinate incidents, resources, volunteers, and control-room decisions in one clear operational system.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary px-6">
                Launch platform
                <FiArrowRight />
              </Link>
              <Link to="/login" className="btn-ghost px-5">
                Operator login
                <FiShield />
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {heroMetrics.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-[#d7ddd6] bg-white/72 p-4 shadow-sm backdrop-blur">
                  <div className="ops-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#61716b]">{label}</div>
                  <div className="mt-2 text-sm font-black text-[#111817]">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-3">
              {heroPillars.map(([title, copy], index) => (
                <div
                  key={title}
                  className="grid gap-3 rounded-xl border border-[#d7ddd6] bg-white/70 p-4 shadow-sm backdrop-blur sm:grid-cols-[56px_1fr]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#111817] text-white">
                    {index === 0 ? <FiAlertTriangle /> : index === 1 ? <FiZap /> : <FiTarget />}
                  </div>
                  <div>
                    <div className="text-sm font-black uppercase tracking-[0.06em] text-[#111817]">{title}</div>
                    <div className="mt-1 text-sm leading-6 text-[#53615c]">{copy}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 hidden max-w-xl items-end gap-4 rounded-2xl border border-[#d7ddd6] bg-[#111817] p-4 text-white shadow-[0_18px_45px_rgba(17,24,23,0.18)] lg:flex">
              <img
                src={heroIllustration}
                alt="Operations dashboard preview"
                className="h-28 w-36 rounded-xl border border-white/10 object-cover"
              />
              <div>
                <div className="ops-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#f9c44a]">System preview</div>
                <div className="mt-2 text-lg font-black">Role-based dashboards with live operations tracking.</div>
                <div className="mt-2 text-sm leading-6 text-white/64">
                  Reports, requests, dispatch, and oversight stay connected in one interface.
                </div>
              </div>
            </div>
          </div>

          <LiveDistrictBoard />
        </div>
      </section>

      <section id="problem" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionIntro
            eyebrow="Problem statement"
            title="Disasters fail people when communication becomes fragmented."
            copy="Emergency response slows down when reporting, dispatch, and visibility are spread across disconnected channels."
          />
          <div className="grid gap-3">
            {problemPoints.map((item, index) => (
              <div key={item} className="grid grid-cols-[56px_1fr] items-center rounded-lg border border-[#cfd8d1] bg-white p-4 shadow-sm">
                <span className="ops-mono text-xl font-black text-[#ef3f35]">0{index + 1}</span>
                <span className="font-bold">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#111817] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Flood scenario"
            title="From report to completion, every handoff is visible."
            copy="A citizen reports an emergency, nearby volunteers see the request, one volunteer accepts and responds, the administrator prioritizes urgent cases, and status updates are shared in real time."
          />
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {flowSteps.map((step, index) => (
              <div key={step} className="rounded-lg border border-white/12 bg-white/8 p-4">
                <div className="ops-mono text-xs font-bold text-[#f9c44a]">STEP {String(index + 1).padStart(2, '0')}</div>
                <p className="mt-3 font-bold leading-6">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="User interface"
            title="Three role-specific dashboards, one shared emergency workflow."
            copy="Citizens, volunteers, and administrators operate through focused dashboards connected by live updates."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {roleCards.map(({ title, label, icon, copy }) => (
              <div key={title} className="rounded-lg border border-[#cfd8d1] bg-white p-5 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#ef3f35] text-white">
                  {createElement(icon)}
                </div>
                <p className="ops-mono mt-5 text-xs font-bold uppercase text-[#23b8d8]">{label}</p>
                <h3 className="mt-2 text-2xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#53615c]">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="architecture" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.86fr_1.14fr]">
          <SectionIntro
            eyebrow="Architecture"
            title="MERN architecture with Socket.io real-time coordination."
            copy="Dashboards connect through APIs, live events, and data services designed for fast coordination."
          />
          <div className="rounded-lg border border-[#111817] bg-[#111817] p-4 text-white shadow-2xl">
            <div className="grid gap-3">
              {architecture.map(([title, copy], index) => (
                <div key={title} className="grid gap-4 rounded-md border border-white/12 bg-white/8 p-4 md:grid-cols-[120px_1fr]">
                  <span className="ops-mono text-[#f9c44a]">LAYER {index + 1}</span>
                  <div>
                    <h3 className="font-black">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-white/64">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Core modules"
            title="Core services for fast coordination."
            copy="Authentication, reporting, coordination, maps, response history, and platform controls work together in one workflow."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map(([title, copy]) => (
              <div key={title} className="rounded-lg border border-[#cfd8d1] bg-white p-5 shadow-sm">
                <FiGitBranch className="text-2xl text-[#ef3f35]" />
                <h3 className="mt-4 text-xl font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#53615c]">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div>
            <SectionIntro
              eyebrow="Key features"
              title="The required feature set is visible at a glance."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {keyFeatures.map(([title, icon]) => (
                <div key={title} className="flex items-center gap-3 rounded-lg border border-[#cfd8d1] bg-[#f6f7f1] p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#111817] text-white">
                    {createElement(icon)}
                  </span>
                  <span className="font-black">{title}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionIntro
              eyebrow="Advanced features"
              title="Optional features are implemented as app capabilities."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {advancedFeatures.map(([title, icon]) => (
                <div key={title} className="flex items-center gap-3 rounded-lg border border-[#cfd8d1] bg-[#f6f7f1] p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#23b8d8] text-[#111817]">
                    {createElement(icon)}
                  </span>
                  <span className="font-black">{title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="database" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionIntro
            eyebrow="Database collections"
            title="MongoDB collections mirror suggested schema."
            copy="Users, reports, requests, and response tasks support authentication, coordination, and status tracking."
          />
          <div className="grid gap-3">
            {collections.map(([title, fields]) => (
              <div key={title} className="rounded-lg border border-[#cfd8d1] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <FiDatabase className="text-xl text-[#ef3f35]" />
                  <h3 className="text-xl font-black">{title}</h3>
                </div>
                <p className="ops-mono mt-3 text-xs leading-6 text-[#53615c]">{fields}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 rounded-lg bg-[#ef3f35] p-6 text-white shadow-2xl md:grid-cols-[1fr_auto] md:items-center lg:p-8">
          <div>
            <p className="ops-mono text-xs font-bold uppercase text-white/70">Learning outcomes</p>
            <h2 className="mt-2 text-3xl font-black md:text-5xl">A real-world emergency workflows.</h2>
            <p className="mt-4 max-w-3xl leading-7 text-white/76">
              Built for fast reporting, clear dispatch, and better visibility during high-pressure response scenarios.
            </p>
          </div>
          <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3 font-black text-[#111817]">
            Launch platform
            <FiArrowRight />
          </Link>
        </div>
      </section>
    </main>
  );
}
