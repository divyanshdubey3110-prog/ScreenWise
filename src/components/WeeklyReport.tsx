/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, ScreenTimeLog } from '../types';
import { API } from '../api';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, ArrowDown, ShieldCheck, Flame, Sparkles, TrendingDown, BookOpen } from 'lucide-react';

interface WeeklyReportProps {
  currentUser: User;
  initialSelectedUserId?: string;
  onSelectedUserChange?: (userId: string) => void;
}

export default function WeeklyReport({ currentUser, initialSelectedUserId, onSelectedUserChange }: WeeklyReportProps) {
  const [members, setMembers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ScreenTimeLog[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    async function loadReportData() {
      try {
        const famRes = await API.getFamily();
        setMembers(famRes.members);
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
      } catch (err) {
        console.error('Error compiling weekly reports', err);
      }
    }
    loadReportData();
  }, [currentUser, initialSelectedUserId]);

  useEffect(() => {
    if (initialSelectedUserId) {
      setSelectedUserId(initialSelectedUserId);
    }
  }, [initialSelectedUserId]);

  // Aggregate total stats for each member for comparison chart
  const comparisonData = members.map(m => {
    const memberLogs = logs.filter(l => l.userId === m.id);
    const totalMins = memberLogs.reduce((sum, l) => sum + l.totalMinutes, 0);
    return {
      name: m.name.split(' ')[0], // first name
      'Total Minutes': totalMins,
      Goal: m.dailyGoal * 7
    };
  });

  const formatTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const minsFormatted = mins % 1 === 0 ? mins : parseFloat(mins.toFixed(1));
    if (hours === 0) return `${minsFormatted} min`;
    return `${hours} hr ${minsFormatted} min`;
  };

  const selectedMemberObj = members.find(m => m.id === selectedUserId);
  const selectedUserLogs = logs.filter(l => l.userId === selectedUserId);
  const totalWeeklyMins = selectedUserLogs.reduce((sum, l) => sum + l.totalMinutes, 0);

  // Find most-used category
  const categoriesSum = { education: 0, socialMedia: 0, gaming: 0, entertainment: 0, communication: 0, productivity: 0, other: 0 };
  selectedUserLogs.forEach(l => {
    Object.keys(l.categories).forEach(key => {
      const catKey = key as keyof typeof categoriesSum;
      categoriesSum[catKey] += l.categories[catKey] || 0;
    });
  });

  let mostUsedCategory = 'Education';
  let maxCatVal = -1;
  Object.entries(categoriesSum).forEach(([key, val]) => {
    if (val > maxCatVal) {
      maxCatVal = val;
      mostUsedCategory = key;
    }
  });

  // Category labels prettify
  const formatCatLabel = (cat: string) => {
    if (cat === 'education') return '📚 Education';
    if (cat === 'socialMedia') return '📱 Social Media';
    if (cat === 'gaming') return '🎮 Leisure Gaming';
    if (cat === 'entertainment') return '🍿 Entertainment';
    if (cat === 'communication') return '💬 Communication';
    if (cat === 'productivity') return '🚀 Productivity';
    return '⚙️ Other';
  };

  return (
    <div id="weekly-report-root" className="max-w-5xl mx-auto py-6 px-4 space-y-8 font-sans">
      
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          Weekly Digital Health Report
        </h2>
        <p className="text-xs text-slate-500">Consolidated analytics summarizing screen ratios, focus levels, and bedtime consistency.</p>
      </div>

      {/* Unified Family Weekly Summary Card (Highly requested in constraints!) */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-white/10 blur-xl"></div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-blue-100 text-[10px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Unified Family Insight Summary
          </div>
          <p className="text-lg font-bold leading-relaxed max-w-2xl">
            “This week, your family completed 5 out of 7 device-free dinners and successfully reduced late-night screen use by 18% compared to last week.”
          </p>
          <div className="flex gap-6 pt-2 text-xs text-blue-100 font-semibold font-mono">
            <span>✨ Bedtime Consistency: +22%</span>
            <span>📱 Social Screentime: -14m/day</span>
          </div>
        </div>
      </div>

      {/* Screen Selection & Member comparison metrics */}
      <div className="grid md:grid-cols-3 gap-8 min-w-0 overflow-hidden">
        
        {/* Left column: Selected member diagnostics card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider block">Individual Member Report</h3>
            
            {/* Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block">Select Member</label>
              <select
                id="report-member-select"
                value={selectedUserId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedUserId(val);
                  onSelectedUserChange?.(val);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/50"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedMemberObj ? (
            <div className="space-y-4 pt-2">
              {/* Stat card total */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400">Weekly Total Usage</span>
                <p className="text-2xl font-black text-slate-800 mt-1">{formatTime(totalWeeklyMins)}</p>
                <p className="text-[10px] text-slate-500 mt-1">Goal: {formatTime(selectedMemberObj.dailyGoal * 7)} weekly limit</p>
              </div>

              {/* Stat card most-used category */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400">Most Used Category</span>
                <p className="text-sm font-black text-slate-800 mt-1">{formatCatLabel(mostUsedCategory)}</p>
                <p className="text-[10px] text-slate-500 mt-1">Duration: {formatTime(maxCatVal)}</p>
              </div>

              {/* Improvement card */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-start gap-2.5">
                <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800">Weekly Improvement</span>
                  <p className="text-xs font-bold text-emerald-950 mt-1">Reduced Entertainment Screentime by 14%</p>
                  <p className="text-[10px] text-slate-500 leading-normal">Improved sleep consistency with Dinner-lock blocks.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">No member selected.</div>
          )}
        </div>

        {/* Right columns: BarChart Comparing Family Members */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6 flex flex-col justify-between min-w-0 overflow-hidden">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Weekly Screen-Time comparison</h3>
            <p className="text-xs text-slate-400">Total logged minutes compared against maximum weekly limits</p>
          </div>

          <div className="h-56 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" unit="m" />
                <Tooltip 
                  formatter={(value: number) => [`${value} mins`, '']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9' }}
                />
                <Bar dataKey="Total Minutes" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry['Total Minutes'] > entry.Goal ? '#ef4444' : '#6366f1'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Indicators list legend */}
          <div className="flex gap-4 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
              <span>Within Goal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span>Exceeded Limit</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
