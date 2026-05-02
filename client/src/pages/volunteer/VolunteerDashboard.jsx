import { useEffect, useMemo, useState } from 'react';
import {
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiCompass,
  FiCrosshair,
  FiMap,
  FiNavigation,
  FiRefreshCcw,
  FiTarget,
  FiTruck,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  DashboardHero,
  DashboardSection,
  EmptyState,
  MetricCard,
  PriorityBadge,
  StatusBadge,
  TimelineList,
} from '../../components/dashboard/DashboardPrimitives';
import AdminMonitoringMap from '../../components/maps/AdminMonitoringMap';
import { useAuth } from '../../context/AuthContext';
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
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
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

function formatDateTime(value) {
  if (!value) return 'No timestamp';
  return new Date(value).toLocaleString();
}

function sortByPriority(items) {
  return [...items].sort((a, b) => {
    const priorityDiff = Number(b.priority ?? 3) - Number(a.priority ?? 3);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
  });
}

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [radiusKm, setRadiusKm] = useState(10);
  const [coords, setCoords] = useState({ lng: '', lat: '' });
  const volunteerId = user?.id || user?._id || null;

  const hasCoords = coords.lng !== '' && coords.lat !== '';
  const canSearch = useMemo(() => hasCoords && Number(radiusKm) > 0, [hasCoords, radiusKm]);
  const isAssignedToCurrentVolunteer = (item) => {
    const assignedId = item?.assignedVolunteer?._id || item?.assignedVolunteer?.id || item?.assignedVolunteer;
    return Boolean(volunteerId && assignedId && String(assignedId) === String(volunteerId));
  };

  const queuedRequests = useMemo(() => sortByPriority(requests.filter((item) => !item.assignedVolunteer)), [requests]);
  const activeAssignments = useMemo(
    () => sortByPriority(requests.filter((item) => isAssignedToCurrentVolunteer(item) && item.status !== 'Completed')),
    [requests, volunteerId]
  );
  const completedAssignments = useMemo(
    () => requests.filter((item) => isAssignedToCurrentVolunteer(item) && item.status === 'Completed').length,
    [requests, volunteerId]
  );

  const recentAlerts = useMemo(
    () =>
      [...alerts]
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
        .slice(0, 4)
        .map((item) => ({
          id: item._id,
          title: `${item.disasterType} alert`,
          copy: `${formatLocation(item.location)} • Severity ${item.severity}`,
          meta: formatDateTime(item.updatedAt || item.createdAt),
          footer: <StatusBadge value={item.status || 'Open'} />,
        })),
    [alerts]
  );

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
          report.status === 'Resolved' ? prev.filter((item) => item._id !== report._id) : mergeById(prev, report)
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
      socket.on('request_accepted', onAccepted);
      socket.on('status_updated', onStatusUpdated);

      detachListeners = () => {
        socket.off('disaster:created', onDisasterCreated);
        socket.off('disaster:updated', onDisasterUpdated);
        socket.off('request:created', onRequestCreated);
        socket.off('request:updated', onRequestUpdated);
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
    const item = requests.find((entry) => entry._id === id);
    if (!item || !isAssignedToCurrentVolunteer(item)) {
      toast.error('You can only update requests assigned to you');
      return;
    }

    try {
      const updated = await requestsApi.setStatus({ id, status });
      toast.success(`Status updated: ${status}`);
      setRequests((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update status');
    }
  }

  return (
    <div className="space-y-5">
      <DashboardHero
        accent="volunteer"
        eyebrow="Volunteer dispatch"
        title="Work the nearest demand, keep field status current."
        copy="Use a live search radius to scan nearby incidents, accept relief requests, and move active assignments from accepted to completed."
      >
        <MetricCard label="Coverage radius" value={`${radiusKm} km`} detail="Current search distance" icon={FiCompass} tone="info" />
        <MetricCard label="Live alerts" value={alerts.length} detail="Open incidents inside your search area" icon={FiAlertTriangle} tone="danger" />
        <MetricCard label="Task queue" value={queuedRequests.length} detail="Unassigned requests available to accept" icon={FiTarget} tone="warning" />
        <MetricCard
          label="Active assignments"
          value={activeAssignments.length}
          detail={`${completedAssignments} completed in current result set`}
          icon={FiTruck}
          tone="success"
        />
      </DashboardHero>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-5">
          <DashboardSection
            eyebrow="Dispatch controls"
            title="Set your operating position and scan radius."
            copy="Allow geolocation or enter coordinates manually to generate a reliable nearby demand board."
            action={
              <button type="button" className="btn-ghost" onClick={refresh} disabled={!canSearch}>
                <FiRefreshCcw />
                <span>{loading ? 'Refreshing...' : 'Refresh feed'}</span>
              </button>
            }
          >
            <div className="grid gap-4 md:grid-cols-4">
              <div className="command-panel md:col-span-1">
                <label className="label">Longitude</label>
                <input
                  className="input mt-1"
                  value={coords.lng}
                  onChange={(e) => setCoords((current) => ({ ...current, lng: e.target.value }))}
                  placeholder="e.g. 77.5946"
                />
              </div>
              <div className="command-panel md:col-span-1">
                <label className="label">Latitude</label>
                <input
                  className="input mt-1"
                  value={coords.lat}
                  onChange={(e) => setCoords((current) => ({ ...current, lat: e.target.value }))}
                  placeholder="e.g. 12.9716"
                />
              </div>
              <div className="command-panel md:col-span-1">
                <label className="label">Radius (km)</label>
                <input className="input mt-1" type="number" min={1} value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} />
              </div>
              <div className="command-panel md:col-span-1">
                <div className="label">Search status</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge value={canSearch ? 'Accepted' : 'Pending'} />
                  <StatusBadge value={hasCoords ? 'InProgress' : 'Pending'} />
                </div>
                <div className="mt-3 text-sm text-[rgb(var(--muted))]">
                  {canSearch ? 'Scanning nearby demand.' : 'Add coordinates to start the search.'}
                </div>
              </div>
            </div>

            {!canSearch && (
              <div className="mt-4">
                <EmptyState title="Waiting for search coordinates" copy="Allow geolocation or enter latitude and longitude to start scanning nearby activity." />
              </div>
            )}
          </DashboardSection>

          <DashboardSection
            eyebrow="Geo awareness"
            title="Nearby incident and request map"
            copy="Open alerts and requests inside the selected radius appear on the same operations map."
          >
            <AdminMonitoringMap
              reports={alerts}
              requests={requests}
              center={hasCoords ? { lng: Number(coords.lng), lat: Number(coords.lat) } : null}
              radiusKm={radiusKm}
            />
          </DashboardSection>

          <DashboardSection eyebrow="Actionable queue" title="Take ownership of nearby relief requests" copy="Unassigned requests surface first, with high-priority work sorted to the top.">
            <div className="hidden overflow-auto md:block">
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
                  {sortByPriority(requests).map((item) => (
                    <tr key={item._id}>
                      <td className="py-2">{item.type}</td>
                      <td className="py-2">{item.quantity}</td>
                      <td className="py-2">
                        <PriorityBadge value={item.priority ?? 3} />
                      </td>
                      <td className="py-2">
                        <StatusBadge value={item.status || 'Pending'} />
                      </td>
                      <td className="py-2 text-xs text-[rgb(var(--muted))]">{item.userId?.name || '—'}</td>
                      <td className="py-2">
                        {!item.assignedVolunteer ? (
                          <button className="btn-primary" type="button" onClick={() => acceptRequest(item._id)}>
                            Accept
                          </button>
                        ) : isAssignedToCurrentVolunteer(item) ? (
                          <select className="input" value={item.status} onChange={(e) => updateStatus(item._id, e.target.value)}>
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-xs font-semibold text-[rgb(var(--muted))]">
                            Assigned to {item.assignedVolunteer?.name || 'another volunteer'}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {sortByPriority(requests).map((item) => (
                <div key={item._id} className="signal-list__item">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-black">{item.type}</div>
                      <div className="mt-1 text-xs text-[rgb(var(--muted))]">Qty {item.quantity} • Citizen {item.userId?.name || '—'}</div>
                    </div>
                    <StatusBadge value={item.status || 'Pending'} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <PriorityBadge value={item.priority ?? 3} />
                  </div>
                  <div className="mt-3">
                    {!item.assignedVolunteer ? (
                      <button className="btn-primary w-full" type="button" onClick={() => acceptRequest(item._id)}>
                        Accept request
                      </button>
                    ) : isAssignedToCurrentVolunteer(item) ? (
                      <select className="input" value={item.status} onChange={(e) => updateStatus(item._id, e.target.value)}>
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-xs font-semibold text-[rgb(var(--muted))]">
                        Assigned to {item.assignedVolunteer?.name || 'another volunteer'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!loading && requests.length === 0 && (
              <EmptyState title="No nearby requests found" copy="Try widening the radius or refresh when new requests are broadcast." />
            )}
          </DashboardSection>
        </div>

        <div className="space-y-5">
          <DashboardSection eyebrow="Assignment pressure" title="What needs volunteer movement now" copy="Use this quick read to decide whether to take new work or finish active tasks.">
            <div className="signal-list">
              <div className="signal-list__item">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-black">Unassigned queue</div>
                    <div className="mt-1 text-sm text-[rgb(var(--muted))]">Nearby requests waiting for a volunteer to accept them.</div>
                  </div>
                  <PriorityBadge value={queuedRequests[0]?.priority ?? 3} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-3xl font-black">{queuedRequests.length}</div>
                  <FiNavigation className="text-lg text-[rgb(var(--flare))]" />
                </div>
              </div>

              <div className="signal-list__item">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-black">Work in motion</div>
                    <div className="mt-1 text-sm text-[rgb(var(--muted))]">Accepted or in-progress requests already assigned within your current search result.</div>
                  </div>
                  <StatusBadge value={activeAssignments.length ? 'InProgress' : 'Completed'} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-3xl font-black">{activeAssignments.length}</div>
                  <FiTruck className="text-lg text-[rgb(var(--success))]" />
                </div>
              </div>
            </div>
          </DashboardSection>

          <DashboardSection eyebrow="Active assignments" title="Accepted and in-progress work" copy="Keep statuses current so citizens and admins see reliable movement.">
            {activeAssignments.length ? (
              <div className="signal-list">
                {activeAssignments.slice(0, 5).map((item) => (
                  <div key={item._id} className="signal-list__item">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-black">{item.type}</div>
                        <div className="mt-1 text-sm text-[rgb(var(--muted))]">
                          {formatLocation(item.location)} • Qty {item.quantity}
                        </div>
                      </div>
                      <StatusBadge value={item.status || 'Accepted'} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <PriorityBadge value={item.priority ?? 3} />
                    </div>
                    <select className="input mt-3" value={item.status} onChange={(e) => updateStatus(item._id, e.target.value)}>
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No active assignments" copy="Accept a nearby request to start managing work from this panel." />
            )}
          </DashboardSection>

          <DashboardSection eyebrow="Incident watch" title="Recent nearby alerts" copy="This feed highlights the most recent disaster activity inside the selected radius.">
            <TimelineList
              items={recentAlerts}
              empty={<EmptyState title="No active disaster alerts found" copy="The selected radius is currently clear. Increase the search distance or refresh later." />}
            />
          </DashboardSection>

          <DashboardSection eyebrow="Field guidance" title="Dispatch reminders" copy="Maintain a clean operational picture while working on the ground.">
            <div className="space-y-3 text-sm leading-6 text-[rgb(var(--muted))]">
              <div className="signal-list__item">
                <div className="flex items-start gap-3">
                  <FiCrosshair className="mt-1 shrink-0 text-[rgb(var(--signal))]" />
                  <div>Keep your coordinates current before relying on the queue. Stale location data can hide nearby requests.</div>
                </div>
              </div>
              <div className="signal-list__item">
                <div className="flex items-start gap-3">
                  <FiMap className="mt-1 shrink-0 text-[rgb(var(--info))]" />
                  <div>Use the map to verify clustering before accepting multiple requests in the same area.</div>
                </div>
              </div>
              <div className="signal-list__item">
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="mt-1 shrink-0 text-[rgb(var(--success))]" />
                  <div>Advance status promptly from accepted to in progress to completed so admin coordination stays accurate.</div>
                </div>
              </div>
            </div>
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
