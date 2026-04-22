import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AdminMonitoringMap from '../../components/maps/AdminMonitoringMap';
import { disastersApi } from '../../services/disasters';
import { requestsApi } from '../../services/requests';
import { subscribeToSocket } from '../../services/socket';

const statusOptions = ['Accepted', 'InProgress', 'Completed'];

function distanceKm(a, b) {
  const toRad = (value) => (Number(value) * Math.PI) / 180;
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function pointCoords(item) {
  const lng = item?.location?.coordinates?.[0];
  const lat = item?.location?.coordinates?.[1];
  if (lng == null || lat == null) return null;
  return { lng: Number(lng), lat: Number(lat) };
}

function mergeById(list, item) {
  return [item, ...list.filter((entry) => entry._id !== item._id)];
}

function formatLocation(location) {
  if (location?.address) return location.address;
  const lat = location?.coordinates?.[1];
  const lng = location?.coordinates?.[0];
  if (lat == null || lng == null) return 'Coordinates unavailable';
  return `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
}

function EmptyPanel({ title, copy }) {
  return (
    <div className="rounded-xl border border-dashed border-[rgb(var(--line))] bg-[rgb(var(--field))]/45 px-4 py-6 text-sm">
      <div className="font-black">{title}</div>
      <div className="mt-1 text-[rgb(var(--muted))]">{copy}</div>
    </div>
  );
}

export default function VolunteerDashboard() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [radiusKm, setRadiusKm] = useState(10);
  const [coords, setCoords] = useState({ lng: '', lat: '' });

  const hasCoords = coords.lng !== '' && coords.lat !== '';
  const canSearch = useMemo(() => hasCoords && Number(radiusKm) > 0, [hasCoords, radiusKm]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lng: String(pos.coords.longitude), lat: String(pos.coords.latitude) });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  async function refresh() {
    if (!canSearch) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = { lng: coords.lng, lat: coords.lat, radiusKm };
      const [requestList, alertList] = await Promise.all([requestsApi.list(params), disastersApi.list(params)]);
      setRequests(requestList);
      setAlerts(alertList.filter((item) => item.status !== 'Resolved'));
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load nearby activity');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords.lng, coords.lat, radiusKm]);

  useEffect(() => {
    if (!canSearch) return undefined;

    let detachListeners = () => {};

    const unsubscribe = subscribeToSocket((socket) => {
      detachListeners();
      if (!socket) return;

      const current = { lng: Number(coords.lng), lat: Number(coords.lat) };
      const withinRadius = (item) => {
        const point = pointCoords(item);
        if (!point) return false;
        return distanceKm(current, point) <= Number(radiusKm);
      };

      const onDisasterCreated = ({ report }) => {
        if (!withinRadius(report) || report.status === 'Resolved') return;
        setAlerts((prev) => mergeById(prev, report));
        toast.error(`Nearby ${report.disasterType} alert within ${radiusKm} km`);
      };

      const onDisasterUpdated = ({ report }) => {
        if (!withinRadius(report)) return;
        setAlerts((prev) =>
          report.status === 'Resolved'
            ? prev.filter((item) => item._id !== report._id)
            : mergeById(prev, report)
        );
      };

      const onRequestCreated = ({ request }) => {
        if (!withinRadius(request)) return;
        setRequests((prev) => mergeById(prev, request));
        toast.success(`Nearby ${request.type} request received`);
      };

      const onRequestUpdated = ({ request }) => {
        if (!withinRadius(request)) return;
        setRequests((prev) => mergeById(prev, request));
      };

      const onAccepted = ({ request }) => request && onRequestUpdated({ request });

      const onStatusUpdated = ({ requestId, status }) => {
        setRequests((prev) => prev.map((item) => (item._id === requestId ? { ...item, status } : item)));
      };

      socket.on('disaster:created', onDisasterCreated);
      socket.on('disaster:updated', onDisasterUpdated);
      socket.on('request:created', onRequestCreated);
      socket.on('request:updated', onRequestUpdated);
      socket.on('new_request', onRequestCreated);
      socket.on('request_accepted', onAccepted);
      socket.on('status_updated', onStatusUpdated);

      detachListeners = () => {
        socket.off('disaster:created', onDisasterCreated);
        socket.off('disaster:updated', onDisasterUpdated);
        socket.off('request:created', onRequestCreated);
        socket.off('request:updated', onRequestUpdated);
        socket.off('new_request', onRequestCreated);
        socket.off('request_accepted', onAccepted);
        socket.off('status_updated', onStatusUpdated);
      };
    });

    return () => {
      detachListeners();
      unsubscribe();
    };
  }, [canSearch, coords.lng, coords.lat, radiusKm]);

  async function acceptRequest(id) {
    try {
      const updated = await requestsApi.accept({ id });
      toast.success('Request accepted');
      setRequests((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to accept');
    }
  }

  async function updateStatus(id, status) {
    try {
      const updated = await requestsApi.setStatus({ id, status });
      toast.success(`Status updated: ${status}`);
      setRequests((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update status');
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] p-5 text-[rgb(var(--bg))] shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="ops-mono text-xs font-bold uppercase text-[rgb(var(--flare))]">volunteer dispatch</p>
            <h1 className="mt-2 text-3xl font-black">Find nearby alerts and move requests forward.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/66">
              Use live coordinates and radius search to locate disaster reports and resource requests that need field response.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-white/12 bg-white/8 px-5 py-3">
              <div className="ops-mono text-xs uppercase text-white/54">alerts</div>
              <div className="text-4xl font-black">{alerts.length}</div>
            </div>
            <div className="rounded-md border border-white/12 bg-white/8 px-5 py-3">
              <div className="ops-mono text-xs uppercase text-white/54">requests</div>
              <div className="text-4xl font-black">{requests.length}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="card">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-base font-black">Nearby requests</h2>
            <p className="mt-1 text-sm text-[rgb(var(--muted))]">Search, accept, and update request status.</p>
          </div>

          <button type="button" className="btn-ghost" onClick={refresh} disabled={!canSearch}>
            Refresh
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div>
            <label className="label">Longitude</label>
            <input
              className="input mt-1"
              value={coords.lng}
              onChange={(e) => setCoords((current) => ({ ...current, lng: e.target.value }))}
              placeholder="e.g. 77.5946"
            />
          </div>
          <div>
            <label className="label">Latitude</label>
            <input
              className="input mt-1"
              value={coords.lat}
              onChange={(e) => setCoords((current) => ({ ...current, lat: e.target.value }))}
              placeholder="e.g. 12.9716"
            />
          </div>
          <div>
            <label className="label">Radius (km)</label>
            <input
              className="input mt-1"
              type="number"
              min={1}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
            />
          </div>
        </div>

        {!canSearch && (
          <div className="mt-4">
            <EmptyPanel title="Waiting for search coordinates" copy="Allow geolocation or enter latitude and longitude to start scanning nearby activity." />
          </div>
        )}
      </div>

      <div className="card">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-black">Geo-location based disaster alerts</h2>
            <p className="mt-1 text-sm text-[rgb(var(--muted))]">
              Open reports inside the selected radius appear here and on the live map.
            </p>
          </div>
          <span className="ops-chip">{radiusKm} km radius</span>
        </div>

        <AdminMonitoringMap reports={alerts} requests={requests} />

        <div className="mt-4 hidden overflow-auto md:block">
          <table className="ops-table">
            <thead>
              <tr>
                <th className="py-2">Type</th>
                <th className="py-2">Severity</th>
                <th className="py-2">Status</th>
                <th className="py-2">Location</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((item) => (
                <tr key={item._id}>
                  <td className="py-2">{item.disasterType}</td>
                  <td className="py-2">{item.severity}</td>
                  <td className="py-2"><span className="status-pill">{item.status}</span></td>
                  <td className="py-2 text-xs text-[rgb(var(--muted))]">{formatLocation(item.location)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 space-y-3 md:hidden">
          {alerts.map((item) => (
            <div key={item._id} className="rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--field))]/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-black">{item.disasterType}</div>
                  <div className="mt-1 text-xs text-[rgb(var(--muted))]">{formatLocation(item.location)}</div>
                </div>
                <span className="status-pill">{item.status}</span>
              </div>
              <div className="mt-3 ops-mono text-xs text-[rgb(var(--muted))]">Severity {item.severity}</div>
            </div>
          ))}
        </div>

        {!loading && alerts.length === 0 && (
          <div className="mt-4">
            <EmptyPanel title="No active disaster alerts found" copy="The selected radius is currently clear. Increase the search distance or refresh later." />
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-base font-black">Requests</h2>
        <p className="mt-1 text-sm text-[rgb(var(--muted))]">Take ownership of pending requests and keep field progress current.</p>

        <div className="mt-3 hidden overflow-auto md:block">
          <table className="ops-table">
            <thead>
              <tr>
                <th className="py-2">Type</th>
                <th className="py-2">Qty</th>
                <th className="py-2">Priority</th>
                <th className="py-2">Status</th>
                <th className="py-2">Citizen</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((item) => (
                <tr key={item._id}>
                  <td className="py-2">{item.type}</td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2">{item.priority ?? 3}</td>
                  <td className="py-2"><span className="status-pill">{item.status}</span></td>
                  <td className="py-2 text-xs text-[rgb(var(--muted))]">{item.userId?.name || '—'}</td>
                  <td className="py-2">
                    {!item.assignedVolunteer ? (
                      <button className="btn-primary" type="button" onClick={() => acceptRequest(item._id)}>
                        Accept
                      </button>
                    ) : (
                      <select className="input" value={item.status} onChange={(e) => updateStatus(item._id, e.target.value)}>
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 space-y-3 md:hidden">
          {requests.map((item) => (
            <div key={item._id} className="rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--field))]/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-black">{item.type}</div>
                  <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                    Qty {item.quantity} • Priority {item.priority ?? 3}
                  </div>
                </div>
                <span className="status-pill">{item.status}</span>
              </div>
              <div className="mt-3 text-xs text-[rgb(var(--muted))]">Citizen: {item.userId?.name || '—'}</div>
              <div className="mt-3">
                {!item.assignedVolunteer ? (
                  <button className="btn-primary w-full" type="button" onClick={() => acceptRequest(item._id)}>
                    Accept request
                  </button>
                ) : (
                  <select className="input" value={item.status} onChange={(e) => updateStatus(item._id, e.target.value)}>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>

        {!loading && requests.length === 0 && (
          <div className="mt-4">
            <EmptyPanel title="No nearby requests found" copy="Try widening the radius or refresh when new requests are broadcast." />
          </div>
        )}
      </div>
    </div>
  );
}
