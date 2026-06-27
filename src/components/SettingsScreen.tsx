/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Family } from '../types';
import { API } from '../api';
import { Settings, LogOut, Bell, Shield, Sliders, Moon, Sun, Users, HelpCircle, Heart, Sparkles, Camera, Upload, UserMinus, Copy, Check } from 'lucide-react';

interface SettingsScreenProps {
  currentUser: User;
  onLogout: () => void;
  onSwitchProfile: (userId: string) => void;
  currentFamily: Family | null;
  onNavigate: (tabId: string) => void;
  onRefreshUser?: () => void;
}

export default function SettingsScreen({ currentUser, onLogout, onSwitchProfile, currentFamily, onNavigate, onRefreshUser }: SettingsScreenProps) {
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [privacySync, setPrivacySync] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const [members, setMembers] = useState<User[]>([]);
  const [feedback, setFeedback] = useState('');

  // States for joining family from Settings
  const [settingsJoinCode, setSettingsJoinCode] = useState('');
  const [joiningFamily, setJoiningFamily] = useState(false);

  // States for removing family member
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  // States for copying invite code
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveMember = async (targetUserId: string) => {
    try {
      const res = await fetch('/api/family/remove-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId })
      });
      if (res.ok) {
        setFeedback('Member successfully removed from group.');
        setConfirmRemoveId(null);
        onRefreshUser?.();
        loadSettingsData();
      } else {
        const errData = await res.json();
        setFeedback(errData.error || 'Failed to remove member.');
      }
    } catch (err) {
      setFeedback('Error connecting to server.');
    } finally {
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  const handleSettingsJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsJoinCode.trim()) {
      setFeedback('Please enter a valid invite code.');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    setJoiningFamily(true);
    setFeedback('');

    try {
      const res = await API.joinFamily(settingsJoinCode);
      if (res.success) {
        setFeedback(`Successfully joined ${res.family.name}!`);
        onRefreshUser?.();
        // Reload settings data
        setTimeout(() => {
          loadSettingsData();
        }, 1000);
      } else {
        setFeedback('Invalid invite code. Please check and try again.');
      }
    } catch (err) {
      setFeedback('Invalid code or connection timed out.');
    } finally {
      setJoiningFamily(false);
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  const loadSettingsData = async () => {
    try {
      const res = await API.getFamily();
      setMembers(res.members);
    } catch (err) {
      console.error('Error loading settings family data', err);
    }
  };

  useEffect(() => {
    loadSettingsData();
    setWeeklyDigest(currentUser.weeklyDigest !== undefined ? currentUser.weeklyDigest : true);
    setStreakAlerts(currentUser.streakAlerts !== undefined ? currentUser.streakAlerts : true);
    setPrivacySync(currentUser.privacySync !== undefined ? currentUser.privacySync : true);
    setDarkMode(currentUser.darkMode !== undefined ? currentUser.darkMode : false);
  }, [currentUser]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 2 * 1024 * 1024) {
        setFeedback('Image is too large! Please choose a file under 2MB.');
        setTimeout(() => setFeedback(''), 3000);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const res = await API.updateProfilePic(currentUser.id, base64String);
          if (res.success) {
            setFeedback('Custom profile picture uploaded and saved successfully!');
            onRefreshUser?.();
          } else {
            setFeedback('Failed to save photo.');
          }
        } catch (err) {
          console.error(err);
          setFeedback('Error saving photo.');
        }
        setTimeout(() => setFeedback(''), 4000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFeedback('Image is too large! Please choose a file under 2MB.');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const res = await API.updateProfilePic(currentUser.id, base64String);
        if (res.success) {
          setFeedback('Custom profile picture uploaded and saved successfully!');
          onRefreshUser?.();
        } else {
          setFeedback('Failed to upload profile picture.');
        }
      } catch (err) {
        console.error('Error saving profile picture:', err);
        setFeedback('Error updating profile picture.');
      }
      setTimeout(() => setFeedback(''), 4000);
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = async (emoji: string) => {
    try {
      const res = await API.updateProfilePic(currentUser.id, emoji);
      if (res.success) {
        setFeedback(`Profile avatar updated to ${emoji}!`);
        onRefreshUser?.();
      } else {
        setFeedback('Failed to update avatar.');
      }
    } catch (err) {
      console.error('Error selecting preset avatar:', err);
      setFeedback('Error updating avatar preset.');
    }
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleToggleWeeklyDigest = async () => {
    const nextVal = !weeklyDigest;
    setWeeklyDigest(nextVal);
    try {
      const res = await API.updateUserSettings(currentUser.id, { weeklyDigest: nextVal });
      if (res.success) {
        onRefreshUser?.();
        setFeedback('Weekly digest notifications updated!');
      }
    } catch (err) {
      console.error('Error updating weekly digest preference', err);
    }
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleToggleStreakAlerts = async () => {
    const nextVal = !streakAlerts;
    setStreakAlerts(nextVal);
    try {
      const res = await API.updateUserSettings(currentUser.id, { streakAlerts: nextVal });
      if (res.success) {
        onRefreshUser?.();
        setFeedback('Streak accomplishment alerts updated!');
      }
    } catch (err) {
      console.error('Error updating streak alert preference', err);
    }
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleTogglePrivacySync = async () => {
    const nextVal = !privacySync;
    setPrivacySync(nextVal);
    try {
      const res = await API.updateUserSettings(currentUser.id, { privacySync: nextVal });
      if (res.success) {
        onRefreshUser?.();
        setFeedback('Security diagnostics synchronization updated!');
      }
    } catch (err) {
      console.error('Error updating privacy preferences', err);
    }
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleToggleDarkMode = async () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    
    if (nextVal) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    try {
      const res = await API.updateUserSettings(currentUser.id, { darkMode: nextVal });
      if (res.success) {
        onRefreshUser?.();
        setFeedback(nextVal ? 'Dark theme enabled!' : 'Light theme enabled!');
      }
    } catch (err) {
      console.error('Error updating dark mode preference', err);
    }
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleSavePreferences = async () => {
    try {
      const res = await API.updateUserSettings(currentUser.id, {
        weeklyDigest,
        streakAlerts,
        privacySync,
        darkMode
      });
      if (res.success) {
        setFeedback('All application preferences saved successfully!');
        onRefreshUser?.();
      } else {
        setFeedback('Failed to save settings.');
      }
    } catch (err) {
      console.error('Error saving user settings:', err);
      setFeedback('Error saving settings.');
    }
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div id="settings-screen-root" className="max-w-5xl mx-auto py-6 px-4 space-y-8 font-sans">
      
      {/* Title Header */}
      <div className="border-b border-slate-200 pb-5 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center justify-center md:justify-start gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            Account & Device Preferences
          </h2>
          <p className="text-xs text-slate-500 mt-1">Customize alarm reminder triggers, dark overrides, and manage profile toggles.</p>
        </div>
        
        <button
          type="button"
          onClick={handleSavePreferences}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs cursor-pointer shadow-md shadow-indigo-100 transition-all self-center md:self-auto"
        >
          Save All Changes
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-2xl font-semibold text-center font-mono">
          {feedback}
        </div>
      )}

      {/* Symmetrical Linear Configuration Flow */}
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Profile Photo Customization Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <Camera className="w-4 h-4 text-indigo-500" /> Profile Picture Customization
          </h3>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 pt-1">
            {/* Current Profile Photo preview */}
            <div className="relative group">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-slate-200 flex items-center justify-center text-3xl shadow-md overflow-hidden shrink-0">
                {currentUser.profilePic.startsWith('data:image') ? (
                  <img 
                    src={currentUser.profilePic} 
                    alt={currentUser.name} 
                    className="w-full h-full object-cover animate-fade-in"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="animate-pulse">{currentUser.profilePic}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full p-1 border border-white shadow">
                <Camera className="w-3 h-3" />
              </div>
            </div>

            {/* Upload and quick presets */}
            <div className="flex-1 w-full space-y-3">
              <p className="text-[11px] text-slate-600 font-medium">
                Select a stylized avatar preset, or drag & drop / upload your own custom photo.
              </p>
              
              {/* Drag and Drop Container */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 rounded-xl transition-all ${
                  dragActive 
                    ? 'bg-indigo-50 border-2 border-indigo-400 border-dashed animate-pulse' 
                    : 'bg-transparent border border-transparent'
                }`}
              >
                <label className={`flex flex-col items-center justify-center px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 border-dashed rounded-xl cursor-pointer text-center group transition-all ${
                  dragActive ? 'bg-indigo-100 border-indigo-300 scale-95' : ''
                }`}>
                  <Upload className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                  <span className="text-[9px] font-bold text-slate-600 mt-0.5">Upload Photo</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handlePhotoUpload} 
                  />
                </label>
                
                <div className="flex flex-col justify-center items-center text-center p-1.5 bg-indigo-50/40 border border-indigo-100/60 rounded-xl">
                  <span className="text-[8px] uppercase font-bold text-indigo-600 tracking-wider">Drag & Drop</span>
                  <span className="text-[9px] font-medium text-slate-500 mt-0.5">Or browse (Max 2MB)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Presets Grid */}
          <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Or Choose Avatar Preset</span>
            <div className="flex flex-wrap gap-1.5">
              {['👨‍💼', '👩‍💼', '👦', '👧', '👨', '👩', '🦁', '🦊', '🦉', '🚀', '🎨', '🌟'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handlePresetSelect(emoji)}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center text-lg cursor-pointer transition-all hover:scale-110 active:scale-95 ${
                    currentUser.profilePic === emoji 
                      ? 'bg-indigo-50 border-indigo-500 shadow-inner scale-105' 
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* App & Display Preferences Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Sliders className="w-4 h-4 text-indigo-500" /> App & Display Preferences
            </h3>
          </div>

          <div className="space-y-3.5">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Weekly Digests</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Receive detailed health summaries every Sunday evening.</span>
              </div>
              <button
                type="button"
                onClick={handleToggleWeeklyDigest}
                className={`w-10 h-5 rounded-full p-0.5 transition-all relative cursor-pointer ${weeklyDigest ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-all shadow ${weeklyDigest ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Streak Accomplishments</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Notify the family group when a member maintains goal streaks.</span>
              </div>
              <button
                type="button"
                onClick={handleToggleStreakAlerts}
                className={`w-10 h-5 rounded-full p-0.5 transition-all relative cursor-pointer ${streakAlerts ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-all shadow ${streakAlerts ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </button>
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Synchronize Screen Diagnostics</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Share anonymous, encrypted usage durations with family members.</span>
              </div>
              <button
                type="button"
                onClick={handleTogglePrivacySync}
                className={`w-10 h-5 rounded-full p-0.5 transition-all relative cursor-pointer ${privacySync ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-all shadow ${privacySync ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </button>
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between pt-0.5">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Simulate Dark Mode</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Toggle dark background templates.</span>
              </div>
              <button
                type="button"
                id="dark-mode-toggle-btn"
                onClick={handleToggleDarkMode}
                className="p-1.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 cursor-pointer flex items-center gap-1 text-[11px] font-bold transition-all"
              >
                {darkMode ? <Sun className="w-3 h-3 text-yellow-500" /> : <Moon className="w-3 h-3" />}
                {darkMode ? 'Light Theme' : 'Dark Mode'}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleSavePreferences}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[11px] cursor-pointer transition-all"
            >
              Save Preferences
            </button>
          </div>
        </div>

        {/* Compact Link Another Device Card */}
        {currentFamily && (
          <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl shrink-0">📨</span>
              <div>
                <h4 className="text-sm font-extrabold text-indigo-900 uppercase tracking-wider">Link Another Device</h4>
                <div className="text-xs text-indigo-600 mt-1 flex items-center gap-2 flex-wrap">
                  <span>Invite code:</span>
                  <span className="font-mono font-extrabold text-indigo-800 bg-white border border-indigo-200 px-2.5 py-0.5 rounded-lg shadow-sm text-xs">
                    {currentFamily.inviteCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(currentFamily.inviteCode)}
                    className="p-1 px-1.5 hover:bg-indigo-100/70 text-indigo-700 hover:text-indigo-900 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold"
                    title="Copy Invite Code"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 shrink-0" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('FamilySetup')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2 px-4 rounded-xl transition-all text-xs cursor-pointer shadow-sm flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              Manage QR
            </button>
          </div>
        )}

        {/* Compact Join a Family Group Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl shrink-0">👪</span>
            <div>
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Join a Family Group</h4>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                {currentFamily ? `Linked to ${currentFamily.name}` : 'Link profiles with an invitation code.'}
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto shrink-0 items-center">
            <input
              type="text"
              placeholder="e.g. SW-9683-FAM"
              value={settingsJoinCode}
              onChange={(e) => setSettingsJoinCode(e.target.value.toUpperCase())}
              className="w-full sm:w-44 text-xs font-mono font-bold uppercase border border-slate-200 bg-slate-50 px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
            />
            <button
              type="button"
              onClick={handleSettingsJoinFamily}
              disabled={joiningFamily}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl transition-all text-xs cursor-pointer flex items-center gap-1 shrink-0"
            >
              {joiningFamily ? 'Joining...' : 'Join'}
            </button>
          </div>
        </div>

        {/* Manage Family Members for creator */}
        {currentFamily && currentFamily.createdBy === currentUser.id && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3.5">
            <div className="flex items-start gap-3 border-b border-slate-100 pb-2">
              <span className="text-xl mt-0.5">⚙️</span>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Manage Family Group</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Remove linked members from <span className="font-semibold text-slate-700">{currentFamily.name}</span>.
                </p>
              </div>
            </div>

            {members.filter(m => m.id !== currentUser.id).length === 0 ? (
              <p className="text-[10px] text-slate-400 italic text-center py-1">
                No other members in this family yet.
              </p>
            ) : (
              <div className="space-y-2">
                {members.filter(m => m.id !== currentUser.id).map(member => (
                  <div key={member.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{member.profilePic}</span>
                      <div>
                        <p className="text-xs font-extrabold text-slate-700">{member.name}</p>
                        <p className="text-[9px] text-slate-400 font-medium">{member.relation} • {member.role}</p>
                      </div>
                    </div>

                    {confirmRemoveId === member.id ? (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-[9px] font-black py-1 px-2 rounded-lg text-center cursor-pointer transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmRemoveId(null)}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-600 text-[9px] font-black py-1 px-2 rounded-lg text-center cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        id={`settings-remove-btn-${member.id}`}
                        onClick={() => setConfirmRemoveId(member.id)}
                        className="p-1.5 border border-red-100 hover:bg-red-50 text-red-600 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <UserMinus className="w-3 h-3 text-red-500" />
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Shortcuts to other config screens */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2.5 text-xs font-bold text-slate-600">
          <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Quick Config Shortcuts</h4>
          <button
            type="button"
            onClick={() => onNavigate('Schedules')}
            className="w-full text-left py-2 border-b border-slate-100 hover:text-indigo-600 transition-colors cursor-pointer flex items-center justify-between"
          >
            <span>⏱️ Daily Screen Goals Setup</span>
            <span className="text-slate-300 text-[10px]">→</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('Schedules')}
            className="w-full text-left py-2 border-b border-slate-100 hover:text-indigo-600 transition-colors cursor-pointer flex items-center justify-between"
          >
            <span>📞 Emergency Contact Override List</span>
            <span className="text-slate-300 text-[10px]">→</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('FamilySetup')}
            className="w-full text-left py-2 hover:text-indigo-600 transition-colors cursor-pointer flex items-center justify-between"
          >
            <span>📨 Show Family Invitation QR & Codes</span>
            <span className="text-slate-300 text-[10px]">→</span>
          </button>
        </div>

      </div>

      {/* Centered Symmetrical Sign Out Action */}
      <div className="flex flex-col items-center justify-center pt-8 border-t border-slate-200 mt-8 text-center">
        <button
          type="button"
          id="settings-logout-btn"
          onClick={onLogout}
          className="max-w-xs w-full bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 text-red-600 font-extrabold py-3 px-6 rounded-2xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-red-50"
        >
          <LogOut className="w-4 h-4 text-red-500" /> Sign Out from ScreenWise
        </button>
        <p className="text-[10px] text-slate-400 mt-2 font-semibold">
          Log out of your active profile session. Your screen schedules and family syncing will remain safe on our cloud.
        </p>
      </div>

    </div>
  );
}
