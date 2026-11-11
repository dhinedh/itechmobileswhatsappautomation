import React, { useState } from 'react';
import logoImg from '../assets/logo.png';

export const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: 'iTechnic@2026#'
};

function LoginPage({ onLoginSuccess, apiUrl = '' }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQuickFill = () => {
    setUsername(DEFAULT_CREDENTIALS.username);
    setPassword(DEFAULT_CREDENTIALS.password);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both User ID and Password.');
      return;
    }

    setLoading(true);
    setError(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Check offline/local credentials first for instant login
    const validUsers = ['admin', 'itechadmin', 'admin@itechnic.com', '9361863063'];
    const validPasswords = ['iTechnic@2026#', 'admin123', 'itech2026'];

    try {
      let loginSuccess = false;
      let userData = {
        username: cleanUser === '9361863063' ? 'admin' : cleanUser,
        name: 'iTechnic Administrator',
        email: 'admin@itechnic.com',
        role: 'Super Admin',
        store: 'TV Malai Road, Tirukannur, Pondicherry',
        hotline: '+91 9361863063',
        loginTime: new Date().toISOString()
      };

      // Try backend authentication
      try {
        const baseUrl = apiUrl || '';
        const res = await fetch(`${baseUrl}/crm/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-requested-from': 'internal-dashboard'
          },
          body: JSON.stringify({ username: cleanUser, password: cleanPass })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            loginSuccess = true;
            if (data.user) userData = { ...userData, ...data.user };
            if (data.token) {
              if (rememberMe) localStorage.setItem('itech_auth_token', data.token);
              else sessionStorage.setItem('itech_auth_token', data.token);
            }
          }
        }
      } catch (netErr) {
        console.warn('Backend login endpoint offline/buffering, evaluating locally:', netErr.message);
      }

      // Local fallback verification
      if (!loginSuccess) {
        if (validUsers.includes(cleanUser) && validPasswords.includes(cleanPass)) {
          loginSuccess = true;
          const localToken = 'itech_local_token_' + btoa(`${cleanUser}:${Date.now()}`);
          if (rememberMe) localStorage.setItem('itech_auth_token', localToken);
          else sessionStorage.setItem('itech_auth_token', localToken);
        }
      }

      if (loginSuccess) {
        if (rememberMe) {
          localStorage.setItem('itech_auth_user', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('itech_auth_user', JSON.stringify(userData));
        }
        onLoginSuccess(userData);
      } else {
        setError('Invalid User ID or Password. Please verify and try again.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 z-10 flex flex-col transition-all">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3">
            <img 
              src={logoImg} 
              alt="iTechnic Mobiles" 
              className="w-20 h-20 rounded-2xl bg-white object-contain p-2 shadow-lg border-2 border-emerald-400"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-xs">
              <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            iTechnic Mobiles
          </h1>
          <p className="text-xs font-semibold text-teal-800 uppercase tracking-widest mt-0.5">
            WhatsApp Business Admin Portal
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to manage CRM chats, orders & store automation
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in zoom-in-95 duration-150">
            <span className="text-base leading-none">⚠️</span>
            <div className="flex-1 font-medium leading-relaxed">
              {error}
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-600 font-bold ml-1 text-sm leading-none"
            >
              ✕
            </button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* User ID Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              User ID / Username
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400 text-sm">👤</span>
              <input 
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or admin@itechnic.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 transition-colors"
              >
                {showPassword ? 'Hide Password' : 'Show Password'}
              </button>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400 text-sm">🔒</span>
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all font-medium"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors text-xs"
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Remember Me & Quick Fill */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none font-medium">
              <input 
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 transition-colors cursor-pointer"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/80 px-2.5 py-1 rounded-lg border border-teal-200/60 transition-all flex items-center gap-1"
              title="Click to auto-populate default administrative credentials"
            >
              <span>⚡</span> Auto-fill
            </button>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 group"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </>
            )}
          </button>
        </form>

        {/* Credentials Info Badge */}
        <div 
          onClick={handleQuickFill}
          className="mt-6 p-3.5 bg-slate-50 hover:bg-teal-50/50 rounded-2xl border border-slate-200 hover:border-teal-300 transition-all cursor-pointer group"
          title="Click to fill into login form"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
            <span className="flex items-center gap-1 text-teal-800">
              <span>🔑</span> Admin Login Credentials
            </span>
            <span className="text-[10px] text-teal-600 group-hover:underline">Click to Fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-white p-2 rounded-lg border border-slate-200/80">
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">User ID</span>
              <strong className="text-slate-800 font-bold">admin</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Password</span>
              <strong className="text-slate-800 font-bold">iTechnic@2026#</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Details */}
      <div className="mt-6 text-center text-xs text-slate-400 z-10 max-w-md">
        <p className="font-medium text-slate-300">iTechnic Mobiles · Operations Control & WhatsApp Bot</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          TV Malai Road, Tirukannur, Pondicherry - 605501 · Meta Verified ID: 1758570912097342
        </p>
      </div>

    </div>
  );
}

export default LoginPage;
