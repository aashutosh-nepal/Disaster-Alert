import { useEffect, useMemo, useState } from 'react';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiLayers,
  FiMap,
  FiRefreshCcw,
  FiShield,
  FiSliders,
  FiUsers,
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

function sortByNewest(items) {
  return [...items].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
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
      openReports: reports.filter((item) => item.status !== 'Resolved').length,
      requests: requests.length,
      activeRequests: requests.filter((item) => !['Completed', 'Cancelled'].includes(item.status)).length,
      completedRequests: requests.filter((item) => item.status === 'Completed').length,
      users: users.length,
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

  const criticalActivity = useMemo(() => {
    return sortByNewest([
      ...reports.map((report) => ({
        id: `report-${report._id}`,
        title: `${report.disasterType} report`,
        copy: `${report.userId?.name || 'Citizen'} • ${formatLocation(report.location)}`,
        meta: formatDateTime(report.updatedAt || report.createdAt),
        footer: (
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={report.status || 'Open'} />
            <span className="status-badge status-badge--warning">Severity {report.severity}</span>
          </div>
        ),
        createdAt: report.updatedAt || report.createdAt,
      })),
      ...requests.map((request) => ({
        id: `request-${request._id}`,
        title: `${request.type} request x${request.quantity}`,
        copy: `${request.userId?.name || 'Citizen'} • Volunteer ${request.assignedVolunteer?.name || 'unassigned'}`,
        meta: formatDateTime(request.updatedAt || request.createdAt),
        footer: (
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={request.status || 'Pending'} />
            <PriorityBadge value={request.priority ?? 3} />
          </div>
        ),
        createdAt: request.updatedAt || request.createdAt,
      })),
    ]).slice(0, 6);
  }, [reports, requests]);

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
    <div className="space-y-5">
      <DashboardHero
        accent="admin"
        eyebrow="Admin command"
        title="Coordinate incidents, resources, and platform control."
        copy="This board keeps operations, dispatch pressure, and user administration on one clean command surface without changing the underlying workflows."
      >
        <MetricCard label="Total reports" value={counts.reports} detail={`${counts.openReports} still open or acknowledged`} icon={FiAlertTriangle} tone="danger" />
        <MetricCard label="Active requests" value={counts.activeRequests} detail={`${counts.requests} total requests in the system`} icon={FiLayers} tone="warning" />
        <MetricCard label="Completed requests" value={counts.completedRequests} detail="Resolved delivery and support work" icon={FiCheckCircle} tone="success" />
        <MetricCard label="Registered users" value={counts.users} detail="Citizen, volunteer, and admin accounts" icon={FiUsers} tone="info" />
      </DashboardHero>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-5">
          <DashboardSection
            eyebrow="Monitoring map"
            title="Geographic incident and request picture"
            copy="Reports and resource requests are plotted together so command can quickly inspect clustering and spread."
            action={
              <button type="button" className="btn-primary" onClick={refresh}>
                <FiRefreshCcw />
                <span>{loading ? 'Refreshing...' : 'Refresh board'}</span>
              </button>
            }
          >
            <AdminMonitoringMap reports={reports} requests={requests} />
          </DashboardSection>

          <DashboardSection eyebrow="Control board" title="Reports, requests, and users" copy="Keep the shared system state clean so all roles act from trusted information.">
            <div className="mb-4 flex flex-wrap gap-2">
              {tabs.map((item) => (
                <button key={item} type="button" onClick={() => setTab(item)} className={item === tab ? 'btn-primary' : 'btn-ghost'}>
                  {item}
                </button>
              ))}
            </div>

            {tab === 'Reports' && (
              <div>
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
                      {sortByNewest(reports).map((report) => (
                        <tr key={report._id}>
                          <td className="py-2">{report.disasterType}</td>
                          <td className="py-2">
                            <span className="status-badge status-badge--warning">Severity {report.severity}</span>
                          </td>
                          <td className="py-2 text-xs text-[rgb(var(--muted))]">{report.userId?.name || '—'}</td>
                          <td className="py-2">
                            <div className="max-w-sm space-y-2">
                              <p className="text-xs leading-5 text-[rgb(var(--muted))]">{report.description || 'No description provided.'}</p>
                              <div className="text-xs text-[rgb(var(--muted))]">{formatLocation(report.location)}</div>
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
                          <td className="py-2">
                            <StatusBadge value={report.status || 'Open'} />
                          </td>
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
                  {sortByNewest(reports).map((report) => (
                    <div key={report._id} className="signal-list__item">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-black">{report.disasterType}</div>
                          <div className="mt-1 text-xs text-[rgb(var(--muted))]">Citizen: {report.userId?.name || '—'}</div>
                        </div>
                        <StatusBadge value={report.status || 'Open'} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="status-badge status-badge--warning">Severity {report.severity}</span>
                      </div>
                      <div className="mt-3 text-xs leading-5 text-[rgb(var(--muted))]">{report.description || 'No description provided.'}</div>
                      <div className="mt-2 text-xs text-[rgb(var(--muted))]">{formatLocation(report.location)}</div>
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
                  <EmptyState title="No reports found" copy="New disaster reports will appear here for triage and resolution." />
                )}
              </div>
            )}

            {tab === 'Requests' && (
              <div>
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
                      {sortByNewest(requests).map((request) => (
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
                          <td className="py-2">
                            <StatusBadge value={request.status || 'Pending'} />
                          </td>
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
                  {sortByNewest(requests).map((request) => (
                    <div key={request._id} className="signal-list__item">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-black">{request.type}</div>
                          <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                            Qty {request.quantity} • Volunteer {request.assignedVolunteer?.name || '—'}
                          </div>
                        </div>
                        <StatusBadge value={request.status || 'Pending'} />
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
                  <EmptyState title="No requests found" copy="Submitted resource requests will appear here for priority and dispatch management." />
                )}
              </div>
            )}

            {tab === 'Users' && (
              <div>
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
                          <td className="py-2">
                            <StatusBadge value={user.role} />
                          </td>
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
                    <div key={user._id} className="signal-list__item">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-black">{user.name}</div>
                          <div className="mt-1 text-xs text-[rgb(var(--muted))]">{user.email}</div>
                        </div>
                        <StatusBadge value={user.role} />
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
                  <EmptyState title="No users found" copy="User accounts will appear here for role control and access cleanup." />
                )}
              </div>
            )}
          </DashboardSection>
        </div>

        <div className="space-y-5">
          <DashboardSection eyebrow="Command pressure" title="System summary" copy="A quick read on what requires coordination attention.">
            <div className="signal-list">
              <div className="signal-list__item">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-black">Open incident load</div>
                    <div className="mt-1 text-sm text-[rgb(var(--muted))]">Reports still awaiting resolution.</div>
                  </div>
                  <StatusBadge value={counts.openReports ? 'Open' : 'Resolved'} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-3xl font-black">{counts.openReports}</div>
                  <FiShield className="text-lg text-[rgb(var(--signal))]" />
                </div>
              </div>

              <div className="signal-list__item">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-black">Active resource demand</div>
                    <div className="mt-1 text-sm text-[rgb(var(--muted))]">Requests not yet completed or cancelled.</div>
                  </div>
                  <StatusBadge value={counts.activeRequests ? 'InProgress' : 'Completed'} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-3xl font-black">{counts.activeRequests}</div>
                  <FiSliders className="text-lg text-[rgb(var(--flare))]" />
                </div>
              </div>
            </div>
          </DashboardSection>

          <DashboardSection eyebrow="Critical activity" title="Newest operational changes" copy="Recent incident and request changes are merged into one compact activity feed.">
            <TimelineList
              items={criticalActivity}
              empty={<EmptyState title="No activity yet" copy="System updates will appear here after new reports, requests, or status changes." />}
            />
          </DashboardSection>

          <DashboardSection eyebrow="Board guidance" title="Admin reminders" copy="Keep the command surface consistent and reliable for all roles.">
            <div className="space-y-3 text-sm leading-6 text-[rgb(var(--muted))]">
              <div className="signal-list__item">
                <div className="flex items-start gap-3">
                  <FiMap className="mt-1 shrink-0 text-[rgb(var(--info))]" />
                  <div>Use the monitoring map to spot hotspots before changing status or priority in the tables below.</div>
                </div>
              </div>
              <div className="signal-list__item">
                <div className="flex items-start gap-3">
                  <FiAlertTriangle className="mt-1 shrink-0 text-[rgb(var(--signal))]" />
                  <div>Keep open incidents and high-priority requests visible until field teams confirm movement or resolution.</div>
                </div>
              </div>
              <div className="signal-list__item">
                <div className="flex items-start gap-3">
                  <FiUsers className="mt-1 shrink-0 text-[rgb(var(--success))]" />
                  <div>Role changes and user deletion should be deliberate because they immediately affect route access and board visibility.</div>
                </div>
              </div>
            </div>
          </DashboardSection>
        </div>
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
          {pendingDeleteUser ? `Remove ${pendingDeleteUser.name} from the platform? This action cannot be undone.` : ''}
        </p>
      </Modal>
    </div>
  );
}
