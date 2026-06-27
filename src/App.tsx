/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { User, Family } from './types';
import { API } from './api';

// Components
import LoginSignup from './components/LoginSignup';
import CreateFamily from './components/CreateFamily';
import HomeDashboard from './components/HomeDashboard';
import FamilyOverview from './components/FamilyOverview';
import CategoryTracking from './components/CategoryTracking';
import DeviceFreeScheduleView from './components/DeviceFreeSchedule';
import ActivityPlanner from './components/ActivityPlanner';
import RewardsStreaks from './components/RewardsStreaks';
import TimeRequest from './components/TimeRequest';
import EmergencyContactScreen from './components/EmergencyContactScreen';
import SettingsScreen from './components/SettingsScreen';
import WeeklyReport from './components/WeeklyReport';
import FamilyGroupChat from './components/FamilyGroupChat';
import ScreenWiseLogo from './components/ScreenWiseLogo';

// Icons
import { 
  Shield, 
  Users, 
  Clock, 
  Award, 
  Calendar, 
  BookOpen, 
  Flame, 
  Settings, 
  Smartphone, 
  Bell, 
  User as UserIcon,
  HelpCircle,
  Menu,
  ChevronRight,
  Sparkles,
  Trophy,
  MessageSquare
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const [familyRoutinePercentage, setFamilyRoutinePercentage] = useState(71);
  const [allFamilyUsers, setAllFamilyUsers] = useState<User[]>([]);
  const [notificationBannerText, setNotificationBannerText] = useState('Family dinner time starts in 10 minutes. Keep devices away.');
  const [showNotification, setShowNotification] = useState(true);

  // App Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [selectedStatsUserId, setSelectedStatsUserId] = useState<string | undefined>(undefined);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Scroll to top when active tab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Reset selected stats member to current user if navigating away from the 'Usage' tab
  useEffect(() => {
    if (activeTab !== 'Usage' && currentUser) {
      setSelectedStatsUserId(currentUser.id);
    }
  }, [activeTab, currentUser]);

  const refreshUserAndFamily = async () => {
    try {
      const meRes = await API.getMe();
      if (meRes.user) {
        setCurrentUser(meRes.user);
      }

      const famRes = await API.getFamily();
      setCurrentFamily(famRes.family);
      setAllFamilyUsers(famRes.members);
      setFamilyRoutinePercentage(famRes.routineCompletion);
    } catch (err) {
      console.error('Error refreshing session states', err);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await API.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('Error loading notifications', err);
    }
  };

  useEffect(() => {
    async function initSession() {
      try {
        await refreshUserAndFamily();
      } catch (err) {
        console.error('Initial session fetch failed', err);
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, []);

  // Set up live interval polling for notifications to feel instant
  useEffect(() => {
    if (!currentUser) return;
    loadNotifications();
    const interval = setInterval(() => {
      loadNotifications();
    }, 4000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Set up automatic Dark Mode state based on current user preference
  useEffect(() => {
    if (currentUser && currentUser.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentUser]);

  const unreadAlerts = notifications.filter(n => !n.read);
  const latestUnreadMsg = unreadAlerts.length > 0 ? unreadAlerts[0].message : null;

  // Keep top warning banner visible when a new alert comes
  useEffect(() => {
    if (latestUnreadMsg) {
      setShowNotification(true);
    }
  }, [latestUnreadMsg]);

  const [activeSessionSeconds, setActiveSessionSeconds] = useState(0);
  const activeSessionSecondsRef = useRef(0);

  // Load initial cached active seconds
  useEffect(() => {
    if (!currentUser) {
      activeSessionSecondsRef.current = 0;
      setActiveSessionSeconds(0);
      return;
    }
    const cached = localStorage.getItem(`welfare_active_seconds_${currentUser.id}`);
    const initialSeconds = parseInt(cached, 10) || 0;
    activeSessionSecondsRef.current = initialSeconds;
    setActiveSessionSeconds(initialSeconds);
  }, [currentUser]);

  // High-resolution active tab tracker
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      // Only increment if document is active and window has focus to ensure absolute realism
      if (document.visibilityState === 'visible' && document.hasFocus()) {
        const next = activeSessionSecondsRef.current + 1;
        
        if (next >= 60) {
          activeSessionSecondsRef.current = 0;
          setActiveSessionSeconds(0);
          localStorage.setItem(`welfare_active_seconds_${currentUser.id}`, '0');
          
          // Trigger API log increment of exactly 1 minute safely outside state updater!
          API.incrementUsage(currentUser.id, 1, 'productivity', 'Digital Welfare Portal (Active Web Use)')
            .then(() => {
              refreshUserAndFamily();
            })
            .catch((err) => console.error('Error tracking screen time', err));
        } else {
          activeSessionSecondsRef.current = next;
          setActiveSessionSeconds(next);
          localStorage.setItem(`welfare_active_seconds_${currentUser.id}`, String(next));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Force sync session seconds remaining
  const forceSyncSessionSeconds = async () => {
    if (!currentUser) return;
    const secondsToSync = activeSessionSecondsRef.current;
    if (secondsToSync <= 0) return;

    try {
      // Calculate fractional/decimal minutes precisely (e.g. 15 seconds = 0.25 minutes)
      const minutesToSync = secondsToSync / 60;
      const res = await API.incrementUsage(currentUser.id, minutesToSync, 'productivity', 'Digital Welfare Portal (Active Web Use)');
      if (res.success) {
        activeSessionSecondsRef.current = 0;
        setActiveSessionSeconds(0);
        localStorage.setItem(`welfare_active_seconds_${currentUser.id}`, '0');
        await refreshUserAndFamily();
      }
    } catch (err) {
      console.error('Error forcing session synchronization', err);
    }
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    refreshUserAndFamily();
    setActiveTab('Dashboard');
  };

  const handleLogout = async () => {
    try {
      await API.logout();
      setCurrentUser(null);
      setCurrentFamily(null);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleSwitchProfile = async (userId: string) => {
    try {
      const res = await API.switchProfile(userId);
      if (res.success) {
        setCurrentUser(res.user);
        // Sync stats
        await refreshUserAndFamily();
      }
    } catch (err) {
      console.error('Error switching profile', err);
    }
  };

  const handleFamilySetupSuccess = (family: Family, members: User[]) => {
    setCurrentFamily(family);
    setAllFamilyUsers(members);
    setActiveTab('Family');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs mt-4 font-semibold">Configuring ScreenWise Core...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <LoginSignup onAuthSuccess={handleAuthSuccess} />
        <footer className="py-4 text-center text-[11px] text-slate-400 font-medium">
          ScreenWise Digital Wellbeing • Designed for Healthy Family Routine Balance
        </footer>
      </div>
    );
  }

  // Navigation Items
  const navItems = [
    { id: 'Dashboard', label: 'Home Dashboard', icon: Smartphone, color: 'text-indigo-600' },
    { id: 'Family', label: 'Family Circle', icon: Users, color: 'text-indigo-600' },
    { id: 'Chat', label: 'Family Lounge', icon: MessageSquare, color: 'text-indigo-600' },
    { id: 'Usage', label: 'Usage Graphs', icon: BookOpen, color: 'text-pink-600' },
    { id: 'Schedules', label: 'Routine Lock', icon: Clock, color: 'text-purple-600' },
    { id: 'Activities', label: 'Offline Planner', icon: Calendar, color: 'text-emerald-600' },
    { id: 'Rewards', label: 'Rewards & Streaks', icon: Award, color: 'text-amber-600' },
    { id: 'Requests', label: 'Allocations Queue', icon: Trophy, color: 'text-orange-600' },
    { id: 'Settings', label: 'App Settings', icon: Settings, color: 'text-slate-600' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans">
      
      {/* Top Warning Push Alert Bar */}
      {showNotification && (
        <div className={`bg-gradient-to-r ${latestUnreadMsg ? 'from-red-600 via-rose-500 to-orange-500' : 'from-amber-500 to-orange-500'} text-white text-xs font-bold py-2.5 px-4 flex justify-between items-center shadow-inner relative z-30 transition-all`}>
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <Bell className="w-4 h-4 shrink-0 animate-bounce text-white" />
            <span className="truncate">{latestUnreadMsg || 'Upcoming Study Hour starts in 10 minutes. Keeping devices away is advised!'}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setShowNotification(false)}
            className="text-white hover:text-slate-100 font-black text-sm pr-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Global Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <ScreenWiseLogo size="sm" showText={true} />

          {/* Core Interactive User switcher directly in Header (The perfect demo presentation widget!) */}
          <div className="flex items-center gap-4">
            
            {/* Real-time Notification Bell Dropdown */}
            <div className="relative">
              <button
                type="button"
                id="header-notification-bell-btn"
                onClick={() => {
                  setShowNotificationsDropdown(!showNotificationsDropdown);
                  // Refresh logs when opening to get fresh values
                  loadNotifications();
                }}
                className={`p-2 rounded-xl relative cursor-pointer transition-all border ${showNotificationsDropdown ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-transparent hover:border-slate-200'}`}
              >
                <Bell className="w-5 h-5" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[8px] font-black flex items-center justify-center animate-pulse">
                    {unreadAlerts.length}
                  </span>
                )}
              </button>

              {showNotificationsDropdown && (
                <div 
                  id="notifications-tray-dropdown"
                  className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden font-sans text-xs"
                >
                  <div className="p-3 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                    <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-indigo-600" />
                      Family Alerts ({unreadAlerts.length})
                    </span>
                    {unreadAlerts.length > 0 && (
                      <button
                        type="button"
                        onClick={async () => {
                          await API.markNotificationsRead();
                          loadNotifications();
                        }}
                        className="text-[10px] text-indigo-600 font-extrabold hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={`p-3 transition-colors ${n.read ? 'bg-white text-slate-500' : 'bg-red-50/50 text-slate-800 font-semibold'}`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-sm shrink-0">⚠️</span>
                            <div className="space-y-1">
                              <p className="leading-normal">{n.message}</p>
                              <span className="text-[9px] text-slate-400 block font-semibold font-mono">
                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 italic">
                        All clear! No current app limit notifications today.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>



            {/* Active profile Avatar chip */}
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 p-1.5 pr-3 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-white shadow-inner flex items-center justify-center text-lg">
                {currentUser.profilePic}
              </div>
              <div className="text-left leading-none">
                <p className="text-xs font-black text-slate-800">{currentUser.name.split(' ')[0]}</p>
                <span className="text-[9px] text-slate-400 font-bold uppercase">{currentUser.role}</span>
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-6 lg:px-8 flex-1 grid md:grid-cols-4 gap-6 py-6">
        
        {/* Navigation Sidebar (Desktop view) */}
        <nav className="hidden md:flex flex-col space-y-2 md:col-span-1 bg-white p-5 rounded-3xl border border-slate-200 h-fit shadow-sm">
          <div className="pb-3 border-b border-slate-100 mb-2">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">NAVIGATION SCHEME</span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full py-2.5 px-4 rounded-2xl text-left text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 translate-x-1' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : item.color}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Quick family creation shortcut if none exists */}
          {!currentFamily && (
            <button
              type="button"
              onClick={() => setActiveTab('FamilySetup')}
              className="mt-6 p-4 bg-indigo-50 hover:bg-indigo-100/80 rounded-2xl border border-indigo-100 text-left transition-all cursor-pointer group space-y-1.5"
            >
              <div className="flex justify-between items-center text-indigo-800">
                <span className="text-xs font-extrabold">Link Family</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[10px] text-indigo-500 leading-normal font-semibold">Join or configure your household circle to unlock multi-device logs.</p>
            </button>
          )}

          {/* Emergency contacts short disclaimer */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest block">🔒 SECURITY CRADLE</span>
            <p className="text-[10px] text-slate-400 leading-normal">
              Emergency contacts remain fully bypassable. Critical lines are reachable 24/7.
            </p>
          </div>
        </nav>

        {/* Content Viewer (Full remaining columns) */}
        <main className="md:col-span-3 bg-white/40 rounded-3xl space-y-6 pb-20 md:pb-0 min-w-0 overflow-hidden">
          


          {/* Tabs Render Routing Switch */}
          {activeTab === 'Dashboard' && (
            <HomeDashboard 
              currentUser={currentUser} 
              onNavigate={(tab) => setActiveTab(tab)} 
              onRefreshUser={refreshUserAndFamily} 
              activeSessionSeconds={activeSessionSeconds}
              onForceSync={forceSyncSessionSeconds}
            />
          )}

          {activeTab === 'Family' && (
            <FamilyOverview 
              currentUser={currentUser} 
              onNavigate={(tab) => setActiveTab(tab)} 
              onViewStats={(userId) => {
                setSelectedStatsUserId(userId);
                setActiveTab('Usage');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {activeTab === 'Chat' && (
            <FamilyGroupChat currentUser={currentUser} />
          )}

          {activeTab === 'FamilySetup' && (
            <CreateFamily 
              currentFamily={currentFamily} 
              currentUser={currentUser} 
              onSuccess={handleFamilySetupSuccess} 
            />
          )}

          {activeTab === 'Usage' && (
            <div className="space-y-6">
              <CategoryTracking 
                currentUser={currentUser} 
                initialSelectedUserId={selectedStatsUserId}
                onSelectedUserChange={(userId) => setSelectedStatsUserId(userId)}
              />
              <WeeklyReport 
                currentUser={currentUser} 
                initialSelectedUserId={selectedStatsUserId} 
                onSelectedUserChange={(userId) => setSelectedStatsUserId(userId)}
              />
            </div>
          )}

          {activeTab === 'Schedules' && (
            <div className="space-y-6">
              <DeviceFreeScheduleView currentUser={currentUser} />
              <EmergencyContactScreen currentUser={currentUser} />
            </div>
          )}

          {activeTab === 'Activities' && (
            <ActivityPlanner currentUser={currentUser} onRefreshNotifications={loadNotifications} />
          )}

          {activeTab === 'Rewards' && (
            <RewardsStreaks currentUser={currentUser} />
          )}

          {activeTab === 'Requests' && (
            <TimeRequest currentUser={currentUser} onRefreshUser={refreshUserAndFamily} />
          )}

          {activeTab === 'Settings' && (
            <SettingsScreen 
              currentUser={currentUser} 
              currentFamily={currentFamily} 
              onLogout={handleLogout} 
              onSwitchProfile={handleSwitchProfile}
              onNavigate={(tab) => setActiveTab(tab)}
              onRefreshUser={refreshUserAndFamily}
            />
          )}

        </main>

      </div>

      {/* Mobile Bottom Navigation (Visible only on portable screens) */}
      <footer className="md:hidden bg-white border-t border-slate-100 fixed bottom-0 left-0 right-0 z-30 shadow-lg px-2 py-1.5 flex justify-around">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${active ? 'text-indigo-600 bg-indigo-50/60 font-black' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-[9px] font-semibold">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
        
        {/* Modern "More Menu" Button */}
        <button
          type="button"
          onClick={() => setShowMobileMenu(true)}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${showMobileMenu ? 'text-indigo-600 bg-indigo-50/60 font-black' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Menu className="w-4 h-4 shrink-0" />
          <span className="text-[9px] font-semibold">More</span>
        </button>
      </footer>

      {/* Mobile Drawer Navigation Menu overlay */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex flex-col justify-end transition-all">
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={() => setShowMobileMenu(false)} />
          
          {/* Drawer container */}
          <div className="relative bg-white rounded-t-[32px] shadow-2xl p-6 pb-8 space-y-6 max-h-[85vh] overflow-y-auto">
            {/* Handle visual */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-2 mb-4" />
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Household Navigation</h3>
                <p className="text-[10px] text-slate-400 font-medium">Select a digital wellness module</p>
              </div>
              <button 
                type="button"
                onClick={() => setShowMobileMenu(false)}
                className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-100"
              >
                Close
              </button>
            </div>

            {/* Bento-style 3x3 Grid of Navigation Schemes */}
            <div className="grid grid-cols-3 gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowMobileMenu(false);
                    }}
                    className={`flex flex-col items-center justify-center text-center p-3 rounded-2xl border transition-all cursor-pointer ${
                      active 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : 'bg-slate-50 border-slate-150 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 ${active ? 'bg-white/20' : 'bg-white border border-slate-200 shadow-sm'}`}>
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : item.color}`} />
                    </div>
                    <span className="text-[10px] font-black tracking-tight leading-tight block truncate w-full">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>


          </div>
        </div>
      )}

    </div>
  );
}
