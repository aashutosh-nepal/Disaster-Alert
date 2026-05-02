import { createElement, useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
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

const heroMapCenter = [12.9716, 77.5946];

function SectionIntro({ eyebrow, title, copy }) {
  return (
    <div className="max-w-3xl">
      <p className="ops-mono text-xs font-bold uppercase text-[rgb(var(--signal))]">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black leading-tight md:text-5xl">{title}</h2>
      {copy && <p className="mt-4 text-base leading-7 text-[rgb(var(--muted))]">{copy}</p>}
    </div>
  );
}

function RefreshHeroMapLayout() {
  const map = useMap();

  useEffect(() => {
    const refresh = () => map.invalidateSize();
    refresh();

    const timer = window.setTimeout(refresh, 180);
    window.addEventListener('resize', refresh);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', refresh);
    };
  }, [map]);

  return null;
}

function SyncHeroMapViewport({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      map.setView(heroMapCenter, 11);
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 12);
      return;
    }

    map.fitBounds(L.latLngBounds(points), { padding: [36, 36] });
  }, [map, points]);

  return null;
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

const responseHubs = [
  { id: 'hub-central', label: 'Central Command', coords: [12.9716, 77.5946], color: '#f5c451' },
  { id: 'hub-east', label: 'East Relief Hub', coords: [12.983, 77.638], color: '#2cb7d8' },
  { id: 'hub-south', label: 'South Medical Base', coords: [12.935, 77.603], color: '#22c55e' },
];

const replayEvents = [
  {
    id: 'report-opened',
    time: '07:12',
    title: 'Flood report opened',
    actor: 'Citizen desk',
    status: 'Awaiting verification',
    eta: '17 min',
    note: 'Resident uploads location-tagged photos from East ward after stormwater starts entering ground-floor homes.',
    detail: 'Intake console validates coordinates, tags the ward, and opens a high-priority flood case.',
    tone: 'critical',
    accent: '#ef5b47',
    metrics: [
      ['Water level', '0.7m rising'],
      ['Reports linked', '03 homes'],
      ['Queue status', 'Priority 01'],
    ],
  },
  {
    id: 'evidence-verified',
    time: '07:15',
    title: 'Evidence verified',
    actor: 'Control room',
    status: 'Verified and broadcast',
    eta: '14 min',
    note: 'Admin confirms duplicate citizen reports, cross-checks rainfall feed, and marks the alert as verified.',
    detail: 'The system pushes a verified flood alert to nearby volunteers and flags shelter operators in the north corridor.',
    tone: 'response',
    accent: '#22c55e',
    metrics: [
      ['Source confidence', '92%'],
      ['Alerts sent', '18 volunteers'],
      ['Shelters notified', '02 sites'],
    ],
  },
  {
    id: 'volunteer-assigned',
    time: '07:19',
    title: 'Volunteer assigned',
    actor: 'Field network',
    status: 'Rescue team en route',
    eta: '09 min',
    note: 'Nearest flood-trained volunteer accepts the task with boat support and shares a live movement status.',
    detail: 'Assignment is locked to one responder, while backup volunteers stay on standby for supply routing.',
    tone: 'support',
    accent: '#2cb7d8',
    metrics: [
      ['Responder', 'Unit V-12'],
      ['Travel mode', 'Boat + van'],
      ['Backup ready', '04 volunteers'],
    ],
  },
  {
    id: 'route-adjusted',
    time: '07:24',
    title: 'Route adjusted',
    actor: 'Dispatch board',
    status: 'Access route rerouted',
    eta: '06 min',
    note: 'Blocked underpass forces a reroute through Central grid while tanker support is redirected from East Relief Hub.',
    detail: 'Command view updates the ETA, highlights the safer corridor, and shares the change with all active responders.',
    tone: 'critical',
    accent: '#f5c451',
    metrics: [
      ['Primary road', 'Closed'],
      ['Updated ETA', '06 min'],
      ['Supply shift', '2 tankers'],
    ],
  },
  {
    id: 'shelter-stabilized',
    time: '07:31',
    title: 'Shelter capacity secured',
    actor: 'Relief base',
    status: 'Families moved to shelter',
    eta: '03 min',
    note: 'North school shelter confirms intake capacity, dry kits, and medical triage support before evacuees arrive.',
    detail: 'Admin dashboard links shelter capacity to the incident so citizens and volunteers see the same destination.',
    tone: 'response',
    accent: '#22c55e',
    metrics: [
      ['Beds ready', '26'],
      ['Dry kits', '41 packed'],
      ['Medics on site', '02'],
    ],
  },
  {
    id: 'incident-closed',
    time: '07:38',
    title: 'Case closed with follow-up',
    actor: 'Operations lead',
    status: 'Rescue completed',
    eta: 'Resolved',
    note: 'All tagged households are checked, response logs are closed, and a follow-up water supply request is scheduled.',
    detail: 'The incident timeline becomes a full audit trail for response review, volunteer reporting, and post-event support.',
    tone: 'support',
    accent: '#2cb7d8',
    metrics: [
      ['People assisted', '14'],
      ['Closure time', '26 min'],
      ['Follow-up', 'Water delivery'],
    ],
  },
];

function incidentHub(item) {
  if (item.severity === 'critical') return responseHubs[0];
  if (item.type === 'Water') return responseHubs[1];
  return responseHubs[2];
}

function IncidentReplay() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [replayCycle, setReplayCycle] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((value) => (value + 1) % replayEvents.length);
      setReplayCycle((value) => value + 1);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  const activeEvent = replayEvents[activeIndex];

  return (
    <div className="mt-8 grid gap-5 xl:grid-cols-[0.86fr_1.14fr]">
      <div className="rounded-[1.5rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-white/10 bg-[#0d1513] px-4 py-4">
          <div>
            <div className="ops-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#f5c451]">Incident replay</div>
            <div className="mt-2 text-xl font-black text-white md:text-2xl">East ward flood corridor</div>
            <div className="mt-2 max-w-xl text-sm leading-6 text-white/64">
              One verified flood incident moving from first report to evacuation closure in a single operational timeline.
            </div>
          </div>
          <div className="grid min-w-[220px] grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl border border-[#ef5b47]/20 bg-[#ef5b47]/10 px-3 py-3">
              <div className="ops-mono text-[10px] uppercase tracking-[0.18em] text-[#ff9a89]">Severity</div>
              <div className="mt-1 font-black text-white">Critical flood</div>
            </div>
            <div className="rounded-xl border border-[#23b8d8]/20 bg-[#23b8d8]/10 px-3 py-3">
              <div className="ops-mono text-[10px] uppercase tracking-[0.18em] text-[#8cecff]">Response window</div>
              <div className="mt-1 font-black text-white">26 minutes</div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
          <div>
            <div className="ops-mono text-[10px] uppercase tracking-[0.18em] text-white/54">Replay mode</div>
            <div className="mt-1 text-sm font-bold text-white">Auto-play loop with manual override</div>
          </div>
          <div className="flex items-center gap-2">
            {replayEvents.map((event, index) => (
              <button
                key={event.id}
                type="button"
                onClick={() => {
                  setActiveIndex(index);
                  setReplayCycle((value) => value + 1);
                }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'w-10 bg-[#f5c451]' : 'w-2.5 bg-white/24 hover:bg-white/44'
                }`}
                aria-label={`Open replay event ${index + 1}: ${event.title}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {replayEvents.map((event, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={event.id}
                type="button"
                onClick={() => {
                  setActiveIndex(index);
                  setReplayCycle((value) => value + 1);
                }}
                className={`group grid w-full gap-4 rounded-2xl border px-4 py-4 text-left transition duration-300 md:grid-cols-[72px_16px_1fr_auto] ${
                  isActive
                    ? 'border-white/18 bg-white text-[#0d1513] shadow-[0_20px_55px_rgba(255,255,255,0.08)]'
                    : 'border-white/10 bg-white/4 text-white hover:border-white/20 hover:bg-white/7'
                }`}
              >
                <div>
                  <div className={`ops-mono text-[11px] font-bold uppercase tracking-[0.18em] ${isActive ? 'text-[#63716b]' : 'text-white/48'}`}>
                    T+{index + 1}
                  </div>
                  <div className={`mt-1 text-lg font-black ${isActive ? 'text-[#111817]' : 'text-white'}`}>{event.time}</div>
                </div>

                <div className="relative hidden md:block">
                  <div className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 ${isActive ? 'bg-[#f5c451]/55' : 'bg-white/10'}`} />
                  <span
                    className="absolute left-1/2 top-4 h-4 w-4 -translate-x-1/2 rounded-full border-2"
                    style={{
                      borderColor: isActive ? event.accent : 'rgba(255,255,255,0.28)',
                      backgroundColor: isActive ? event.accent : '#111817',
                      boxShadow: isActive ? `0 0 0 6px ${event.accent}22` : 'none',
                    }}
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`ops-mono text-[10px] font-bold uppercase tracking-[0.18em] ${isActive ? 'text-[#5f6d68]' : 'text-white/48'}`}>
                      {event.actor}
                    </span>
                    <span
                      className="inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
                      style={{
                        borderColor: `${event.accent}${isActive ? '' : '55'}`,
                        color: isActive ? event.accent : '#ffffff',
                        backgroundColor: isActive ? `${event.accent}14` : 'rgba(255,255,255,0.06)',
                      }}
                    >
                      {event.status}
                    </span>
                  </div>
                  <div className={`mt-2 text-base font-black ${isActive ? 'text-[#111817]' : 'text-white'}`}>{event.title}</div>
                  <div className={`mt-2 text-sm leading-6 ${isActive ? 'text-[#53615c]' : 'text-white/64'}`}>{event.note}</div>
                </div>

                <div className="flex items-start justify-between gap-3 md:block">
                  <div className={`ops-mono text-[10px] uppercase tracking-[0.16em] ${isActive ? 'text-[#6d7a75]' : 'text-white/46'}`}>ETA</div>
                  <div className={`mt-1 text-sm font-black ${isActive ? 'text-[#111817]' : 'text-white'}`}>{event.eta}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[1.6rem] border border-white/12 bg-[linear-gradient(180deg,#13211d_0%,#0b1211_100%)] p-5 shadow-[0_28px_100px_rgba(0,0,0,0.34)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(239,91,71,0.18),transparent_18rem),radial-gradient(circle_at_88%_14%,rgba(44,183,216,0.14),transparent_16rem),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:auto,auto,36px_36px,36px_36px]" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="ops-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#8cecff]">Active frame</div>
              <div className="mt-2 text-2xl font-black text-white md:text-3xl">{activeEvent.title}</div>
              <div className="mt-2 max-w-2xl text-sm leading-6 text-white/66">{activeEvent.detail}</div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/74">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activeEvent.accent }} />
              Step {String(activeIndex + 1).padStart(2, '0')}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
              <div className="ops-mono text-[10px] uppercase tracking-[0.18em] text-white/50">Lead actor</div>
              <div className="mt-2 text-lg font-black text-white">{activeEvent.actor}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
              <div className="ops-mono text-[10px] uppercase tracking-[0.18em] text-white/50">Status</div>
              <div className="mt-2 text-lg font-black" style={{ color: activeEvent.accent }}>
                {activeEvent.status}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
              <div className="ops-mono text-[10px] uppercase tracking-[0.18em] text-white/50">Dispatch ETA</div>
              <div className="mt-2 text-lg font-black text-white">{activeEvent.eta}</div>
            </div>
          </div>

          <div className="mt-5 rounded-[1.35rem] border border-white/10 bg-[#091412]/92 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="ops-mono text-[10px] uppercase tracking-[0.18em] text-[#f5c451]">Operational impact</div>
                <div className="mt-1 text-sm font-bold text-white">Live case state at this moment in the replay</div>
              </div>
              <div className="ops-mono text-[10px] uppercase tracking-[0.18em] text-white/44">Cycle {String(replayCycle + 1).padStart(2, '0')}</div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {activeEvent.metrics.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="ops-mono text-[10px] uppercase tracking-[0.16em] text-white/46">{label}</div>
                  <div className="mt-2 text-lg font-black text-white">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border px-4 py-4" style={{ borderColor: `${activeEvent.accent}38`, backgroundColor: `${activeEvent.accent}12` }}>
              <div className="ops-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: activeEvent.accent }}>
                Situation note
              </div>
              <div className="mt-2 text-sm leading-6 text-white/78">{activeEvent.note}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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

  const activeIncident = visibleFeed[0] ?? districtFeed[0];
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
  const mapPoints = useMemo(
    () => [...visibleFeed.map((item) => item.coords), ...responseHubs.map((hub) => hub.coords)],
    [visibleFeed]
  );

  return (
    <div className="live-district-board relative min-h-[560px] overflow-hidden rounded-[1.5rem] border border-[#d4dbd3] bg-[#dce7df] text-[#0d1513] shadow-[0_32px_110px_rgba(17,24,23,0.16)]">
      <div className="absolute inset-0">
        <MapContainer
          className="live-district-board__map"
          center={heroMapCenter}
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
          <RefreshHeroMapLayout />
          <SyncHeroMapViewport points={mapPoints} />
          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {routeLines.map((route) => (
            <Polyline
              key={route.id}
              positions={route.positions}
              pathOptions={{
                color: route.color,
                weight: route.active ? 4 : 2.5,
                opacity: route.active ? 0.88 : 0.48,
                dashArray: route.active ? '10 7' : '7 9',
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
              radius={item.pulse ? 14 + item.intensity * 2 : 10 + item.intensity}
              pathOptions={{
                color: item.color,
                fillColor: item.fill,
                fillOpacity: item.pulse ? 0.9 : 0.76,
                weight: item.pulse ? 4.5 : 2.5,
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

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_48%,rgba(17,24,23,0.07)_100%)]" />
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
            eyebrow=""
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
            eyebrow="Incident replay"
            title="Watch one flood response move through the command chain."
            copy="This replay shows how a verified urban flood case travels from first citizen signal to dispatch, shelter routing, and final closure in one shared operational view."
          />
          <IncidentReplay />
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
