import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';

const Login = () => {
  const { login, error, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  // Mock accounts for quick login testing
  const mockAccounts = [
    { name: 'Admin Account', email: 'admin@inzozi.com', pass: 'admin123', role: 'admin', color: 'from-red-500 to-rose-600' },
    { name: 'Benit (Developer)', email: 'dev@inzozi.com', pass: 'dev123', role: 'developer', color: 'from-blue-500 to-indigo-600' },
    { name: 'Project Manager', email: 'manager@inzozi.com', pass: 'manager123', role: 'manager', color: 'from-emerald-500 to-teal-600' },
    { name: 'Content Controller', email: 'content@inzozi.com', pass: 'content123', role: 'content_controller', color: 'from-violet-500 to-purple-600' },
    { name: 'Support Agent', email: 'support@inzozi.com', pass: 'support123', role: 'support', color: 'from-amber-500 to-orange-600' },
    { name: 'Growth Marketer', email: 'marketer@inzozi.com', pass: 'marketer123', role: 'marketer', color: 'from-pink-500 to-fuchsia-600' }
  ];

  const handleQuickLogin = async (acc) => {
    setLoading(true);
    setEmail(acc.email);
    setPassword(acc.pass);
    await login(acc.email, acc.pass);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans relative overflow-hidden">
      {/* Decorative gradient glowing circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl grid md:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left column: Welcome Info */}
        <div className="md:col-span-6 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Central control plane
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            INZOZI Group <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">MIS Portal</span>
          </h1>
          <p className="text-slate-400 max-w-md leading-relaxed text-sm md:text-base">
            Configure, manage, and scale the company's product portfolio. Monitor active tasks, developer milestones, and administrative controls in one secure, role-based dashboard.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl font-bold text-purple-400">4</div>
              <div className="text-xs text-slate-500 uppercase font-semibold">Active Products</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl font-bold text-blue-400">6</div>
              <div className="text-xs text-slate-500 uppercase font-semibold">RBAC Roles</div>
            </div>
          </div>
        </div>

        {/* Right column: Login Card & Quick Logins */}
        <div className="md:col-span-6 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">Access Dashboard</h2>
              <p className="text-slate-400 text-xs">Enter your workspace credentials to continue</p>
            </div>

            {error && (
              <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@inzozi.com"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all shadow-lg hover:shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Secure Sign In
                  </>
                )}
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800" />
              <span className="flex-shrink mx-4 text-slate-600 text-xs uppercase font-bold tracking-wider">Quick Sign-In Previews</span>
              <div className="flex-grow border-t border-slate-800" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {mockAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  className="px-3 py-2 bg-slate-950/40 hover:bg-slate-950 border border-slate-800/80 rounded-lg text-left text-xs transition-all flex flex-col justify-between hover:border-slate-700/80 active:scale-[0.98] cursor-pointer group"
                >
                  <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">{acc.name}</span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    Role: {acc.role.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
