import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AdminMonitoringMap from '../../components/maps/AdminMonitoringMap';
import Modal from '../../components/ui/Modal';
import api from '../../services/api';
import { disastersApi } from '../../services/disasters';
import { requestsApi } from '../../services/requests';
import { subscribeToSocket } from '../../services/socket';
import { usersApi } from '../../services/users';

const tabs = ['Reports', 'Requests', 'Users'];
const reportStatuses = ['Open', 'Acknowledged', 'Resolved'];
const requestStatuses = ['Pending', 'Accepted', 'InProgress', 'Completed', 'Cancelled'];
const roles = ['Citizen', 'Volunteer', 'Admin'];

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

export default function AdminDashboard() {
  const [tab, setTab] = useState('Reports');
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);

  const counts = useMemo(
    () => ({
      reports: reports.length,
      requests: requests.length,
      users: users.length
    }),
    [reports, requests, users]
  );

  const uploadBaseUrl = useMemo(() => {
    try {
      return new URL(api.defaults.baseURL).origin;
    } catch {
      return '';
    }
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const [reportList, requestList, userList] = await Promise.all([disastersApi.list(), requestsApi.list(), usersApi.list()]);
      setReports(reportList);
      setRequests(requestList);
      setUsers(userList);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load admin data');
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

      const onDisasterCreated = ({ report }) => setReports((prev) => mergeById(prev, report));
      const onDisasterUpdated = ({ report }) => setReports((prev) => mergeById(prev, report));
      const onRequestCreated = ({ request }) => setRequests((prev) => mergeById(prev, request));
      const onRequestUpdated = ({ request }) => setRequests((prev) => mergeById(prev, request));
      const onStatusUpdated = ({ requestId, status }) => {
        setRequests((prev) => prev.map((item) => (item._id === requestId ? { ...item, status } : item)));
      };
      const onAccepted = ({ request }) => request && setRequests((prev) => mergeById(prev, request));

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
  }, []);

  async function setReportStatus(id, status) {
    try {
      const updated = await disastersApi.setStatus({ id, status });
      setReports((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
      toast.success('Report status updated');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update report');
    }
  }

  async function setRequestStatus(id, status) {
    try {
      const updated = await requestsApi.setStatus({ id, status });
      setRequests((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
      toast.success('Request status updated');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update request');
    }
  }

  async function setRequestPriority(id, priority) {
    try {
      const updated = await requestsApi.setPriority({ id, priority: Number(priority) });
      setRequests((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
      toast.success('Priority updated');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update priority');
    }
  }

  async function setUserRole(id, role) {
    try {
      const updated = await usersApi.setRole({ id, role });
      setUsers((prev) =>
        prev.map((user) => (user._id === updated.id || user._id === updated._id ? { ...user, role: updated.role } : user))
      );
      toast.success('User role updated');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update role');
    }
  }

  async function confirmDeleteUser() {
    if (!pendingDeleteUser) return;

    try {
      await usersApi.remove({ id: pendingDeleteUser._id });
      setUsers((prev) => prev.filter((user) => user._id !== pendingDeleteUser._id));
      toast.success('User deleted');
      setPendingDeleteUser(null);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to delete user');
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] p-5 text-[rgb(var(--bg))] shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="ops-mono text-xs font-bold uppercase text-[rgb(var(--flare))]">admin command</p>
            <h1 className="mt-2 text-3xl font-black">Monitor incidents, requests, users, and field geography.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/66">
              Keep operational status clean so responders can act from a trusted shared board.
            </p>
          </div>
          <button type="button" className="btn-primary bg-[rgb(var(--flare))] text-black" onClick={refresh}>
            Refresh board
          </button>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card">
          <div className="ops-mono text-xs font-bold uppercase text-[rgb(var(--signal))]">Reports</div>
          <div className="mt-2 text-4xl font-black">{counts.reports}</div>
          <div className="text-xs text-[rgb(var(--muted))]">All disaster reports</div>
        </div>
        <div className="card">
          <div className="ops-mono text-xs font-bold uppercase text-[rgb(var(--signal))]">Requests</div>
          <div className="mt-2 text-4xl font-black">{counts.requests}</div>
          <div className="text-xs text-[rgb(var(--muted))]">Resource requests</div>
        </div>
        <div className="card">
          <div className="ops-mono text-xs font-bold uppercase text-[rgb(var(--signal))]">Users</div>
          <div className="mt-2 text-4xl font-black">{counts.users}</div>
          <div className="text-xs text-[rgb(var(--muted))]">Registered users</div>
        </div>
      </div>

      <div className="card">
        <div className="mb-3">
          <div className="text-base font-black">Monitoring map</div>
          <div className="ops-mono text-xs text-[rgb(var(--muted))]">Reports and requests plotted by submitted coordinates.</div>
        </div>
        <AdminMonitoringMap reports={reports} requests={requests} />
      </div>

      <div className="card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-black">Admin Panel</div>
            <div className="ops-mono text-xs text-[rgb(var(--muted))]">Monitor and coordinate the system.</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((item) => (
              <button key={item} type="button" onClick={() => setTab(item)} className={item === tab ? 'btn-primary' : 'btn-ghost'}>
                {item}
              </button>
            ))}
            <button type="button" className="btn-ghost" onClick={refresh}>
              Refresh
            </button>
          </div>
        </div>

        {tab === 'Reports' && (
          <div className="mt-4">
            <div className="hidden overflow-auto md:block">
              <table className="ops-table">
                <thead>
                  <tr>
                    <th className="py-2">Type</th>
                    <th className="py-2">Severity</th>
                    <th className="py-2">Citizen</th>
                    <th className="py-2">Details</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report._id}>
                      <td className="py-2">{report.disasterType}</td>
                      <td className="py-2">{report.severity}</td>
                      <td className="py-2 text-xs text-[rgb(var(--muted))]">{report.userId?.name || '—'}</td>
                      <td className="py-2">
                        <div className="max-w-sm space-y-2">
                          <p className="text-xs leading-5 text-[rgb(var(--muted))]">
                            {report.description || 'No description provided.'}
                          </p>
                          {report.imageUrl && (
                            <a
                              href={`${uploadBaseUrl}${report.imageUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-3 rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--panel))] p-2 hover:border-[rgb(var(--signal))]"
                            >
                              <img
                                src={`${uploadBaseUrl}${report.imageUrl}`}
                                alt={`${report.disasterType} report evidence`}
                                className="h-12 w-12 rounded-md object-cover"
                              />
                              <span className="text-xs font-bold text-[rgb(var(--signal))]">Open uploaded photo</span>
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-2"><span className="status-pill">{report.status}</span></td>
                      <td className="py-2">
                        <select className="input" value={report.status} onChange={(e) => setReportStatus(report._id, e.target.value)}>
                          {reportStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {reports.map((report) => (
                <div key={report._id} className="rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--field))]/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-black">{report.disasterType}</div>
                        <div className="mt-1 text-xs text-[rgb(var(--muted))]">Citizen: {report.userId?.name || '—'}</div>
                      </div>
                    <span className="status-pill">{report.status}</span>
                  </div>
                  <div className="mt-3 text-xs text-[rgb(var(--muted))]">Severity {report.severity}</div>
                  <div className="mt-3 text-xs leading-5 text-[rgb(var(--muted))]">
                    {report.description || 'No description provided.'}
                  </div>
                  {report.imageUrl && (
                    <a
                      href={`${uploadBaseUrl}${report.imageUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-3 rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--panel))] p-2"
                    >
                      <img
                        src={`${uploadBaseUrl}${report.imageUrl}`}
                        alt={`${report.disasterType} report evidence`}
                        className="h-14 w-14 rounded-md object-cover"
                      />
                      <span className="text-xs font-bold text-[rgb(var(--signal))]">Open uploaded photo</span>
                    </a>
                  )}
                  <select className="input mt-3" value={report.status} onChange={(e) => setReportStatus(report._id, e.target.value)}>
                    {reportStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {!loading && reports.length === 0 && (
              <div className="mt-4">
                <EmptyPanel title="No reports found" copy="New disaster reports will appear here for triage and resolution." />
              </div>
            )}
          </div>
        )}

        {tab === 'Requests' && (
          <div className="mt-4">
            <div className="hidden overflow-auto md:block">
              <table className="ops-table">
                <thead>
                  <tr>
                    <th className="py-2">Type</th>
                    <th className="py-2">Qty</th>
                    <th className="py-2">Priority</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Volunteer</th>
                    <th className="py-2">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request._id}>
                      <td className="py-2">{request.type}</td>
                      <td className="py-2">{request.quantity}</td>
                      <td className="py-2">
                        <select className="input" value={request.priority ?? 3} onChange={(e) => setRequestPriority(request._id, e.target.value)}>
                          {[1, 2, 3, 4, 5].map((priority) => (
                            <option key={priority} value={priority}>
                              {priority}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2"><span className="status-pill">{request.status}</span></td>
                      <td className="py-2 text-xs text-[rgb(var(--muted))]">{request.assignedVolunteer?.name || '—'}</td>
                      <td className="py-2">
                        <select className="input" value={request.status} onChange={(e) => setRequestStatus(request._id, e.target.value)}>
                          {requestStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {requests.map((request) => (
                <div key={request._id} className="rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--field))]/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-black">{request.type}</div>
                      <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                        Qty {request.quantity} • Volunteer {request.assignedVolunteer?.name || '—'}
                      </div>
                    </div>
                    <span className="status-pill">{request.status}</span>
                  </div>
                  <div className="mt-3 grid gap-3">
                    <select className="input" value={request.priority ?? 3} onChange={(e) => setRequestPriority(request._id, e.target.value)}>
                      {[1, 2, 3, 4, 5].map((priority) => (
                        <option key={priority} value={priority}>
                          Priority {priority}
                        </option>
                      ))}
                    </select>
                    <select className="input" value={request.status} onChange={(e) => setRequestStatus(request._id, e.target.value)}>
                      {requestStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {!loading && requests.length === 0 && (
              <div className="mt-4">
                <EmptyPanel title="No requests found" copy="Submitted resource requests will appear here for priority and dispatch management." />
              </div>
            )}
          </div>
        )}

        {tab === 'Users' && (
          <div className="mt-4">
            <div className="hidden overflow-auto md:block">
              <table className="ops-table">
                <thead>
                  <tr>
                    <th className="py-2">Name</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Role</th>
                    <th className="py-2">Update</th>
                    <th className="py-2">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="py-2">{user.name}</td>
                      <td className="py-2 text-xs text-[rgb(var(--muted))]">{user.email}</td>
                      <td className="py-2"><span className="status-pill">{user.role}</span></td>
                      <td className="py-2">
                        <select className="input" value={user.role} onChange={(e) => setUserRole(user._id, e.target.value)}>
                          {roles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2">
                        <button type="button" className="btn-ghost" onClick={() => setPendingDeleteUser(user)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {users.map((user) => (
                <div key={user._id} className="rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--field))]/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-black">{user.name}</div>
                      <div className="mt-1 text-xs text-[rgb(var(--muted))]">{user.email}</div>
                    </div>
                    <span className="status-pill">{user.role}</span>
                  </div>
                  <div className="mt-3 grid gap-3">
                    <select className="input" value={user.role} onChange={(e) => setUserRole(user._id, e.target.value)}>
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="btn-ghost" onClick={() => setPendingDeleteUser(user)}>
                      Delete user
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!loading && users.length === 0 && (
              <div className="mt-4">
                <EmptyPanel title="No users found" copy="User accounts will appear here for role control and access cleanup." />
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(pendingDeleteUser)}
        onClose={() => setPendingDeleteUser(null)}
        title="Delete user account"
        actions={
          <>
            <button type="button" className="btn-ghost" onClick={() => setPendingDeleteUser(null)}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={confirmDeleteUser}>
              Delete user
            </button>
          </>
        }
      >
        <p className="text-sm leading-6 text-[rgb(var(--muted))]">
          {pendingDeleteUser
            ? `Remove ${pendingDeleteUser.name} from the platform? This action cannot be undone.`
            : ''}
        </p>
      </Modal>
    </div>
  );
}
