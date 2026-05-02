import { useEffect, useMemo, useState } from 'react';
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowUpRight,
  FiClock,
  FiCrosshair,
  FiDroplet,
  FiFileText,
  FiLifeBuoy,
  FiRefreshCcw,
  FiUserCheck,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import {
  DashboardHero,
  DashboardSection,
  EmptyState,
  MetricCard,
  StatusBadge,
  TimelineList,
} from '../../components/dashboard/DashboardPrimitives';
import MapPicker from '../../components/maps/MapPicker';
import { disastersApi } from '../../services/disasters';
import { requestsApi } from '../../services/requests';
import api from '../../services/api';
import { subscribeToSocket } from '../../services/socket';

const disasterTypes = ['Flood', 'Fire', 'Earthquake', 'Storm', 'Landslide', 'Other'];
const requestTypes = ['Food', 'Water', 'Shelter', 'Medical', 'Other'];

function toPoint({ lng, lat, address }) {
  return {
    type: 'Point',
    coordinates: [Number(lng), Number(lat)],
    address: address || '',
  };
}

function mergeById(list, item) {
  return [item, ...list.filter((entry) => entry._id !== item._id)];
}

function formatDateTime(value) {
  if (!value) return 'No timestamp';
  return new Date(value).toLocaleString();
}

function formatLocation(location) {
  if (location?.address) return location.address;
  const lat = location?.coordinates?.[1];
  const lng = location?.coordinates?.[0];
  if (lat == null || lng == null) return 'Coordinates unavailable';
  return `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
}

function sortNewest(items) {
  return [...items].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
}

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [requests, setRequests] = useState([]);
  const [submittingDisaster, setSubmittingDisaster] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const [disasterType, setDisasterType] = useState('Flood');
  const [severity, setSeverity] = useState(3);
  const [description, setDescription] = useState('');
  const [dLng, setDLng] = useState('');
  const [dLat, setDLat] = useState('');
  const [dAddress, setDAddress] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [reqType, setReqType] = useState('Food');
  const [quantity, setQuantity] = useState(1);
  const [rLng, setRLng] = useState('');
  const [rLat, setRLat] = useState('');
  const [rAddress, setRAddress] = useState('');

  const uploadBaseUrl = useMemo(() => {
    try {
      return new URL(api.defaults.baseURL).origin;
    } catch {
      return '';
    }
  }, []);

  const canSubmitDisaster = useMemo(
    () => description.trim().length >= 10 && dLng !== '' && dLat !== '',
    [description, dLng, dLat]
  );

  const canSubmitRequest = useMemo(
    () => Number(quantity) > 0 && rLng !== '' && rLat !== '',
    [quantity, rLng, rLat]
  );

  const reportCounts = useMemo(
    () => ({
      total: reports.length,
      open: reports.filter((item) => item.status !== 'Resolved').length,
    }),
    [reports]
  );

  const requestCounts = useMemo(
    () => ({
      total: requests.length,
      active: requests.filter((item) => !['Completed', 'Cancelled'].includes(item.status)).length,
      assigned: requests.filter((item) => Boolean(item.assignedVolunteer)).length,
    }),
    [requests]
  );

  const latestSignal = useMemo(() => {
    const merged = sortNewest([
      ...reports.map((item) => ({
        id: `report-${item._id}`,
        createdAt: item.updatedAt || item.createdAt,
        label: `${item.disasterType} report ${item.status?.toLowerCase() || 'updated'}`,
      })),
      ...requests.map((item) => ({
        id: `request-${item._id}`,
        createdAt: item.updatedAt || item.createdAt,
        label: `${item.type} request ${item.status?.toLowerCase() || 'updated'}`,
      })),
    ]);

    return merged[0] || null;
  }, [reports, requests]);

  const activityFeed = useMemo(() => {
    return sortNewest([
      ...reports.map((item) => ({
        id: `report-${item._id}`,
        title: `${item.disasterType} report`,
        copy: `${item.description || 'Incident logged'} • ${formatLocation(item.location)}`,
        meta: formatDateTime(item.updatedAt || item.createdAt),
        footer: <StatusBadge value={item.status || 'Open'} />,
        createdAt: item.updatedAt || item.createdAt,
      })),
      ...requests.map((item) => ({
        id: `request-${item._id}`,
        title: `${item.type} request x${item.quantity}`,
        copy: `${formatLocation(item.location)} • Volunteer ${item.assignedVolunteer?.name || 'not assigned yet'}`,
        meta: formatDateTime(item.updatedAt || item.createdAt),
        footer: <StatusBadge value={item.status || 'Pending'} />,
        createdAt: item.updatedAt || item.createdAt,
      })),
    ]).slice(0, 5);
  }, [reports, requests]);

  async function refresh() {
    setLoading(true);
    try {
      const [reportList, requestList] = await Promise.all([disastersApi.list(), requestsApi.list()]);
      setReports(reportList);
      setRequests(requestList);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    let detachListeners = () => {};

    const unsubscribe = subscribeToSocket((socket) => {
      detachListeners();
      if (!socket) return;

      const onDisasterUpdated = ({ report }) => {
        setReports((prev) => mergeById(prev, report));
      };

      const onRequestUpdated = ({ request }) => {
        setRequests((prev) => mergeById(prev, request));
      };

      const onStatusUpdated = ({ requestId, status }) => {
        setRequests((prev) => prev.map((item) => (item._id === requestId ? { ...item, status } : item)));
      };

      const onAccepted = ({ request, requestId, status, volunteerId }) => {
        if (request) {
          setRequests((prev) => mergeById(prev, request));
          return;
        }

        setRequests((prev) =>
          prev.map((item) =>
            item._id === requestId
              ? {
                  ...item,
                  status: status || item.status,
                  assignedVolunteer: volunteerId ? { ...(item.assignedVolunteer || {}), _id: volunteerId } : item.assignedVolunteer,
                }
              : item
          )
        );
      };

      socket.on('disaster:updated', onDisasterUpdated);
      socket.on('request:updated', onRequestUpdated);
      socket.on('request:statusChanged', onStatusUpdated);
      socket.on('request_accepted', onAccepted);
      socket.on('status_updated', onStatusUpdated);

      detachListeners = () => {
        socket.off('disaster:updated', onDisasterUpdated);
        socket.off('request:updated', onRequestUpdated);
        socket.off('request:statusChanged', onStatusUpdated);
        socket.off('request_accepted', onAccepted);
        socket.off('status_updated', onStatusUpdated);
      };
    });

    return () => {
      detachListeners();
      unsubscribe();
    };
  }, []);

  async function submitDisaster(event) {
    event.preventDefault();
    if (!canSubmitDisaster) return;

    setSubmittingDisaster(true);
    try {
      const report = await disastersApi.create({
        disasterType,
        description,
        severity,
        location: toPoint({ lng: dLng, lat: dLat, address: dAddress }),
        imageFile,
      });
      toast.success('Disaster report submitted');
      setReports((prev) => mergeById(prev, report));
      setDisasterType('Flood');
      setSeverity(3);
      setDescription('');
      setDLng('');
      setDLat('');
      setDAddress('');
      setImageFile(null);
      setImagePreview('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmittingDisaster(false);
    }
  }

  async function submitRequest(event) {
    event.preventDefault();
    if (!canSubmitRequest) return;

    setSubmittingRequest(true);
    try {
      const request = await requestsApi.create({
        type: reqType,
        quantity: Number(quantity),
        location: toPoint({ lng: rLng, lat: rLat, address: rAddress }),
      });
      toast.success('Resource request created');
      setRequests((prev) => mergeById(prev, request));
      setReqType('Food');
      setQuantity(1);
      setRLng('');
      setRLat('');
      setRAddress('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create request');
    } finally {
      setSubmittingRequest(false);
    }
  }

  function selectImage(file) {
    setImageFile(file || null);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : '';
    });
  }

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  return (
    <div className="space-y-5">
      <DashboardHero
        accent="citizen"
        eyebrow="Citizen signal desk"
        title={`Protect your area, ${user?.name?.split(' ')[0] || 'Citizen'}.`}
        copy="Log verified incidents, request relief, and keep a clear picture of what is open, assigned, and moving in the response chain."
      >
        <MetricCard
          label="Open reports"
          value={reportCounts.open}
          detail={`${reportCounts.total} total reports submitted`}
          icon={FiAlertTriangle}
          tone="danger"
        />
        <MetricCard
          label="Active requests"
          value={requestCounts.active}
          detail={`${requestCounts.assigned} currently have volunteer coverage`}
          icon={FiLifeBuoy}
          tone="warning"
        />
        <MetricCard
          label="Assigned support"
          value={requestCounts.assigned}
          detail="Requests with a volunteer already attached"
          icon={FiUserCheck}
          tone="success"
        />
        <MetricCard
          label="Latest update"
          value={latestSignal ? formatDateTime(latestSignal.createdAt) : 'No updates'}
          detail={latestSignal?.label || 'Your next submission will appear here'}
          icon={FiClock}
          tone="info"
        />
      </DashboardHero>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
        <div className="space-y-5">
          <DashboardSection
            eyebrow="Quick actions"
            title="Send incident and resource signals from one desk."
            copy="Both actions keep the current map picker flow and are structured for faster triage by responders."
            action={
              <button className="btn-ghost" type="button" onClick={refresh}>
                <FiRefreshCcw />
                <span>{loading ? 'Refreshing...' : 'Refresh board'}</span>
              </button>
            }
          >
            <div className="dashboard-form-grid xl:grid-cols-2">
              <div className="command-panel">
                <div className="mb-4">
                  <div className="ops-mono text-xs font-bold uppercase tracking-[0.18em] text-[rgb(var(--signal))]">Incident report</div>
                  <div className="mt-1 text-sm text-[rgb(var(--muted))]">Share the type, severity, coordinates, and optional image evidence.</div>
                </div>

                <form className="space-y-3" onSubmit={submitDisaster}>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="label">Type</label>
                      <select className="input mt-1" value={disasterType} onChange={(e) => setDisasterType(e.target.value)}>
                        {disasterTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Severity (1-5)</label>
                      <input
                        className="input mt-1"
                        type="number"
                        min={1}
                        max={5}
                        value={severity}
                        onChange={(e) => setSeverity(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Description</label>
                    <textarea
                      className="input mt-1 min-h-24"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the incident, nearby risk, and current urgency."
                    />
                    <div className="mt-1 text-xs text-[rgb(var(--muted))]">Use at least 10 characters so responders can assess the situation quickly.</div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="label">Longitude</label>
                      <input className="input mt-1" value={dLng} onChange={(e) => setDLng(e.target.value)} placeholder="e.g. 77.5946" />
                    </div>
                    <div>
                      <label className="label">Latitude</label>
                      <input className="input mt-1" value={dLat} onChange={(e) => setDLat(e.target.value)} placeholder="e.g. 12.9716" />
                    </div>
                  </div>

                  <MapPicker
                    value={{ lng: dLng, lat: dLat }}
                    onChange={({ lng, lat }) => {
                      setDLng(String(lng));
                      setDLat(String(lat));
                    }}
                    height={260}
                  />

                  <div>
                    <label className="label">Address (optional)</label>
                    <input className="input mt-1" value={dAddress} onChange={(e) => setDAddress(e.target.value)} placeholder="Street / locality" />
                  </div>

                  <div>
                    <label className="label">Image (optional)</label>
                    <input
                      className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-800 dark:text-slate-300 dark:file:bg-slate-800 dark:file:text-slate-100"
                      type="file"
                      accept="image/*"
                      onChange={(e) => selectImage(e.target.files?.[0] || null)}
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Selected disaster evidence preview"
                        className="mt-3 h-36 w-full rounded-lg border border-[rgb(var(--line))] object-cover"
                      />
                    )}
                  </div>

                  <button className="btn-primary w-full" disabled={!canSubmitDisaster || submittingDisaster}>
                    {submittingDisaster ? 'Submitting report...' : 'Submit incident report'}
                  </button>
                </form>
              </div>

              <div className="command-panel">
                <div className="mb-4">
                  <div className="ops-mono text-xs font-bold uppercase tracking-[0.18em] text-[rgb(var(--flare))]">Resource request</div>
                  <div className="mt-1 text-sm text-[rgb(var(--muted))]">Request food, water, shelter, medical aid, or other essentials with pinned location data.</div>
                </div>

                <form className="space-y-3" onSubmit={submitRequest}>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="label">Type</label>
                      <select className="input mt-1" value={reqType} onChange={(e) => setReqType(e.target.value)}>
                        {requestTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Quantity</label>
                      <input className="input mt-1" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="label">Longitude</label>
                      <input className="input mt-1" value={rLng} onChange={(e) => setRLng(e.target.value)} placeholder="e.g. 77.5946" />
                    </div>
                    <div>
                      <label className="label">Latitude</label>
                      <input className="input mt-1" value={rLat} onChange={(e) => setRLat(e.target.value)} placeholder="e.g. 12.9716" />
                    </div>
                  </div>

                  <MapPicker
                    value={{ lng: rLng, lat: rLat }}
                    onChange={({ lng, lat }) => {
                      setRLng(String(lng));
                      setRLat(String(lat));
                    }}
                    height={260}
                  />

                  <div>
                    <label className="label">Address (optional)</label>
                    <input className="input mt-1" value={rAddress} onChange={(e) => setRAddress(e.target.value)} placeholder="Street / locality" />
                  </div>

                  <button className="btn-primary w-full" disabled={!canSubmitRequest || submittingRequest}>
                    {submittingRequest ? 'Creating request...' : 'Create relief request'}
                  </button>
                </form>
              </div>
            </div>
          </DashboardSection>

          <div className="grid gap-5 xl:grid-cols-2">
            <DashboardSection eyebrow="Reports log" title="My incident reports" copy="Track severity, status, evidence, and submission time.">
              <div className="hidden overflow-auto md:block">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th className="py-2">Type</th>
                      <th className="py-2">Severity</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report._id}>
                        <td className="py-2">{report.disasterType}</td>
                        <td className="py-2">{report.severity}</td>
                        <td className="py-2">
                          <StatusBadge value={report.status || 'Open'} />
                        </td>
                        <td className="py-2">
                          <div className="ops-mono text-xs text-[rgb(var(--muted))]">{formatDateTime(report.createdAt)}</div>
                          {report.imageUrl && (
                            <a
                              href={`${uploadBaseUrl}${report.imageUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-flex text-xs font-bold text-[rgb(var(--signal))] hover:underline"
                            >
                              View image
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {reports.map((report) => (
                  <div key={report._id} className="signal-list__item">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-black">{report.disasterType}</div>
                        <div className="mt-1 ops-mono text-xs text-[rgb(var(--muted))]">{formatDateTime(report.createdAt)}</div>
                      </div>
                      <StatusBadge value={report.status || 'Open'} />
                    </div>
                    <div className="mt-3 text-xs text-[rgb(var(--muted))]">Severity {report.severity}</div>
                    {report.imageUrl && (
                      <a
                        href={`${uploadBaseUrl}${report.imageUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-xs font-bold text-[rgb(var(--signal))] hover:underline"
                      >
                        View image
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {!loading && reports.length === 0 && (
                <EmptyState title="No reports yet" copy="When you submit a disaster report, it will appear here with response status updates." />
              )}
            </DashboardSection>

            <DashboardSection eyebrow="Requests log" title="My relief requests" copy="Monitor request status and assigned volunteer coverage.">
              <div className="hidden overflow-auto md:block">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th className="py-2">Type</th>
                      <th className="py-2">Qty</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Volunteer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request._id}>
                        <td className="py-2">{request.type}</td>
                        <td className="py-2">{request.quantity}</td>
                        <td className="py-2">
                          <StatusBadge value={request.status || 'Pending'} />
                        </td>
                        <td className="py-2 text-xs text-[rgb(var(--muted))]">
                          {request.assignedVolunteer?.name || (request.assignedVolunteer ? 'Assigned' : '—')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {requests.map((request) => (
                  <div key={request._id} className="signal-list__item">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-black">{request.type}</div>
                        <div className="mt-1 text-xs text-[rgb(var(--muted))]">Qty {request.quantity}</div>
                      </div>
                      <StatusBadge value={request.status || 'Pending'} />
                    </div>
                    <div className="mt-3 text-xs text-[rgb(var(--muted))]">
                      Volunteer: {request.assignedVolunteer?.name || (request.assignedVolunteer ? 'Assigned' : '—')}
                    </div>
                  </div>
                ))}
              </div>

              {!loading && requests.length === 0 && (
                <EmptyState title="No requests yet" copy="Create a request for support to start tracking volunteer response." />
              )}
            </DashboardSection>
          </div>
        </div>

        <div className="space-y-5">
          <DashboardSection eyebrow="Current situation" title="Response readiness" copy="A compact view of what is still open and what to do next.">
            <div className="signal-list">
              <div className="signal-list__item">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-black">Open incidents</div>
                    <div className="mt-1 text-sm text-[rgb(var(--muted))]">Reports that still require acknowledgement or resolution.</div>
                  </div>
                  <StatusBadge value={reportCounts.open ? 'Open' : 'Resolved'} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-3xl font-black">{reportCounts.open}</div>
                  <FiActivity className="text-lg text-[rgb(var(--signal))]" />
                </div>
              </div>

              <div className="signal-list__item">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-black">Requests awaiting movement</div>
                    <div className="mt-1 text-sm text-[rgb(var(--muted))]">Requests not yet completed or cancelled.</div>
                  </div>
                  <StatusBadge value={requestCounts.active ? 'Pending' : 'Completed'} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-3xl font-black">{requestCounts.active}</div>
                  <FiDroplet className="text-lg text-[rgb(var(--flare))]" />
                </div>
              </div>
            </div>
          </DashboardSection>

          <DashboardSection eyebrow="Latest movement" title="Recent activity feed" copy="New submissions and live status changes surface here first.">
            <TimelineList
              items={activityFeed}
              empty={<EmptyState title="No activity yet" copy="Submit a report or request to begin the response timeline." />}
            />
          </DashboardSection>

          <DashboardSection eyebrow="Guidance" title="What to do after submitting" copy="Keep reports actionable so field teams spend less time clarifying and more time responding.">
            <div className="space-y-3 text-sm leading-6 text-[rgb(var(--muted))]">
              <div className="signal-list__item">
                <div className="flex items-start gap-3">
                  <FiCrosshair className="mt-1 shrink-0 text-[rgb(var(--signal))]" />
                  <div>
                    Confirm the pin is accurate and keep the address field updated if you move to a safer place.
                  </div>
                </div>
              </div>
              <div className="signal-list__item">
                <div className="flex items-start gap-3">
                  <FiFileText className="mt-1 shrink-0 text-[rgb(var(--info))]" />
                  <div>
                    Add concise details about risk, access constraints, and nearby landmarks so volunteers can navigate quickly.
                  </div>
                </div>
              </div>
              <div className="signal-list__item">
                <div className="flex items-start gap-3">
                  <FiArrowUpRight className="mt-1 shrink-0 text-[rgb(var(--success))]" />
                  <div>
                    Watch the request table for assigned volunteers and status changes before sending duplicate requests.
                  </div>
                </div>
              </div>
            </div>
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
