import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // 👈 Use the Router hooks directly
import { 
  BookOpen, 
  FileText, 
  Award, 
  ArrowRight, 
  DownloadCloud, 
  Users, 
  Eye,
  GraduationCap
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-amber-200">
      
      {/* 1. GLOBAL HEADER / NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <Link to="/" className="flex items-center space-x-2 cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Academa<span className="text-amber-500">.</span>
              </span>
            </Link>

            {/* Auth Actions */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/login"
                className="text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Sign In
              </Link>
              <Link 
                to="/register"
                className="flex items-center space-x-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-emerald-700/30 active:scale-95 transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      
      {/* 2. THE HERO BLOCK */}
      <header className="relative overflow-hidden pt-6 pb-16 md:pt-10 md:pb-20 lg:pt-12 lg:pb-28">
        {/* Soft Decorative Ambient Background Blobs */}
        <div className="absolute top-0 left-1/4 -z-10 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 -z-10 h-96 w-96 rounded-full bg-amber-100/40 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
            
            {/* Left Column: Copy & Actions */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">
                ✨ Your All-In-One Revision Hub
              </span>
              
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:leading-[1.15]">
                Master Your Studies.<br />
                Access Your Materials.<br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Anytime, Anywhere.
                </span>
              </h1>
              
              <p className="mx-auto lg:mx-0 max-w-xl text-lg text-slate-600 leading-relaxed">
                Welcome to your school's centralized material bank. Seamlessly access comprehensive 
                class notes, tackle targeted past papers, and review study guides uploaded directly 
                by your teachers.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                {/* Send users to /explore, ProtectedRoute handles authentication guards safely */}
                <button 
                  onClick={() => navigate('/explore')}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl bg-slate-900 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800 hover:shadow-xl transition-all active:scale-98"
                >
                  <span>Explore Materials</span>
                  <ArrowRight className="h-5 w-5 text-amber-400" />
                </button>
                
                {/* Teachers use the same unified login form */}
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
                >
                  <span>Teacher Portal</span>
                </button>
              </div>
            </div>

            {/* Right Column: Visual UI Mockup Teaser */}
            <div className="lg:col-span-5 relative mt-12 lg:mt-0">
              <div className="relative mx-auto max-w-[450px] lg:max-w-none rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200/80">
                {/* Mock Window Top Bar */}
                <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-3 mb-4">
                  <div className="h-3 w-3 rounded-full bg-slate-200" />
                  <div className="h-3 w-3 rounded-full bg-slate-200" />
                  <div className="h-3 w-3 rounded-full bg-slate-200" />
                  <span className="text-xs text-slate-400 pl-2 font-medium">Dashboard Preview</span>
                </div>
                
                {/* Mock Resource Feed Layout */}
                <div className="space-y-3">
                  <div className="rounded-xl bg-slate-50 p-3 flex items-center justify-between border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><BookOpen className="h-5 w-5" /></div>
                      <div>
                        <div className="h-3.5 w-32 rounded bg-slate-300 mb-1.5" />
                        <div className="h-2.5 w-20 rounded bg-slate-200" />
                      </div>
                    </div>
                    <div className="h-6 w-16 rounded-full bg-emerald-100/70 text-[10px] font-bold text-emerald-800 flex items-center justify-center">NOTE</div>
                  </div>
                  
                  <div className="rounded-xl bg-slate-50 p-3 flex items-center justify-between border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><FileText className="h-5 w-5" /></div>
                      <div>
                        <div className="h-3.5 w-40 rounded bg-slate-300 mb-1.5" />
                        <div className="h-2.5 w-24 rounded bg-slate-200" />
                      </div>
                    </div>
                    <div className="h-6 w-16 rounded-full bg-amber-100/70 text-[10px] font-bold text-amber-800 flex items-center justify-center">PAST PAPER</div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 flex items-center justify-between border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Award className="h-5 w-5" /></div>
                      <div>
                        <div className="h-3.5 w-28 rounded bg-slate-300 mb-1.5" />
                        <div className="h-2.5 w-16 rounded bg-slate-200" />
                      </div>
                    </div>
                    <div className="h-6 w-16 rounded-full bg-blue-100/70 text-[10px] font-bold text-blue-800 flex items-center justify-center">REVISION</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* 3. LIVE STATS COUNTER RIBBON */}
      <section className="border-y border-slate-200 bg-white py-10 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
            
            {/* Stat Item 1 */}
            <div className="flex flex-col items-center space-y-2">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">1,250+</span>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Verified Materials</span>
            </div>

            {/* Stat Item 2 */}
            <div className="flex flex-col items-center space-y-2 border-slate-200 sm:border-x">
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <Users className="h-6 w-6" />
              </div>
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">450+</span>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Learners</span>
            </div>

            {/* Stat Item 3 */}
            <div className="flex flex-col items-center space-y-2">
              <div className="rounded-xl bg-teal-50 p-2.5 text-teal-600">
                <DownloadCloud className="h-6 w-6" />
              </div>
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">8,900+</span>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Successful Downloads</span>
            </div>

          </div>
        </div>
      </section>

      {/* 4. THE FEATURE GRID */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything You Need to Excel
            </h2>
            <p className="text-base text-slate-600">
              No more searching through disorganized chat groups or lost flash drives. Access structured materials matching your current class curriculum instantly.
            </p>
          </div>

          {/* Grid Container */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Card 1: NOTE */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300">
              <div className="mb-4 inline-block rounded-xl bg-emerald-50 p-3 text-emerald-600 group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Notes</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Comprehensive summary notes prepared by your subject teachers, optimized for crisp screen reading and review.
              </p>
            </div>

            {/* Card 2: PAST_PAPER */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-300">
              <div className="mb-4 inline-block rounded-xl bg-amber-50 p-3 text-amber-600 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Past Papers</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                An extensive database of previous term tests and national mock examinations complete with structured review guides.
              </p>
            </div>

            {/* Card 3: REVISION_QUESTION */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300">
              <div className="mb-4 inline-block rounded-xl bg-blue-50 p-3 text-blue-600 group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Revision Banks</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Targeted question frameworks and topical quizzes engineered to test key knowledge parameters before major assessments.
              </p>
            </div>

            {/* Card 4: ASSIGNMENT */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-300">
              <div className="mb-4 inline-block rounded-xl bg-teal-50 p-3 text-teal-600 group-hover:scale-110 transition-transform">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Class Tasks</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Download digital assignment briefs, supplementary reference criteria, and context sheets anytime you need them.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}