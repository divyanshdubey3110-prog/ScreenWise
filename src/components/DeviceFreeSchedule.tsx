/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, DeviceFreeSchedule, CategoryBreakdown } from '../types';
import { API } from '../api';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Bell, 
  Sparkles, 
  Check, 
  Hourglass, 
  Eye, 
  ShieldAlert, 
  Smartphone, 
  AlertCircle, 
  Timer 
} from 'lucide-react';

interface DeviceFreeScheduleViewProps {
  currentUser: User;
}

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

export default function DeviceFreeScheduleView({ currentUser }: DeviceFreeScheduleViewProps) {
  // Schedules State
  const [schedules, setSchedules] = useState<DeviceFreeSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('19:00');
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [feedback, setFeedback] = useState('');

  // App Timers State
  const [appTimers, setAppTimers] = useState<any[]>([]);
  const [appUsages, setAppUsages] = useState<any[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [timerFeedback, setTimerFeedback] = useState('');
  const [showAddTimerForm, setShowAddTimerForm] = useState(false);
  const [timerAppName, setTimerAppName] = useState('');
  const [timerCategory, setTimerCategory] = useState('gaming');
  const [timerLimitMinutes, setTimerLimitMinutes] = useState(30);
  const [timerTargetUserId, setTimerTargetUserId] = useState(currentUser.id);

  const isParent = currentUser.role === 'parent';

  const loadSchedules = async () => {
    try {
      const res = await API.getSchedules();
      setSchedules(res.schedules);
    } catch (err) {
      console.error('Error fetching schedules', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTimersAndUsages = async () => {
    try {
      const timersRes = await API.getAppTimers();
      setAppTimers(timersRes.appTimers || []);

      const usagesRes = await API.getAppUsages();
      setAppUsages(usagesRes.appUsages || []);

      const famRes = await API.getFamily();
      setMembers(famRes.members || []);
      
      // Default target user for timer form is first child if available, or self
      if (famRes.members && famRes.members.length > 0) {
        const firstChild = famRes.members.find(m => m.role === 'child');
        setTimerTargetUserId(firstChild ? firstChild.id : currentUser.id);
      }
    } catch (err) {
      console.error('Error loading timers/usages', err);
    }
  };

  useEffect(() => {
    loadSchedules();
    loadTimersAndUsages();
  }, [currentUser]);

  const handleToggleReminder = async (sched: DeviceFreeSchedule) => {
    try {
      const updatedReminders = !sched.remindersEnabled;
      setSchedules(prev => prev.map(s => s.id === sched.id ? { ...s, remindersEnabled: updatedReminders } : s));
      await API.updateSchedule(sched.id, { remindersEnabled: updatedReminders });
      setFeedback(`Reminders ${updatedReminders ? 'enabled' : 'disabled'} for ${sched.title}`);
    } catch (err) {
      console.error('Error updating reminder toggle', err);
    } finally {
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!isParent) {
      setFeedback('⚠️ Parental authorization required to delete schedules.');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }
    
    try {
      setSchedules(prev => prev.filter(s => s.id !== id));
      await API.deleteSchedule(id);
      setFeedback(`Schedule "${name}" deleted.`);
    } catch (err) {
      console.error('Error deleting schedule', err);
    } finally {
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(prev => prev.filter(d => d !== day));
    } else {
      setSelectedDays(prev => [...prev, day]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isParent) {
      setFeedback('⚠️ Only Parents can define new schedules.');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    if (!title.trim()) return;

    try {
      const res = await API.createSchedule({
        title,
        startTime,
        endTime,
        days: selectedDays,
        remindersEnabled
      });

      if (res.success) {
        setSchedules(prev => [...prev, res.schedule]);
        setFeedback(`Created schedule: ${title}!`);
        setShowAddForm(false);
        setTitle('');
        setStartTime('18:00');
        setEndTime('19:00');
      }
    } catch (err) {
      console.error('Error creating schedule', err);
    } finally {
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  // App Timer actions
  const handleCreateTimer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timerAppName.trim()) return;

    // Security check: children can only set timers for themselves
    const targetUserId = isParent ? timerTargetUserId : currentUser.id;

    try {
      const res = await API.createAppTimer({
        userId: targetUserId,
        appName: timerAppName.trim(),
        category: timerCategory,
        limitMinutes: Number(timerLimitMinutes)
      });

      if (res.success) {
        setAppTimers(prev => [...prev, res.timer]);
        setTimerFeedback(`Created app timer limit of ${timerLimitMinutes}m for ${timerAppName}!`);
        setShowAddTimerForm(false);
        setTimerAppName('');
        setTimerLimitMinutes(30);
        
        // Reload usages and schedules to check thresholds
        const usagesRes = await API.getAppUsages();
        setAppUsages(usagesRes.appUsages || []);
      }
    } catch (err) {
      console.error('Error creating timer', err);
    } finally {
      setTimeout(() => setTimerFeedback(''), 3000);
    }
  };

  const handleDeleteTimer = async (id: string, appName: string) => {
    try {
      await API.deleteAppTimer(id);
      setAppTimers(prev => prev.filter(t => t.id !== id));
      setTimerFeedback(`Deleted limit timer for "${appName}".`);
    } catch (err) {
      console.error('Error deleting app timer', err);
    } finally {
      setTimeout(() => setTimerFeedback(''), 3000);
    }
  };

  const getTargetUserAppNameUsed = (userId: string, appName: string): number => {
    const todayStr = '2026-06-24';
    const match = appUsages.find(
      au => au.userId === userId && 
      au.appName.toLowerCase() === appName.toLowerCase() &&
      au.date === todayStr
    );
    return match ? match.minutesUsed : 0;
  };

  const formatTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const minsFormatted = mins % 1 === 0 ? mins : parseFloat(mins.toFixed(1));
    if (hours === 0) return `${minsFormatted}m`;
    return `${hours}h ${minsFormatted}m`;
  };

  const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div id="schedule-screen-root" className="max-w-4xl mx-auto py-6 px-4 space-y-10 font-sans">
      
      {/* 1. Device-Free Schedules Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <Clock className="w-6 h-6 text-purple-500" />
              Device-Free Schedules
            </h2>
            <p className="text-xs text-slate-500">Configure focused blocks where non-academic apps lock to prioritize family interaction.</p>
          </div>

          {isParent ? (
            <button
              type="button"
              id="add-schedule-trigger-btn"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow-sm shadow-purple-100"
            >
              <Plus className="w-4 h-4" /> Add New Schedule
            </button>
          ) : (
            <div className="px-3 py-1 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-700 font-bold flex items-center gap-1 shrink-0">
              <ShieldAlert className="w-3.5 h-3.5" /> Read-Only Mode (Children Profile)
            </div>
          )}
        </div>

        {feedback && (
          <div id="schedule-feedback-alert" className="p-3 bg-purple-50 border border-purple-200 text-purple-700 text-xs rounded-2xl font-semibold text-center">
            {feedback}
          </div>
        )}

        {/* Schedule Create Form Sheet */}
        {showAddForm && isParent && (
          <form onSubmit={handleCreate} className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4 animate-fadeIn">
            <h3 className="font-bold text-slate-800 text-sm">Add Device-Free Target</h3>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Schedule Title</label>
                <input
                  type="text"
                  id="schedule-title-input"
                  placeholder="e.g. Dinner Time"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs bg-slate-50/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Start Time (24h)</label>
                <input
                  type="time"
                  id="schedule-start-input"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs bg-slate-50/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">End Time (24h)</label>
                <input
                  type="time"
                  id="schedule-end-input"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs bg-slate-50/50"
                />
              </div>
            </div>

            {/* Days Selection row */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-600 block">Active Days</span>
              <div className="flex flex-wrap gap-2">
                {ALL_DAYS.map((day) => {
                  const active = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${active ? 'bg-purple-600 border-purple-600 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500'}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reminders Toggle Checkbox */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="reminders-checkbox"
                checked={remindersEnabled}
                onChange={(e) => setRemindersEnabled(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="reminders-checkbox" className="text-xs text-slate-600 select-none">
                Push countdown notifications to child tablets 10 minutes prior
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                id="save-new-schedule-btn"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Save Schedule
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : schedules.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 text-xs">
            No device-free schedules found. Establish one using the button above.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {schedules.map((sched) => {
              return (
                <div 
                  key={sched.id} 
                  className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between space-y-4 relative"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Lock Rule</span>
                      <h4 className="font-extrabold text-slate-800 text-sm leading-none">{sched.title}</h4>
                    </div>

                    {/* Actions buttons */}
                    <div className="flex items-center gap-1">
                      {/* Toggle reminders */}
                      <button
                        type="button"
                        title="Toggle Alarm Reminders"
                        onClick={() => handleToggleReminder(sched)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${sched.remindersEnabled ? 'bg-orange-50 border-orange-100 text-orange-500 hover:bg-orange-100' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                      {/* Delete schedule */}
                      {isParent && (
                        <button
                          type="button"
                          onClick={() => handleDelete(sched.id, sched.title)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 text-red-500 hover:text-red-600 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lock Hours Indicator */}
                  <div className="flex items-center gap-2 py-1">
                    <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                      <Hourglass className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <span className="text-xl font-black text-slate-800">{sched.startTime} - {sched.endTime}</span>
                      <span className="text-[10px] text-slate-400 block font-medium">Daily restrictions apply</span>
                    </div>
                  </div>

                  {/* Weekdays pills active */}
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-200">
                    {ALL_DAYS.map(day => {
                      const active = sched.days.includes(day);
                      return (
                        <span 
                          key={day} 
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'text-slate-300'}`}
                        >
                          {day}
                        </span>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Individual App Timers Section */}
      <div className="space-y-6 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <Timer className="w-6 h-6 text-indigo-500" />
              Individual App Limits & Timers
            </h2>
            <p className="text-xs text-slate-500 font-medium">Set daily minute limit thresholds on specific apps. Children and parents are notified instantly when a limit is breached.</p>
          </div>

          <button
            type="button"
            id="add-timer-trigger-btn"
            onClick={() => setShowAddTimerForm(!showAddTimerForm)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow-sm shadow-indigo-100"
          >
            <Plus className="w-4 h-4" /> {showAddTimerForm ? 'Close Editor' : 'Set App Timer'}
          </button>
        </div>

        {timerFeedback && (
          <div id="timer-feedback-alert" className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs rounded-2xl font-semibold text-center animate-pulse">
            {timerFeedback}
          </div>
        )}

        {/* Add Timer Form Panel */}
        {showAddTimerForm && (
          <form onSubmit={handleCreateTimer} className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4 animate-fadeIn">
            <h3 className="font-bold text-slate-800 text-sm">Define Application Limit Timer</h3>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* App Name input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">App Name</label>
                <input
                  type="text"
                  placeholder="e.g. Roblox, YouTube"
                  required
                  value={timerAppName}
                  onChange={(e) => setTimerAppName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs bg-slate-50/50"
                />
              </div>

              {/* Category selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">App Category</label>
                <select
                  value={timerCategory}
                  onChange={(e) => setTimerCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs bg-white h-[34px]"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {CATEGORY_EMOJIS[key as keyof CategoryBreakdown]} {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Family Member Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Family Member</label>
                {isParent ? (
                  <select
                    value={timerTargetUserId}
                    onChange={(e) => setTimerTargetUserId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs bg-white h-[34px]"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.profilePic} {m.name} ({m.relation})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-100 text-slate-500 font-bold h-[34px] flex items-center">
                    Self ({currentUser.name})
                  </div>
                )}
              </div>

              {/* Daily Limit minutes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Daily Limit (Minutes)</label>
                <input
                  type="number"
                  min={5}
                  max={480}
                  required
                  value={timerLimitMinutes}
                  onChange={(e) => setTimerLimitMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs bg-slate-50/50"
                />
              </div>

            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm shadow-indigo-150"
              >
                Set App Timer
              </button>
              <button
                type="button"
                onClick={() => setShowAddTimerForm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Timers Listing Cards Grid */}
        {appTimers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 text-xs">
            No specific application timers active yet. Establish limits above.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {appTimers.map((timer) => {
              const targetUserObj = members.find(m => m.id === timer.userId);
              const targetUserName = targetUserObj ? targetUserObj.name : 'Unknown';
              const targetUserPic = targetUserObj ? targetUserObj.profilePic : '👤';
              
              const minutesUsed = getTargetUserAppNameUsed(timer.userId, timer.appName);
              const limit = timer.limitMinutes;
              const ratio = minutesUsed / limit;
              const exceeded = minutesUsed >= limit;

              // Color configs
              let progressColor = 'bg-emerald-500';
              let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              if (ratio >= 1.0) {
                progressColor = 'bg-rose-500 animate-pulse';
                badgeColor = 'bg-red-50 text-red-700 border-red-200 animate-bounce';
              } else if (ratio >= 0.75) {
                progressColor = 'bg-amber-500';
                badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
              }

              // Deletable by parent or by creator
              const canDeleteTimer = isParent || timer.createdBy === currentUser.id;

              return (
                <div 
                  key={timer.id}
                  className={`bg-white rounded-3xl p-5 shadow-sm border flex flex-col justify-between space-y-4 transition-all ${exceeded ? 'ring-1 ring-red-400 border-red-300' : 'border-slate-200 hover:shadow'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">
                        Target Member
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm bg-slate-100 p-0.5 rounded-md leading-none">{targetUserPic}</span>
                        <span className="font-extrabold text-slate-800 text-xs truncate max-w-[130px]">{targetUserName}</span>
                      </div>
                    </div>

                    {canDeleteTimer && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTimer(timer.id, timer.appName)}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-100 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* App Details */}
                  <div className="bg-slate-50/70 rounded-2xl p-3 border border-slate-150 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black text-slate-700 flex items-center gap-1">
                        {CATEGORY_EMOJIS[timer.category as keyof CategoryBreakdown]} {timer.appName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">{CATEGORY_LABELS[timer.category as keyof CategoryBreakdown]}</span>
                    </div>

                    {/* Progress details */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-500">Today's Use: <strong className="text-slate-700 font-mono">{formatTime(minutesUsed)}</strong></span>
                        <span className="text-slate-400">Limit: <strong className="text-indigo-600 font-mono">{formatTime(limit)}</strong></span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-150">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                          style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[9px] text-slate-400 font-medium italic">
                      Set by {timer.createdBy === currentUser.id ? 'You' : 'Parent'}
                    </span>
                    
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                      {exceeded ? '⚠️ Limit Exceeded!' : ratio >= 0.75 ? '⚡ Near Limit' : '✓ Safe Balance'}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-xs text-indigo-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Simulation Hint:</strong> Select the child profile (Rahul or Riya) using the Active Profile Switcher in the top header, then scroll down on the Home Dashboard and log screen-time for gaming or social media. If it exceeds their active timer limits, an instant in-app notification alerts both parent and child profiles immediately!
          </p>
        </div>
      </div>

    </div>
  );
}
