/* eslint-disable react-refresh/only-export-components */
import { createElement } from 'react';
import { NavLink } from 'react-router-dom';
import { FiAlertTriangle, FiClipboard, FiLogOut, FiMenu, FiMoon, FiSun, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export function navItemsForRole(role) {
  const items = [{ to: '/dashboard', icon: FiClipboard, label: 'Dashboard', end: true }];

  if (role === 'Citizen') {
    items.push({ to: '/citizen', icon: FiAlertTriangle, label: 'Report / Requests' });
  }

  if (role === 'Volunteer') {
    items.push({ to: '/volunteer', icon: FiClipboard, label: 'Nearby Requests' });
  }

  if (role === 'Admin') {
    items.push({ to: '/admin', icon: FiUsers, label: 'Admin Panel' });
  }

  return items;
}

function Item({ to, icon: Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition',
          isActive
            ? 'bg-[rgb(var(--signal))] text-white shadow-lg shadow-red-900/10'
            : 'text-[rgb(var(--muted))] hover:bg-[rgb(var(--field))] hover:text-[rgb(var(--ink))]'
        ].join(' ')
      }
    >
      {createElement(Icon)}
      <span>{label}</span>
    </NavLink>
  );
}

function SidebarBody({ role, theme, onToggleTheme, onNavigate }) {
  const { user, logout } = useAuth();
  const items = navItemsForRole(role);

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[rgb(var(--signal))] text-white">
            <FiAlertTriangle />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-black uppercase">Rescue Grid</div>
            <div className="ops-mono text-xs text-[rgb(var(--muted))]">Coordination Platform</div>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--field))] p-3 text-xs text-[rgb(var(--muted))]">
        <div className="font-bold text-[rgb(var(--ink))]">{user?.name || '—'}</div>
        <div className="truncate">{user?.email || '—'}</div>
        <div className="ops-mono mt-2 inline-flex rounded-full bg-[rgb(var(--panel))] px-2 py-0.5 text-[11px] text-[rgb(var(--signal))]">
          {role}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => (
          <div key={item.to} onClick={onNavigate}>
            <Item {...item} />
          </div>
        ))}
      </nav>

      <div className="mt-4 flex flex-col gap-2">
        <button type="button" className="btn-ghost" onClick={onToggleTheme}>
          {theme === 'dark' ? <FiSun /> : <FiMoon />}
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>

        <button type="button" className="btn-ghost" onClick={logout}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
}

export function MobileNavTrigger({ onClick }) {
  return (
    <button type="button" className="btn-ghost md:hidden" onClick={onClick} aria-label="Open navigation">
      <FiMenu />
      <span className="hidden sm:inline">Menu</span>
    </button>
  );
}

export default function Sidebar({ theme, onToggleTheme, mobile = false, onNavigate }) {
  const { user } = useAuth();
  const role = user?.role;
  if (!role && !mobile) return null;

  return (
    <aside
      className={
        mobile
          ? 'flex h-full w-full flex-col bg-[rgb(var(--panel))] p-4'
          : 'hidden w-72 flex-col border-r border-[rgb(var(--line))] bg-[rgb(var(--panel))]/92 p-4 backdrop-blur md:flex'
      }
    >
      <SidebarBody role={role} theme={theme} onToggleTheme={onToggleTheme} onNavigate={onNavigate} />
    </aside>
  );
}
