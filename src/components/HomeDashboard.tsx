/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, DeviceFreeSchedule, OfflineActivity } from '../types';
import { API } from '../api';
import { Clock, ShieldCheck, Zap, Award, Flame, Activity, ArrowRight, Hourglass, Smartphone, Sparkles, AlertCircle } from 'lucide-react';

interface HomeDashboardProps {
  currentUser: User;
  onNavigate: (tabId: string) => void;
  onRefreshUser: () => void;
  activeSessionSeconds?: number;
  onForceSync: () => void;
}

export default function HomeDashboard({ 
  currentUser, 
  onNavigate, 
  onRefreshUser, 
  activeSessionSeconds = 0, 
  onForceSync 
}: HomeDashboardProps) {
  const [upcomingSchedule, setUpcomingSchedule] = useState<DeviceFreeSchedule | null>(null);
  const [completedActivitiesCount, setCompletedActivitiesCount] = useState(0);
  const [simulating, setSimulating] = useState(false);
  const [simCategory, setSimCategory] = useState('education');
  const [simMinutes, setSimMinutes] = useState(15);
  const [simAppName, setSimAppName] = useState('');
  const [simFeedback, setSimFeedback] = useState('');

  useEffect(() => {
    async function loadDashboardMetrics() {
      try {
        const schRes = await API.getSchedules();
        if (schRes.schedules && schRes.schedules.length > 0) {
          // Take the first or nearest upcoming schedule
          setUpcomingSchedule(schRes.schedules[0]);
        }

        const actRes = await API.getActivitiesAndPolls();
        if (actRes.activities) {
          const completed = actRes.activities.filter(a => a.status === 'completed').length;
          setCompletedActivitiesCount(completed);
        }
      } catch (err) {
        console.error('Error loading dashboard metrics', err);
      }
    }
    loadDashboardMetrics();
  }, [currentUser]);

  // Convert minutes to readable hour + minute format
  const formatTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const minsFormatted = mins % 1 === 0 ? mins : parseFloat(mins.toFixed(1));
    if (hours === 0) return `${minsFormatted} min`;
    return `${hours} hr ${minsFormatted} min`;
  };

  const usageRatio = currentUser.usageToday / currentUser.dailyGoal;
  let statusLabel = 'On Track';
  let statusColorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let statusDotColor = 'bg-emerald-500';
  let progressColorClass = 'bg-blue-600';

  if (usageRatio >= 1.0) {
    statusLabel = 'Limit Crossed';
    statusColorClass = 'bg-red-50 text-red-700 border-red-200';
    statusDotColor = 'bg-red-500';
    progressColorClass = 'bg-red-600';
  } else if (usageRatio >= 0.75) {
    statusLabel = 'Near Limit';
    statusColorClass = 'bg-amber-50 text-amber-700 border-amber-200';
    statusDotColor = 'bg-amber-500';
    progressColorClass = 'bg-amber-500';
  }

  // Handle local simulated device use logging
  const handleSimulateUsage = async () => {
    setSimulating(true);
    setSimFeedback('');
    try {
      const res = await API.incrementUsage(currentUser.id, simMinutes, simCategory, simAppName.trim() || undefined);
      if (res.success) {
        if (res.timerExceededMessage) {
          setSimFeedback(`🚨 ${res.timerExceededMessage}`);
        } else {
          setSimFeedback(`Logged +${simMinutes} mins of ${simAppName.trim() || simCategory} successfully!`);
        }
        setSimAppName('');
        onRefreshUser();
      }
    } catch (err) {
      setSimFeedback('Failed to log simulated screen time.');
    } finally {
      setSimulating(false);
      setTimeout(() => setSimFeedback(''), 5000);
    }
  };

  // Determine Greeting based on time of day (mocking 20:24 from metadata -> Good Evening)
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div id="dashboard-hub" className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      
      {/* Top Banner Greeting - Professional Polish */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-white to-indigo-50/50 gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-100/30 rounded-full blur-3xl"></div>
        <div className="relative z-10 space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-full">
              ⚡ DIGITAL WELFARE PORTAL
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-3">
              {getGreeting()}, {currentUser.name}! 👋
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Your device configurations are active. Keep aiming for an optimal balance of online education, physical activities, and high-quality routines.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
              <span className="text-base">🔥</span>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Current Streak</span>
                <span className="text-sm font-bold text-indigo-600">{currentUser.streak} Days</span>
              </div>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
              <span className="text-base">🏆</span>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Total Points</span>
                <span className="text-sm font-bold text-purple-600">{currentUser.points} Points</span>
              </div>
            </div>
          </div>
        </div>
        <div className="relative flex flex-col items-center shrink-0 bg-white/60 p-4 rounded-2xl border border-slate-150 shadow-sm">
          <div className="w-24 h-24 rounded-full flex items-center justify-center relative">
            <svg className="w-full h-full absolute -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-600"
                strokeWidth="3.5"
                strokeDasharray={`${Math.min(usageRatio * 100, 100)}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="text-center">
              <p className="text-lg font-extrabold text-slate-800 leading-none">{(currentUser.usageToday / 60).toFixed(1)}</p>
              <p className="text-[8px] text-slate-500 uppercase font-black tracking-wider mt-0.5">Hours</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-3 border ${statusColorClass}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Real-Time Local Device Session Tracker */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 bg-gradient-to-r from-emerald-50/20 via-white to-indigo-50/10">
        <div className="space-y-2 max-w-2xl text-left">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              Real-Time Device Screen Tracker Active
            </span>
          </div>
          <h3 className="text-base font-black text-slate-800 leading-tight">Live Active Session Monitor</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            <strong className="text-slate-600">Privacy Sandbox Guideline:</strong> Standard operating systems (iOS/Android) restrict web browsers from querying external application processes (e.g., system settings or game logs) for security. To deliver a functional, live digital welfare workflow, we track your actual, focused interactive engagement on this device, syncing results automatically to your household leaderboard.
          </p>
        </div>
        
        <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end bg-slate-50 p-3 rounded-2xl border border-slate-200/50">
          <div className="space-y-0.5 text-left">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Active Device Time</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-800 font-mono">
                {String(Math.floor(activeSessionSeconds / 60)).padStart(2, '0')}:{String(activeSessionSeconds % 60).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Mins</span>
            </div>
          </div>
          
          <button
            type="button"
            id="sync-device-now-btn"
            onClick={onForceSync}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" /> Sync Time
          </button>
        </div>
      </div>

      {/* Primary Circular Progress & Usage Stat */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Screen Time Progress Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 md:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Today's Usage Metrics</h3>
              <p className="text-xs text-slate-400">Measured across all registered personal mobile & tablet apps</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${statusColorClass}`}>
              <span className={`w-2 h-2 rounded-full ${statusDotColor}`}></span>
              {statusLabel}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-sm font-semibold text-slate-500">Screen Use</span>
                <p className="text-3xl font-black text-slate-800 tracking-tight mt-1">
                  {formatTime(currentUser.usageToday)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Allotted Limit</span>
                <span className="text-sm font-bold text-slate-700 block">
                  out of {formatTime(currentUser.dailyGoal)}
                </span>
              </div>
            </div>

            {/* Progress Track */}
            <div className="w-full bg-slate-150 h-4 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${progressColorClass}`}
                style={{ width: `${Math.min(usageRatio * 100, 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 font-semibold pt-1">
              <span>0% (Empty)</span>
              <span>75% (Near Limit)</span>
              <span>100% (Limit Hit)</span>
            </div>
          </div>

          {/* Device Usage Warning Helper */}
          {usageRatio >= 1.0 && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-xs rounded-2xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Attention Required:</strong> You have reached or exceeded your configured daily limit. Secondary entertainment applications may be restricted. You can request extra screen-time from your Parent Admin or pivot to recommended offline activities!
              </p>
            </div>
          )}
        </div>

        {/* Highlight Widget Sidebar */}
        <div className="space-y-6">
          
          {/* Upcoming lock card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-500" />
              Device-Free Schedule
            </h4>
            
            {upcomingSchedule ? (
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-150 space-y-2">
                <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">{upcomingSchedule.title}</p>
                <div className="flex items-center gap-1">
                  <Hourglass className="w-4 h-4 text-purple-500 shrink-0" />
                  <span className="text-lg font-black text-slate-800">{upcomingSchedule.startTime} - {upcomingSchedule.endTime}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Upcoming block locks non-critical apps. Safe contact protocols override this limit.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl text-center text-slate-400 text-xs py-6 border border-dashed border-slate-200">
                No active schedules found.
              </div>
            )}
          </div>

          {/* Routine Status Overview Card */}
          <div className="bg-gradient-to-br from-indigo-50/40 to-blue-50/40 border border-slate-200 rounded-3xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600 border border-slate-100">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Offline Activities</span>
              <p className="text-xl font-black text-slate-800 mt-0.5">{completedActivitiesCount} Completed</p>
              <p className="text-xs text-slate-500">Contributing to group reward pool</p>
            </div>
          </div>

        </div>
      </div>

      {/* Quick Access Shortcuts */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider block">Quick Action Shortcuts</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            type="button"
            id="qa-view-family"
            onClick={() => onNavigate('Family')}
            className="p-4 bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200 text-left shadow-sm hover:shadow transition-all group flex flex-col justify-between h-28 cursor-pointer"
          >
            <span className="text-2xl">👨‍👩‍👧‍👦</span>
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">View Family</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform group-hover:text-indigo-600" />
            </div>
          </button>

          <button
            type="button"
            id="qa-add-activity"
            onClick={() => onNavigate('Activities')}
            className="p-4 bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200 text-left shadow-sm hover:shadow transition-all group flex flex-col justify-between h-28 cursor-pointer"
          >
            <span className="text-2xl">🚴</span>
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Add Activity</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform group-hover:text-indigo-600" />
            </div>
          </button>

          <button
            type="button"
            id="qa-request-time"
            onClick={() => onNavigate('Requests')}
            className="p-4 bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200 text-left shadow-sm hover:shadow transition-all group flex flex-col justify-between h-28 cursor-pointer"
          >
            <span className="text-2xl">⏳</span>
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Request Time</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform group-hover:text-indigo-600" />
            </div>
          </button>

          <button
            type="button"
            id="qa-view-report"
            onClick={() => onNavigate('Usage')}
            className="p-4 bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200 text-left shadow-sm hover:shadow transition-all group flex flex-col justify-between h-28 cursor-pointer"
          >
            <span className="text-2xl">📈</span>
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">View Report</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform group-hover:text-indigo-600" />
            </div>
          </button>
        </div>
      </div>

      {/* Interactive Device Simulation Sandbox (Highly Interactive Presentation Helper!) */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-500" />
              Live Device Simulator Sandbox
            </h3>
            <p className="text-xs text-slate-500">Simulate background device use or educational app activity to check how gauges update instantly!</p>
          </div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
            Developer Sandbox
          </span>
        </div>

        <div className="grid sm:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">Category to Log</label>
            <select
              value={simCategory}
              onChange={(e) => setSimCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white h-[38px]"
            >
              <option value="education">📚 Education</option>
              <option value="socialMedia">📱 Social Media</option>
              <option value="gaming">🎮 Gaming</option>
              <option value="entertainment">🍿 Entertainment</option>
              <option value="communication">💬 Communication</option>
              <option value="productivity">🚀 Productivity</option>
              <option value="other">⚙️ Other</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">App Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Roblox, YouTube"
              value={simAppName}
              onChange={(e) => setSimAppName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white h-[38px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">Duration to Add</label>
            <select
              value={simMinutes}
              onChange={(e) => setSimMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white h-[38px]"
            >
              <option value={10}>10 Minutes</option>
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>1 Hour</option>
            </select>
          </div>

          <button
            type="button"
            id="simulate-device-use-btn"
            disabled={simulating}
            onClick={handleSimulateUsage}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer h-[38px]"
          >
            {simulating ? (
              'Transmitting...'
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Log Simulated Usage
              </>
            )}
          </button>
        </div>

        {simFeedback && (
          <div className="mt-3 p-2 text-center text-xs bg-green-100 text-green-800 border border-green-200 rounded-xl font-bold animate-pulse">
            {simFeedback}
          </div>
        )}
      </div>

    </div>
  );
}
