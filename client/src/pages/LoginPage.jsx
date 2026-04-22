import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock, FiMail, FiMoon, FiRadio, FiSun } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    setDarkMode((value) => !value);
    document.documentElement.classList.toggle('dark');
  };

  async function onSubmit(e) {
    e.preventDefault();
    await login({ email, password });
    const to = location.state?.from?.pathname || '/dashboard';
    navigate(to, { replace: true });
  }

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[rgb(var(--bg))] text-[rgb(var(--ink))] lg:grid-cols-[0.92fr_1.08fr]">
      <button
        onClick={toggleDarkMode}
        className="btn-ghost absolute right-4 top-4 z-20"
        aria-label="Toggle theme"
        type="button"
      >
        {darkMode ? <FiSun /> : <FiMoon />}
        <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
      </button>

      <section className="relative hidden min-h-screen overflow-hidden bg-[rgb(var(--panel-strong))] p-8 text-[rgb(var(--bg))] lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:34px_34px]" />
        <div className="relative">
          <div className="ops-chip bg-white/10 text-white">
            <FiRadio />
            secured channel
          </div>
          <h1 className="mt-8 max-w-xl text-6xl font-black leading-none">
            Sign in to the live response console.
          </h1>
        </div>

        <div className="relative grid gap-3">
          {['Incident reports', 'Resource dispatch', 'Volunteer status'].map((item, index) => (
            <div key={item} className="grid grid-cols-[52px_1fr] items-center rounded-lg border border-white/12 bg-white/8 p-4">
              <span className="ops-mono text-2xl font-bold text-[rgb(var(--flare))]">0{index + 1}</span>
              <span className="text-lg font-bold">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[rgb(var(--signal))] text-white">
              <FiRadio />
            </span>
            <span>
              <span className="block text-sm font-black uppercase">Rescue Grid</span>
              <span className="ops-mono block text-xs text-[rgb(var(--muted))]">Local disaster coordination</span>
            </span>
          </Link>

          <div className="card p-6 sm:p-8">
            <div>
              <p className="ops-mono text-xs font-bold uppercase text-[rgb(var(--signal))]">operator access</p>
              <h2 className="mt-2 text-4xl font-black">Welcome back</h2>
              <p className="mt-2 text-sm leading-6 text-[rgb(var(--muted))]">
                Use your role-based account to continue coordinating alerts, requests, and field updates.
              </p>
            </div>

            <form className="mt-7 space-y-5" onSubmit={onSubmit}>
              <div>
                <label className="label" htmlFor="login-email">Email address</label>
                <div className="relative mt-1">
                  <FiMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))]" />
                  <input
                    id="login-email"
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
                <div className="flex items-center justify-between">
                  <label className="label" htmlFor="login-password">Password</label>
                </div>
                <div className="relative mt-1">
                  <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))]" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input pl-10 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))] transition hover:text-[rgb(var(--ink))]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? (
                  <>
                    <Spinner />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[rgb(var(--muted))]">
              New to the network?{' '}
              <Link to="/register" className="font-bold text-[rgb(var(--signal))] hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
