import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FiBell, FiX } from 'react-icons/fi';
import Sidebar, { MobileNavTrigger } from './Sidebar';
import { storage } from '../../utils/storage';
import { subscribeToSocket } from '../../services/socket';
import { useNotifications } from '../../context/NotificationsContext';

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

function toneDot(tone) {
  if (tone === 'danger') return 'bg-[rgb(var(--signal))]';
  if (tone === 'success') return 'bg-[rgb(var(--success))]';
  return 'bg-[rgb(var(--info))]';
}

export default function AppShell() {
  const [theme, setTheme] = useState(storage.getTheme() || 'dark');
  const [open, setOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const { items, unreadCount, add, markAllRead, clear } = useNotifications();

  useEffect(() => {
    storage.setTheme(theme);
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  useEffect(() => {
    let detachListeners = () => {};

    const unsubscribe = subscribeToSocket((socket) => {
      detachListeners();
      if (!socket) return;

      const onDisaster = ({ report }) => {
        add({
          tone: 'danger',
          title: 'New disaster report',
          message: `${report.disasterType} • severity ${report.severity}`,
          payload: report
        });
      };

      const onDisasterUpdated = ({ report }) => {
        add({
          tone: report.status === 'Resolved' ? 'success' : 'info',
          title: 'Disaster report updated',
          message: `${report.disasterType}: ${report.status}`,
          payload: report
        });
      };

      const onRequestCreated = ({ request }) => {
        add({
          tone: 'info',
          title: 'New resource request',
          message: `${request.type} × ${request.quantity}`,
          payload: request
        });
      };

      const onRequestUpdated = ({ request }) => {
        add({
          tone: request.status === 'Completed' ? 'success' : 'info',
          title: 'Resource request updated',
          message: `${request.type}: ${request.status}`,
          payload: request
        });
      };

      const onStatus = ({ requestId, status }) => {
        add({
          tone: 'success',
          title: 'Request status updated',
          message: `${requestId}: ${status}`,
          payload: { requestId, status }
        });
      };

      const onAccepted = ({ request, requestId, status }) => {
        const entry = request || { _id: requestId, status };
        add({
          tone: 'success',
          title: 'Request accepted',
          message: entry?._id ? `${entry._id}: ${entry.status || status || 'Accepted'}` : 'A request was accepted',
          payload: entry
        });
      };

      socket.on('disaster:created', onDisaster);
      socket.on('disaster:updated', onDisasterUpdated);
      socket.on('request:created', onRequestCreated);
      socket.on('request:updated', onRequestUpdated);
      socket.on('request_accepted', onAccepted);
      socket.on('status_updated', onStatus);

      detachListeners = () => {
        socket.off('disaster:created', onDisaster);
        socket.off('disaster:updated', onDisasterUpdated);
        socket.off('request:created', onRequestCreated);
        socket.off('request:updated', onRequestUpdated);
        socket.off('request_accepted', onAccepted);
        socket.off('status_updated', onStatus);
      };
    });

    return () => {
      detachListeners();
      unsubscribe();
    };
  }, [add]);

  useEffect(() => {
    if (open) markAllRead();
  }, [open, markAllRead]);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMobileNavOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileNavOpen]);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--ink))]">
      <div className="mx-auto flex max-w-[1600px]">
        <Sidebar theme={theme} onToggleTheme={toggleTheme} />

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[rgb(var(--line))] bg-[rgb(var(--panel))]/86 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-3">
              <MobileNavTrigger onClick={() => setMobileNavOpen(true)} />
              <div>
                <div className="text-sm font-black">Emergency Coordination Dashboard</div>
                <div className="ops-mono text-xs text-[rgb(var(--muted))]">Real-time alerts and requests</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button type="button" className="btn-ghost relative" onClick={() => setOpen(true)}>
                <FiBell />
                <span className="hidden sm:inline">Notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-6">
            <Outlet />
          </main>
        </div>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/56 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-[min(22rem,88vw)] border-r border-[rgb(var(--line))] shadow-2xl">
              <Sidebar
                mobile
                theme={theme}
                onToggleTheme={toggleTheme}
                onNavigate={() => setMobileNavOpen(false)}
              />
            </div>
          </div>
        )}

        {open && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/56 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <aside className="absolute right-0 top-0 h-full w-full max-w-md border-l border-[rgb(var(--line))] bg-[rgb(var(--panel))] p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-black">Notifications</div>
                  <div className="ops-mono text-xs text-[rgb(var(--muted))]">Live updates from the platform</div>
                </div>
                <button className="btn-ghost" onClick={() => setOpen(false)}>
                  <FiX />
                  <span className="sr-only">Close</span>
                </button>
              </div>

              <div className="mb-3 flex gap-2">
                <button className="btn-ghost" onClick={markAllRead} type="button">
                  Mark all read
                </button>
                <button className="btn-ghost" onClick={clear} type="button">
                  Clear
                </button>
              </div>

              <div className="space-y-2 overflow-auto pr-1" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                {items.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[rgb(var(--line))] p-4 text-sm text-[rgb(var(--muted))]">
                    No notifications yet.
                  </div>
                ) : (
                  items.map((n) => (
                    <div
                      key={n.id}
                      className="rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--field))] p-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${toneDot(n.tone)}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="truncate text-sm font-bold">{n.title}</div>
                            <div className="ops-mono text-[11px] text-[rgb(var(--muted))]">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-[rgb(var(--muted))]">{n.message}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
