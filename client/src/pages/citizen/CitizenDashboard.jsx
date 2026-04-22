import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
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
    address: address || ''
  };
}

function mergeById(list, item) {
  return [item, ...list.filter((entry) => entry._id !== item._id)];
}

function EmptyPanel({ title, copy }) {
  return (
    <div className="rounded-xl border border-dashed border-[rgb(var(--line))] bg-[rgb(var(--field))]/45 px-4 py-6 text-sm">
      <div className="font-black">{title}</div>
      <div className="mt-1 text-[rgb(var(--muted))]">{copy}</div>
    </div>
  );
}

export default function CitizenDashboard() {
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
                  assignedVolunteer: volunteerId ? { ...(item.assignedVolunteer || {}), _id: volunteerId } : item.assignedVolunteer
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
        imageFile
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
        location: toPoint({ lng: rLng, lat: rLat, address: rAddress })
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
    <div className="space-y-4">
      <section className="rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] p-5 text-[rgb(var(--bg))] shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="ops-mono text-xs font-bold uppercase text-[rgb(var(--flare))]">citizen signal desk</p>
            <h1 className="mt-2 text-3xl font-black">Report danger. Request help. Track movement.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/66">
              Submit verified location details so responders can prioritize active incidents and resource needs.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-white/12 bg-white/8 px-4 py-3">
              <div className="ops-mono text-xs uppercase text-white/54">reports</div>
              <div className="text-3xl font-black">{reports.length}</div>
            </div>
            <div className="rounded-md border border-white/12 bg-white/8 px-4 py-3">
              <div className="ops-mono text-xs uppercase text-white/54">requests</div>
              <div className="text-3xl font-black">{requests.length}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-black">Report a disaster</h2>
              <p className="mt-1 text-sm text-[rgb(var(--muted))]">Notifies volunteers in real time with pinned coordinates.</p>
            </div>
            <button className="btn-ghost" type="button" onClick={refresh}>
              Refresh
            </button>
          </div>

          <form className="mt-4 space-y-3" onSubmit={submitDisaster}>
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
              <div className="mt-1 text-xs text-[rgb(var(--muted))]">Use at least 10 characters so responders get enough context.</div>
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
              {submittingDisaster ? 'Submitting report...' : 'Submit report'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="text-base font-black">Request resources</h2>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">Track request status and assigned volunteer from one board.</p>

          <form className="mt-4 space-y-3" onSubmit={submitRequest}>
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
            />

            <div>
              <label className="label">Address (optional)</label>
              <input className="input mt-1" value={rAddress} onChange={(e) => setRAddress(e.target.value)} placeholder="Street / locality" />
            </div>

            <button className="btn-primary w-full" disabled={!canSubmitRequest || submittingRequest}>
              {submittingRequest ? 'Creating request...' : 'Create request'}
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="card">
          <h2 className="text-base font-black">My reports</h2>
          <div className="mt-3 hidden overflow-auto md:block">
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
                    <td className="py-2"><span className="status-pill">{report.status}</span></td>
                    <td className="py-2">
                      <div className="ops-mono text-xs text-[rgb(var(--muted))]">
                        {report.createdAt ? new Date(report.createdAt).toLocaleString() : '—'}
                      </div>
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

          <div className="mt-4 space-y-3 md:hidden">
            {reports.map((report) => (
              <div key={report._id} className="rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--field))]/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-black">{report.disasterType}</div>
                    <div className="mt-1 ops-mono text-xs text-[rgb(var(--muted))]">
                      {report.createdAt ? new Date(report.createdAt).toLocaleString() : '—'}
                    </div>
                  </div>
                  <span className="status-pill">{report.status}</span>
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
            <div className="mt-4">
              <EmptyPanel title="No reports yet" copy="When you submit a disaster report, it will appear here with status updates from responders." />
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-base font-black">My requests</h2>
          <div className="mt-3 hidden overflow-auto md:block">
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
                    <td className="py-2"><span className="status-pill">{request.status}</span></td>
                    <td className="py-2 text-xs text-[rgb(var(--muted))]">
                      {request.assignedVolunteer?.name || (request.assignedVolunteer ? 'Assigned' : '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-3 md:hidden">
            {requests.map((request) => (
              <div key={request._id} className="rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--field))]/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-black">{request.type}</div>
                    <div className="mt-1 text-xs text-[rgb(var(--muted))]">Qty {request.quantity}</div>
                  </div>
                  <span className="status-pill">{request.status}</span>
                </div>
                <div className="mt-3 text-xs text-[rgb(var(--muted))]">
                  Volunteer: {request.assignedVolunteer?.name || (request.assignedVolunteer ? 'Assigned' : '—')}
                </div>
              </div>
            ))}
          </div>

          {!loading && requests.length === 0 && (
            <div className="mt-4">
              <EmptyPanel title="No requests yet" copy="Create a food, water, shelter, medical, or other support request to start tracking response progress." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
