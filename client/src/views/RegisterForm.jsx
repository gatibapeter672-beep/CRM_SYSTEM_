import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // 🚀 Swapped manual onNavigate for standard Hooks
import { User, Mail, Lock, ArrowLeft, BookOpen, Presentation, AlertCircle, Loader2 } from 'lucide-react';

export default function RegisterForm() {
  const navigate = useNavigate(); // 🚀 Handles routing instantly upon success
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('student'); // 'student' or 'teacher'
  
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError(null);
    setSuccessMessage(null);
    
    // Constructing exact payload mapped to your Marshmallow schema matching parameters
    const registrationPayload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role_id: selectedRole === 'student' ? 3 : 2 // Ensure these match your database Role model IDs
    };

    try {
      // 🚀 Pointed directly to your API prefix proxy structure
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationPayload),
      });

      const data = await response.json();
      console.log("🚨 REGISTRATION ERROR DATA:", data);

      if (!response.ok) {
        // Parse nested Marshmallow error schemas if validation fails
        if (data.errors && typeof data.errors === 'object') {
          const errorMsgs = Object.entries(data.errors)
            .map(([field, msg]) => `${field.replace('_', ' ')}: ${msg}`)
            .join(' | ');
          throw new Error(errorMsgs);
        }
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      setSuccessMessage("Account created successfully! Redirecting to login...");
      
      // Clear states
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');

      // Take them to the login screen after a clean confirmation break
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      
      {/* LEFT COLUMN: Clean Informative Panel */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-slate-900 to-emerald-950 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.1),transparent_40%)]" />
        
        <Link to="/" className="flex items-center space-x-2 text-sm text-emerald-300 hover:text-emerald-100 transition-colors group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md">Join Academa</span>
          <h2 className="text-3xl font-extrabold leading-tight">Elevate Your School Performance Today.</h2>
          <p className="text-slate-300 leading-relaxed text-sm">
            Gain immediate structural access to curriculum revision targets, papers, files, and tags organized seamlessly for execution.
          </p>
        </div>

        <p className="text-xs text-slate-500">© 2026 Academa Inc. Education Delivery Framework.</p>
      </div>

      {/* RIGHT COLUMN: Register Input Framework */}
      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-6 sm:p-12 bg-slate-50/50 overflow-y-auto">
        <div className="w-full max-w-xl space-y-6 bg-white p-8 rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-100/50 my-8">
          
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* SERVER DYNAMIC NOTIFICATION STATES */}
          {serverError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl flex items-start space-x-2.5 animate-in fade-in-50 duration-200">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div><span className="font-bold">Registration Alert:</span> {serverError}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-start space-x-2.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping mt-2 mr-2" />
              <div>{successMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 1. ROLE SELECTION CARDS */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">I am joining as a:</label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => !isLoading && setSelectedRole('student')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center space-x-3 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''} ${selectedRole === 'student' ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'}`}
                >
                  <div className={`p-2 rounded-lg ${selectedRole === 'student' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}><BookOpen className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm font-bold">Student</p>
                    <p className="text-[11px] opacity-80">Access notes & papers</p>
                  </div>
                </div>

                <div 
                  onClick={() => !isLoading && setSelectedRole('teacher')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center space-x-3 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''} ${selectedRole === 'teacher' ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'}`}
                >
                  <div className={`p-2 rounded-lg ${selectedRole === 'teacher' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}><Presentation className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm font-bold">Teacher</p>
                    <p className="text-[11px] opacity-80">Upload & manage material</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. NAMES ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">First Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><User className="h-4 w-4" /></span>
                  <input type="text" required disabled={isLoading} value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all disabled:opacity-60" placeholder="John" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Last Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><User className="h-4 w-4" /></span>
                  <input type="text" required disabled={isLoading} value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all disabled:opacity-60" placeholder="Doe" />
                </div>
              </div>
            </div>

            {/* 3. EMAIL ADDRESS */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><Mail className="h-4 w-4" /></span>
                <input type="email" required disabled={isLoading} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all disabled:opacity-60" placeholder="johndoe@school.com" />
              </div>
            </div>

            {/* 4. PASSWORD */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><Lock className="h-4 w-4" /></span>
                <input type="password" required disabled={isLoading} minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all disabled:opacity-60" placeholder="Minimum 8 characters" />
              </div>
            </div>

            {/* REGISTER SUBMIT */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/10 hover:bg-emerald-700 hover:shadow-lg transition-all active:scale-98 mt-4 disabled:bg-emerald-600/70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing Setup...</span>
                </>
              ) : (
                <span>Complete Registration</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}