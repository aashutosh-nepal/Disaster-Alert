import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiArrowRight,
  FiBriefcase,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiMoon,
  FiRadio,
  FiSun,
  FiUser,
} from 'react-icons/fi';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';

const roles = ['Citizen', 'Volunteer'];

const roleCopy = {
  Citizen: 'Report incidents, request support, and track updates from one place.',
  Volunteer: 'Find nearby requests, accept response work, and keep statuses current.',
};

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Citizen');
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    setDarkMode((current) => !current);
    document.documentElement.classList.toggle('dark');
  };

  async function onSubmit(e) {
    e.preventDefault();
    await register({ name, email, password, role });
    navigate('/dashboard');
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[rgb(var(--bg))] px-4 py-8 text-[rgb(var(--ink))] sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={toggleDarkMode}
        className="btn-ghost absolute right-4 top-4 z-20"
        aria-label="Toggle theme"
      >
        {darkMode ? <FiSun /> : <FiMoon />}
        <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
      </button>

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative overflow-hidden rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] p-6 text-[rgb(var(--bg))] shadow-2xl lg:min-h-[680px] lg:p-8">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:30px_30px]" />
          <div className="relative flex h-full flex-col justify-between gap-12">
            <div>
              <Link to="/" className="inline-flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[rgb(var(--signal))] text-white">
                  <FiRadio />
                </span>
                <span className="font-black uppercase">Rescue Grid</span>
              </Link>
              <h1 className="mt-10 text-5xl font-black leading-none sm:text-6xl">
                Join the response network.
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-white/68">
                Create the correct role for your work on the ground. Administrative access is managed separately to keep the platform secure.
              </p>
            </div>

            <div className="space-y-3">
              {roles.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRole(item)}
                  className={[
                    'w-full rounded-lg border p-4 text-left transition',
                    role === item
                      ? 'border-[rgb(var(--flare))] bg-[rgb(var(--flare))]/18'
                      : 'border-white/12 bg-white/8 hover:bg-white/12',
                  ].join(' ')}
                >
                  <span className="ops-mono text-xs font-bold uppercase text-[rgb(var(--flare))]">{item}</span>
                  <span className="mt-1 block text-sm leading-6 text-white/70">{roleCopy[item]}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="card p-5 sm:p-8">
          <p className="ops-mono text-xs font-bold uppercase text-[rgb(var(--signal))]">new operator</p>
          <h2 className="mt-2 text-4xl font-black">Create your account</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[rgb(var(--muted))]">
            Register as a citizen or volunteer and start using the active response console.
          </p>

          <form className="mt-7 grid gap-5" onSubmit={onSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="register-name" className="label">Full name</label>
                <div className="relative mt-1">
                  <FiUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))]" />
                  <input
                    id="register-name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-role" className="label">Account role</label>
                <div className="relative mt-1">
                  <FiBriefcase className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))]" />
                  <select
                    id="register-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="input appearance-none pl-10"
                  >
                    {roles.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="register-email" className="label">Email address</label>
              <div className="relative mt-1">
                <FiMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))]" />
                <input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-password" className="label">Password</label>
              <div className="relative mt-1">
                <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))]" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  className="input pl-10 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))] transition hover:text-[rgb(var(--ink))]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--field))] p-4">
              <div className="ops-mono text-xs font-bold uppercase text-[rgb(var(--signal))]">{role} mode</div>
              <p className="mt-1 text-sm leading-6 text-[rgb(var(--muted))]">{roleCopy[role]}</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <>
                  <Spinner />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create account</span>
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[rgb(var(--muted))]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[rgb(var(--signal))] hover:underline">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
