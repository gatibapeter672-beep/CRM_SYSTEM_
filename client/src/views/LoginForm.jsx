import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { GraduationCap, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import useAuth from '../hooks/useAuth';

export default function LoginForm() {
  const navigate = useNavigate(); 
  const { login } = useAuth(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const loginPayload = { 
      email: email.toLowerCase().trim(), 
      password 
    };
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginPayload),
      });

      const data = await response.json();
      console.log("🚀 AUTH RESPONSE DATA:", data);

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password combination.');
      }

      // 🚀 1. Process and save the user to the shared authentication state
      login(data.user);
      console.log("LOGIN USER:", data.user);

      // 🚀 2. Send the user to the base dashboard path. 
      // The DashboardDispatcher will automatically pick up the role and sort them into the right split deck!
      navigate('/dashboard', { replace: true });
          
    } catch (err) {
      console.error("Authentication Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* LEFT COLUMN: Branding Side */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-emerald-800 to-teal-950 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_50%)]" />
        
        <Link to="/" className="flex items-center space-x-2 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-amber-400">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">Academa.</span>
        </Link>

        <div className="space-y-4 relative z-10">
          <h2 className="text-3xl font-extrabold leading-tight">Welcome Back to Your Knowledge Hub.</h2>
          <p className="text-emerald-100/80 leading-relaxed text-sm">
            Log in to pick up right where you left off. Access fresh class notes, view assignments, and download updated revision materials instantly.
          </p>
        </div>

        <p className="text-xs text-emerald-200/50 relative z-10">© 2026 Academa School System. Secure Portal.</p>
      </div>

      {/* RIGHT COLUMN: Interactive Login Form */}
      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-8 sm:p-12 md:p-16 bg-slate-50/50">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-100/50">
          
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to Academa</h1>
            <p className="text-sm text-slate-500">
              New to the platform?{' '}
              <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">
                Create an account
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200/60 p-3 text-xs font-semibold text-red-600 animate-fade-in">
                ⚠️ {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-800"
                  placeholder="name@school.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">Password</label>
                <a href="#forgot" className="text-xs font-medium text-emerald-600 hover:underline">Forgot password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-800"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/10 hover:bg-emerald-700 hover:shadow-emerald-700/20 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              <span>{loading ? 'Verifying Credentials...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="h-4 w-4 text-amber-400" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}