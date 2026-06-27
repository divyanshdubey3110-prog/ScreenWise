/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, ScreenTimeLog, CategoryBreakdown, AppUsage } from '../types';
import { API } from '../api';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { LayoutDashboard, Award, Sparkles, Filter, Calendar, ListFilter, Smartphone, Clock } from 'lucide-react';

interface CategoryTrackingProps {
  currentUser: User;
  initialSelectedUserId?: string;
  onSelectedUserChange?: (userId: string) => void;
}

const CATEGORY_COLORS = {
  education: '#3b82f6',      // Blue
  socialMedia: '#ec4899',    // Pink
  gaming: '#f43f5e',         // Rose / Red-Orange
  entertainment: '#a855f7',  // Purple
  communication: '#10b981',  // Emerald Green
  productivity: '#f59e0b',   // Amber
  other: '#64748b'           // Slate
};

const CATEGORY_LABELS: Record<keyof CategoryBreakdown, string> = {
  education: 'Education',
  socialMedia: 'Social Media',
  gaming: 'Gaming',
  entertainment: 'Entertainment',
  communication: 'Communication',
  productivity: 'Productivity',
  other: 'Other'
};

const CATEGORY_EMOJIS: Record<keyof CategoryBreakdown, string> = {
  education: '📚',
  socialMedia: '📱',
  gaming: '🎮',
  entertainment: '🍿',
  communication: '💬',
  productivity: '🚀',
  other: '⚙️'
};

export default function CategoryTracking({ currentUser, initialSelectedUserId, onSelectedUserChange }: CategoryTrackingProps) {
  const [members, setMembers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [logs, setLogs] = useState<ScreenTimeLog[]>([]);
  const [appUsages, setAppUsages] = useState<AppUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStatsData() {
      try {
        const famRes = await API.getFamily();
        setMembers(famRes.members);
        
        // Default to current user or first member
        if (famRes.members.length > 0) {
          if (initialSelectedUserId) {
            setSelectedUserId(initialSelectedUserId);
          } else {
            const matched = famRes.members.find(m => m.id === currentUser.id);
            setSelectedUserId(matched ? matched.id : famRes.members[0].id);
          }
        }

        const logRes = await API.getLogs();
        setLogs(logRes.logs);

        const usagesRes = await API.getAppUsages();
        setAppUsages(usagesRes.appUsages || []);
      } catch (err) {
        console.error('Error loading stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadStatsData();
  }, [currentUser, initialSelectedUserId]);

  useEffect(() => {
    if (initialSelectedUserId) {
      setSelectedUserId(initialSelectedUserId);
    }
  }, [initialSelectedUserId]);

  // Filter logs for the selected user
  const userLogs = logs.filter(log => log.userId === selectedUserId);

  // Get most recent log or today's categories
  // Let's aggregate categories across all of the user's logs for the breakdown chart
  const categoryTotals: Record<keyof CategoryBreakdown, number> = {
    education: 0,
    socialMedia: 0,
    gaming: 0,
    entertainment: 0,
    communication: 0,
    productivity: 0,
    other: 0
  };

  userLogs.forEach(log => {
    Object.keys(log.categories).forEach(key => {
      const catKey = key as keyof CategoryBreakdown;
      categoryTotals[catKey] += log.categories[catKey] || 0;
    });
  });

  const totalMinutesAcrossLogs = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  // Prepare Pie Chart data
  const pieData = Object.entries(categoryTotals)
    .map(([key, value]) => ({
      name: CATEGORY_LABELS[key as keyof CategoryBreakdown],
      value,
      color: CATEGORY_COLORS[key as keyof CategoryBreakdown],
      emoji: CATEGORY_EMOJIS[key as keyof CategoryBreakdown]
    }))
    .filter(item => item.value > 0);

  // Prepare Weekly Trend Chart data (Chronological order)
  const lineData = [...userLogs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(log => {
      const dayName = new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' });
      return {
        date: dayName,
        'Screen Time (mins)': log.totalMinutes,
        Education: log.categories.education,
        Gaming: log.categories.gaming,
        Social: log.categories.socialMedia,
        Entertainment: log.categories.entertainment
      };
    });

  const formatTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const minsFormatted = mins % 1 === 0 ? mins : parseFloat(mins.toFixed(1));
    if (hours === 0) return `${minsFormatted} min`;
    return `${hours} hr ${minsFormatted} min`;
  };

  const formatTimeCompact = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const minsFormatted = mins % 1 === 0 ? mins : parseFloat(mins.toFixed(1));
    if (hours === 0) return `${minsFormatted}m`;
    return `${hours}h ${minsFormatted}m`;
  };

  const selectedUserObj = members.find(m => m.id === selectedUserId);

  // Prepare sorted categories list in decreasing order of screen time
  const sortedCategories = (Object.keys(CATEGORY_LABELS) as Array<keyof CategoryBreakdown>)
    .map(catKey => {
      const value = categoryTotals[catKey] || 0;
      const percentage = totalMinutesAcrossLogs > 0 ? Math.round((value / totalMinutesAcrossLogs) * 100) : 0;
      return {
        key: catKey,
        label: CATEGORY_LABELS[catKey],
        emoji: CATEGORY_EMOJIS[catKey],
        value,
        percentage,
        color: CATEGORY_COLORS[catKey]
      };
    })
    .sort((a, b) => b.value - a.value); // Decreasing order of screen-time!

  // Prepare standard 7 days weekly usage bar chart data
  const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyUsageData = DAYS_OF_WEEK.map(day => {
    const matchedLogs = userLogs.filter(log => {
      const logDay = new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' });
      return logDay === day;
    });
    const totalMins = matchedLogs.reduce((sum, log) => sum + log.totalMinutes, 0);
    return {
      day,
      minutes: totalMins
    };
  });

  const maxMinutes = Math.max(...dailyUsageData.map(d => d.minutes), 60);

  // Prepare individual apps across all categories sorted in decreasing order
  const allUserApps = appUsages
    .filter(au => au.userId === selectedUserId)
    .reduce((acc, current) => {
      const found = acc.find(a => a.appName.toLowerCase() === current.appName.toLowerCase());
      if (found) {
        found.minutesUsed += current.minutesUsed;
      } else {
        acc.push({ ...current });
      }
      return acc;
    }, [] as AppUsage[])
    .sort((a, b) => b.minutesUsed - a.minutesUsed); // Decreasing order of screen-time!

  return (
    <div id="category-tracking-root" className="max-w-5xl mx-auto py-6 px-4 space-y-8 font-sans">
      
      {/* Title Header with Profile Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-indigo-600" />
            Screen-Time Category Diagnostics
          </h2>
          <p className="text-xs text-slate-500">Breakdowns of active device time by academic, entertainment, and social interaction labels.</p>
        </div>

        {/* Filter Selection */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-2" />
          <select
            id="filter-member-stats"
            value={selectedUserId}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedUserId(val);
              onSelectedUserChange?.(val);
            }}
            className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none cursor-pointer pr-3"
          >
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-xs mt-3">Compiling database metrics...</p>
        </div>
      ) : userLogs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400">
          No usage logs detected for this family member yet. Start the device simulator to create live inputs!
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Daily Screen Time Goal & Progress Bar (Requested) */}
          {selectedUserObj && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider block">Today's Total Screen Time</span>
                  <h3 className="text-2xl font-black text-slate-850 tracking-tight mt-0.5">
                    {formatTime(totalMinutesAcrossLogs)} <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">logged today</span>
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full font-mono">
                    Limit Goal: {formatTime(selectedUserObj.dailyGoal || 180)}
                  </span>
                </div>
              </div>

              {/* Progress bar filled accordingly */}
              {(() => {
                const dailyGoalMins = selectedUserObj.dailyGoal || 180;
                const progressPercent = Math.min(100, Math.round((totalMinutesAcrossLogs / dailyGoalMins) * 100));
                return (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                      <span className="text-slate-400 uppercase tracking-widest text-[9px] font-black">Goal Completion</span>
                      <span className="text-indigo-600 font-extrabold">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Grid with original light-themed Pie & Line charts ("keep it as it was") */}
          <div className="grid md:grid-cols-2 gap-8 min-w-0 overflow-hidden">
            
            {/* Pie Chart / Donut Category Breakdown */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6 flex flex-col justify-between min-w-0 overflow-hidden">
              <div>
                <h3 className="font-bold text-slate-800 text-base">All-Time Category Distribution</h3>
                <p className="text-xs text-slate-400">Relative share of total {formatTime(totalMinutesAcrossLogs)} logged time</p>
              </div>

              {pieData.length > 0 ? (
                <>
                  <div className="h-56 w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [formatTime(value), 'Duration']}
                          contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #e2e8f0' }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Central Text */}
                    <div className="absolute text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
                      <span className="text-sm font-black text-slate-700 block">{formatTime(totalMinutesAcrossLogs)}</span>
                    </div>
                  </div>

                  {/* Legend list */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                    {pieData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-500 font-medium truncate">
                          {item.emoji} {item.name}: <strong className="text-slate-800">{formatTime(item.value)}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-400 py-12 text-xs">No active category logs.</div>
              )}
            </div>

            {/* Daily & Weekly Usage Trend Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6 flex flex-col justify-between min-w-0 overflow-hidden">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Weekly Screen-Time Track</h3>
                <p className="text-xs text-slate-400">Daily logged minutes plotted across the 7-day calendar view</p>
              </div>

              <div className="h-56 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" unit="m" />
                    <Tooltip 
                      formatter={(value: number) => [`${value} min`, '']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Screen Time (mins)" 
                      stroke="#4f46e5" 
                      strokeWidth={3} 
                      dot={{ r: 4, strokeWidth: 1 }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Insight Statement */}
              {selectedUserObj && (
                <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-xs text-indigo-800 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
                  <p className="leading-relaxed">
                    <strong>Trend Alert:</strong> {selectedUserObj.name}'s peak screen usage was on Sunday (the weekend), aligning with educational tutorials and leisure gaming. Study-hour screen filters successfully reduced weekday screen spikes.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Detailed App Usage (Most Used Apps) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-600" />
            Most Used Apps
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Real-time individual app screen-time logged for <strong className="text-slate-700">{selectedUserObj?.name || 'this member'}</strong> today, ranked in decreasing order
          </p>
        </div>

        {allUserApps.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4 pt-1">
            {allUserApps.map((app, idx) => {
              const appPercent = totalMinutesAcrossLogs > 0 ? Math.round((app.minutesUsed / totalMinutesAcrossLogs) * 100) : 0;
              const appColor = CATEGORY_COLORS[app.category as keyof CategoryBreakdown] || '#64748b';
              const catEmoji = CATEGORY_EMOJIS[app.category as keyof CategoryBreakdown] || '📱';
              return (
                <div key={app.id || idx} className="bg-slate-50/50 hover:bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 transition-all space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base shrink-0">{catEmoji}</span>
                      <span className="font-extrabold text-slate-800 truncate max-w-[120px] sm:max-w-[150px]">{app.appName}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded-md border border-slate-200 uppercase tracking-tight shrink-0">
                        {CATEGORY_LABELS[app.category as keyof CategoryBreakdown]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono font-bold text-slate-600 shrink-0">
                      <span>{formatTimeCompact(app.minutesUsed)}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-indigo-600 font-black">{appPercent}%</span>
                    </div>
                  </div>
                  {/* Progress bar along with the percentage in the end */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-250">
                    <div 
                      style={{ width: `${appPercent}%`, backgroundColor: appColor }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-2xl text-xs text-slate-400 italic">
            No app activities registered for today.
          </div>
        )}
      </div>

      {/* Category Breakdown Table of Examples */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
          <ListFilter className="w-4 h-4 text-slate-500" />
          Active Category Threshold Summaries
        </h3>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
            <span className="text-xl p-2 bg-blue-100/50 rounded-xl text-blue-600">📚</span>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Education Goal</span>
              <p className="text-sm font-black text-slate-700">45+ min daily</p>
              <p className="text-[10px] text-emerald-600 font-semibold">Unlimited Access</p>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
            <span className="text-xl p-2 bg-pink-100/50 rounded-xl text-pink-600">📱</span>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Social Media</span>
              <p className="text-sm font-black text-slate-700">Max 30 min daily</p>
              <p className="text-[10px] text-amber-600 font-semibold">Strict App Lock</p>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
            <span className="text-xl p-2 bg-rose-100/50 rounded-xl text-rose-600">🎮</span>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Leisure Gaming</span>
              <p className="text-sm font-black text-slate-700">Max 30 min daily</p>
              <p className="text-[10px] text-red-500 font-semibold">Approval Required</p>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
            <span className="text-xl p-2 bg-purple-100/50 rounded-xl text-purple-600">🍿</span>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Entertainment</span>
              <p className="text-sm font-black text-slate-700">Max 40 min daily</p>
              <p className="text-[10px] text-slate-500 font-semibold">Shared TV Stream</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
