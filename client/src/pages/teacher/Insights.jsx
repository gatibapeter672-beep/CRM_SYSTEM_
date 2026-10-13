import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  AlertTriangle, 
  Award, 
  Eye, 
  Download,
  ArrowRight
} from 'lucide-react';

export default function Insights() {
  const insightsData = {
    efficiencyIndex: {
      monthlyGrowth: "+12.4%",
      peakHours: "Tuesdays, 4 PM - 7 PM",
      activeRate: "89%"
    },
    topAssets: [
      { id: 1, title: "Calculus_Ch3_Notes.pdf", class: "Class 10A", views: 124, downloads: 95 },
      { id: 2, title: "2026_Math_Mock_Solutions.pdf", class: "Class 10A", views: 84, downloads: 72 }
    ],
    lowEngagement: [
      { id: 3, title: "Physics_Lab_Safety_v2.pdf", class: "Class 11B", metric: "8% student reach" },
      { id: 4, title: "Trig_Formulas_Sheet.pdf", class: "Class 10A", metric: "14% student reach" }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-100">Academic Engagement Insights</h1>
        <p className="text-xs text-zinc-500">Deep-dive metrics evaluating curriculum performance and cohort material consumption loops.</p>
      </div>

      {/* GLOBAL EFFICIENCY BAR */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-5">
          <BarChart3 className="w-32 h-32 text-zinc-100" />
        </div>
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block mb-1">Monthly Growth Rate</span>
          <div className="text-xl font-bold text-emerald-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            <span>{insightsData.efficiencyIndex.monthlyGrowth}</span>
          </div>
        </div>
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block mb-1">Peak Activity Window</span>
          <div className="text-xl font-bold text-zinc-200 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-sm sm:text-base font-sans font-medium">{insightsData.efficiencyIndex.peakHours}</span>
          </div>
        </div>
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block mb-1">Active Participation Rate</span>
          <div className="text-xl font-bold text-sky-400 font-mono">
            {insightsData.efficiencyIndex.activeRate}
          </div>
        </div>
      </div>

      {/* TWIN METRIC SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TOP PERFORMERS */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-zinc-200">Top Performing Curriculum Assets</h3>
            </div>
            <div className="space-y-3">
              {insightsData.topAssets.map(asset => (
                <div key={asset.id} className="bg-zinc-950/40 border border-zinc-800/60 rounded-xl p-3.5 flex justify-between items-center">
                  <div className="space-y-1 truncate max-w-[65%]">
                    <span className="text-xs font-mono font-bold text-zinc-200 block truncate">"{asset.title}"</span>
                    <span className="text-[10px] text-zinc-500 font-medium">{asset.class}</span>
                  </div>
                  <div className="flex gap-3 text-[11px] font-mono shrink-0">
                    <span className="flex items-center gap-1 text-zinc-400"><Eye className="w-3 h-3 text-zinc-600" />{asset.views}</span>
                    <span className="flex items-center gap-1 text-zinc-400"><Download className="w-3 h-3 text-zinc-600" />{asset.downloads}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ATTENTION TARGET ALERTS */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Low Engagement Review Items</h3>
          </div>
          <div className="space-y-3">
            {insightsData.lowEngagement.map(asset => (
              <div key={asset.id} className="bg-zinc-950/40 border border-zinc-800/40 rounded-xl p-3.5 flex justify-between items-center group hover:border-red-900/30 transition-colors">
                <div className="space-y-0.5 truncate max-w-[70%]">
                  <span className="text-xs font-mono font-medium text-zinc-400 block truncate group-hover:text-zinc-300 transition-colors">"{asset.title}"</span>
                  <span className="text-[10px] text-zinc-500 font-medium">{asset.class}</span>
                </div>
                <span className="text-[10px] font-mono text-red-400 font-bold bg-red-950/20 border border-red-900/20 px-2 py-0.5 rounded shrink-0">
                  {asset.metric}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}