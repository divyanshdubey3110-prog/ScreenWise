/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Family, ScreenTimeLog, DeviceFreeSchedule, ActivityPoll, OfflineActivity, ExtraTimeRequest, EmergencyContact, DatabaseState, CategoryBreakdown } from './types';

// Detect static/offline deployment context (like GitHub Pages)
let isStaticMode = typeof window !== 'undefined' && (
  window.location.hostname.endsWith('github.io') ||
  window.location.hostname.includes('githubpreview.dev') ||
  localStorage.getItem('screenwise_use_mock_api') === 'true'
);

// Default initial state matching the server database
const DEFAULT_LOCAL_DB: DatabaseState = {
  users: [
    {
      id: 'parent_divyansh',
      name: 'Divyansh Dubey',
      email: 'divyanshdubey3110@gmail.com',
      password: '123456',
      role: 'parent',
      points: 450,
      streak: 12,
      badges: ['Family Time Hero', 'ScreenWise Champion'],
      profilePic: '👨‍💼',
      relation: 'Father',
      dailyGoal: 240,
      usageToday: 190,
      weeklyDigest: true,
      streakAlerts: true,
      privacySync: true,
      darkMode: false,
      familyId: 'fam_dubey'
    },
    {
      id: 'child_rahul',
      name: 'Rahul Dubey',
      email: 'rahul@screenwise.com',
      password: '123456',
      role: 'child',
      points: 340,
      streak: 5,
      badges: ['3-Day Focus Streak', 'Study First Badge'],
      profilePic: '👦',
      relation: 'Son',
      dailyGoal: 120,
      usageToday: 100,
      weeklyDigest: true,
      streakAlerts: true,
      privacySync: true,
      darkMode: false,
      familyId: 'fam_dubey'
    },
    {
      id: 'child_riya',
      name: 'Riya Dubey',
      email: 'riya@screenwise.com',
      password: '123456',
      role: 'child',
      points: 280,
      streak: 3,
      badges: ['Family Time Hero', 'Creative Minds Badge'],
      profilePic: '👧',
      relation: 'Daughter',
      dailyGoal: 90,
      usageToday: 80,
      weeklyDigest: true,
      streakAlerts: true,
      privacySync: true,
      darkMode: false,
      familyId: 'fam_dubey'
    }
  ],
  family: {
    id: 'fam_dubey',
    name: 'Dubey Family',
    inviteCode: 'SW-9842-FAM',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SW-9842-FAM',
    createdBy: 'parent_divyansh'
  },
  families: [
    {
      id: 'fam_dubey',
      name: 'Dubey Family',
      inviteCode: 'SW-9842-FAM',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SW-9842-FAM',
      createdBy: 'parent_divyansh'
    }
  ],
  logs: [
    { id: 'l1', userId: 'child_rahul', date: '2026-06-18', totalMinutes: 150, categories: { education: 40, socialMedia: 30, gaming: 45, entertainment: 25, communication: 10, productivity: 0, other: 0 } },
    { id: 'l2', userId: 'child_rahul', date: '2026-06-19', totalMinutes: 130, categories: { education: 50, socialMedia: 20, gaming: 30, entertainment: 20, communication: 10, productivity: 0, other: 0 } },
    { id: 'l3', userId: 'child_rahul', date: '2026-06-20', totalMinutes: 160, categories: { education: 30, socialMedia: 45, gaming: 40, entertainment: 35, communication: 10, productivity: 0, other: 0 } },
    { id: 'l4', userId: 'child_rahul', date: '2026-06-21', totalMinutes: 180, categories: { education: 20, socialMedia: 50, gaming: 60, entertainment: 30, communication: 20, productivity: 0, other: 0 } },
    { id: 'l5', userId: 'child_rahul', date: '2026-06-22', totalMinutes: 120, categories: { education: 60, socialMedia: 15, gaming: 20, entertainment: 15, communication: 10, productivity: 0, other: 0 } },
    { id: 'l6', userId: 'child_rahul', date: '2026-06-23', totalMinutes: 110, categories: { education: 55, socialMedia: 10, gaming: 15, entertainment: 15, communication: 15, productivity: 0, other: 0 } },
    { id: 'l7', userId: 'child_rahul', date: '2026-06-24', totalMinutes: 100, categories: { education: 45, socialMedia: 20, gaming: 15, entertainment: 10, communication: 10, productivity: 0, other: 0 } },
    { id: 'l8', userId: 'child_riya', date: '2026-06-18', totalMinutes: 90, categories: { education: 30, socialMedia: 5, gaming: 20, entertainment: 30, communication: 5, productivity: 0, other: 0 } },
    { id: 'l9', userId: 'child_riya', date: '2026-06-19', totalMinutes: 80, categories: { education: 40, socialMedia: 0, gaming: 15, entertainment: 20, communication: 5, productivity: 0, other: 0 } },
    { id: 'l10', userId: 'child_riya', date: '2026-06-20', totalMinutes: 110, categories: { education: 20, socialMedia: 10, gaming: 40, entertainment: 40, communication: 0, productivity: 0, other: 0 } },
    { id: 'l11', userId: 'child_riya', date: '2026-06-21', totalMinutes: 120, categories: { education: 15, socialMedia: 10, gaming: 50, entertainment: 45, communication: 0, productivity: 0, other: 0 } },
    { id: 'l12', userId: 'child_riya', date: '2026-06-22', totalMinutes: 70, categories: { education: 35, socialMedia: 0, gaming: 10, entertainment: 20, communication: 5, productivity: 0, other: 0 } },
    { id: 'l13', userId: 'child_riya', date: '2026-06-23', totalMinutes: 85, categories: { education: 45, socialMedia: 5, gaming: 15, entertainment: 20, communication: 0, productivity: 0, other: 0 } },
    { id: 'l14', userId: 'child_riya', date: '2026-06-24', totalMinutes: 80, categories: { education: 40, socialMedia: 5, gaming: 15, entertainment: 20, communication: 0, productivity: 0, other: 0 } },
    { id: 'l15', userId: 'parent_divyansh', date: '2026-06-24', totalMinutes: 190, categories: { education: 40, socialMedia: 50, gaming: 0, entertainment: 30, communication: 40, productivity: 30, other: 0 } }
  ],
  schedules: [
    { id: 'sch1', familyId: 'fam_dubey', title: 'Dinner Time', startTime: '19:30', endTime: '20:30', remindersEnabled: true, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    { id: 'sch2', familyId: 'fam_dubey', title: 'Sleep Time', startTime: '21:30', endTime: '06:30', remindersEnabled: true, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    { id: 'sch3', familyId: 'fam_dubey', title: 'Study Time', startTime: '17:00', endTime: '18:00', remindersEnabled: true, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    { id: 'sch4', familyId: 'fam_dubey', title: 'Sunday Family Time', startTime: '10:00', endTime: '12:00', remindersEnabled: true, days: ['Sun'] }
  ],
  polls: [
    {
      id: 'poll1',
      familyId: 'fam_dubey',
      title: 'Sunday Activity Poll',
      options: [
        { id: 'opt1', title: 'Badminton', votes: ['child_rahul', 'parent_divyansh', 'child_riya'], creatorName: 'Rahul Dubey' },
        { id: 'opt2', title: 'Movie at Home', votes: ['parent_divyansh', 'child_riya'], creatorName: 'Riya Dubey' },
        { id: 'opt3', title: 'Cooking Challenge', votes: ['parent_divyansh'], creatorName: 'Divyansh Dubey' }
      ],
      winningOptionId: null,
      date: '2026-06-28',
      isClosed: false
    }
  ],
  activities: [
    { id: 'act1', familyId: 'fam_dubey', title: 'Family Evening Walk', date: '2026-06-24', status: 'completed', pointsReward: 15, completedBy: ['child_rahul', 'child_riya', 'parent_divyansh'] },
    { id: 'act2', familyId: 'fam_dubey', title: 'Gardening together', date: '2026-06-25', status: 'pending', pointsReward: 20 },
    { id: 'act3', familyId: 'fam_dubey', title: 'Board Games Session', date: '2026-06-26', status: 'pending', pointsReward: 15 }
  ],
  requests: [
    {
      id: 'req1',
      userId: 'child_rahul',
      userName: 'Rahul Dubey',
      requestedMinutes: 30,
      reason: 'I need to finish my school presentation and double-check my slides.',
      category: 'education',
      status: 'pending',
      date: '2026-06-24',
      familyId: 'fam_dubey'
    },
    {
      id: 'req_old1',
      userId: 'child_riya',
      userName: 'Riya Dubey',
      requestedMinutes: 20,
      reason: 'Finishing an art drawing tutorial.',
      category: 'education',
      status: 'approved',
      note: 'Good job on focusing on art!',
      date: '2026-06-23',
      familyId: 'fam_dubey'
    }
  ],
  contacts: [
    { id: 'con1', parentId: 'parent_divyansh', name: 'Uncle Ramesh', relationship: 'Uncle', phoneNumber: '+91 98765 43210', allowedCallingApps: ['Phone', 'WhatsApp'] },
    { id: 'con2', parentId: 'parent_divyansh', name: 'Dr. S. Sharma', relationship: 'Family Doctor', phoneNumber: '+91 98765 12345', allowedCallingApps: ['Phone'] }
  ],
  settings: {
    allowEmergencyCallsRestrictedTime: true,
    familyRoutineCompletion: 71
  },
  appUsages: [
    { id: 'au1', userId: 'child_rahul', date: '2026-06-24', appName: 'Duolingo', category: 'education', minutesUsed: 20 },
    { id: 'au2', userId: 'child_rahul', date: '2026-06-24', appName: 'Khan Academy', category: 'education', minutesUsed: 25 },
    { id: 'au3', userId: 'child_rahul', date: '2026-06-24', appName: 'Instagram', category: 'socialMedia', minutesUsed: 20 },
    { id: 'au4', userId: 'child_rahul', date: '2026-06-24', appName: 'Roblox', category: 'gaming', minutesUsed: 15 },
    { id: 'au5', userId: 'child_rahul', date: '2026-06-24', appName: 'YouTube', category: 'entertainment', minutesUsed: 10 },
    { id: 'au6', userId: 'child_rahul', date: '2026-06-24', appName: 'WhatsApp', category: 'communication', minutesUsed: 10 },
    { id: 'au7', userId: 'child_riya', date: '2026-06-24', appName: 'Photomath', category: 'education', minutesUsed: 25 },
    { id: 'au8', userId: 'child_riya', date: '2026-06-24', appName: 'Wikipedia', category: 'education', minutesUsed: 15 },
    { id: 'au9', userId: 'child_riya', date: '2026-06-24', appName: 'Snapchat', category: 'socialMedia', minutesUsed: 5 },
    { id: 'au10', userId: 'child_riya', date: '2026-06-24', appName: 'Minecraft', category: 'gaming', minutesUsed: 15 },
    { id: 'au11', userId: 'child_riya', date: '2026-06-24', appName: 'Netflix', category: 'entertainment', minutesUsed: 20 },
    { id: 'au12', userId: 'parent_divyansh', date: '2026-06-24', appName: 'Coursera', category: 'education', minutesUsed: 40 },
    { id: 'au13', userId: 'parent_divyansh', date: '2026-06-24', appName: 'LinkedIn', category: 'socialMedia', minutesUsed: 50 },
    { id: 'au14', userId: 'parent_divyansh', date: '2026-06-24', appName: 'YouTube', category: 'entertainment', minutesUsed: 30 },
    { id: 'au15', userId: 'parent_divyansh', date: '2026-06-24', appName: 'WhatsApp', category: 'communication', minutesUsed: 40 },
    { id: 'au16', userId: 'parent_divyansh', date: '2026-06-24', appName: 'Notion', category: 'productivity', minutesUsed: 30 }
  ],
  appTimers: [
    { id: 't1', userId: 'child_rahul', appName: 'Instagram', category: 'socialMedia', limitMinutes: 15, createdBy: 'parent_divyansh' },
    { id: 't2', userId: 'child_rahul', appName: 'Roblox', category: 'gaming', limitMinutes: 30, createdBy: 'parent_divyansh' },
    { id: 't3', userId: 'child_rahul', appName: 'YouTube', category: 'entertainment', limitMinutes: 45, createdBy: 'child_rahul' },
    { id: 't4', userId: 'child_riya', appName: 'Minecraft', category: 'gaming', limitMinutes: 20, createdBy: 'parent_divyansh' },
    { id: 't5', userId: 'child_riya', appName: 'Snapchat', category: 'socialMedia', limitMinutes: 10, createdBy: 'parent_divyansh' }
  ],
  notifications: [
    { id: 'n1', userId: 'child_rahul', message: '⚠️ Instagram limit exceeded! You have used it for 20 minutes (Limit: 15m).', timestamp: '2026-06-24T21:00:00Z', type: 'limit_exceeded', read: false },
    { id: 'n2', userId: 'parent_divyansh', message: '⚠️ Rahul Dubey exceeded his Instagram screen-time limit of 15 minutes today!', timestamp: '2026-06-24T21:00:10Z', type: 'limit_exceeded', read: false }
  ],
  chatMessages: [
    {
      id: 'msg1',
      userId: 'parent_divyansh',
      userName: 'Divyansh Dubey',
      userProfilePic: '👨',
      userRole: 'parent',
      message: 'Hey family, let\'s remember we have a Device-Free block starting at 18:00 today. Let\'s wrap up all tasks and put devices away on time!',
      timestamp: '2026-06-24T17:30:00Z',
      familyId: 'fam_dubey'
    },
    {
      id: 'msg2',
      userId: 'child_rahul',
      userName: 'Rahul Dubey',
      userProfilePic: '🧒',
      userRole: 'child',
      message: 'Sure dad, I\'m just completing my Duolingo streak right now!',
      timestamp: '2026-06-24T17:35:00Z',
      familyId: 'fam_dubey'
    },
    {
      id: 'msg3',
      userId: 'child_riya',
      userName: 'Riya Dubey',
      userProfilePic: '👧',
      userRole: 'child',
      message: 'Okay! Can I ask for 15 more minutes of Minecraft if I finish my math homework early?',
      timestamp: '2026-06-24T17:40:00Z',
      familyId: 'fam_dubey'
    }
  ]
};

// Helper functions for reading and writing to client database
function getLocalDb(): DatabaseState {
  if (typeof window === 'undefined') return DEFAULT_LOCAL_DB;
  const data = localStorage.getItem('screenwise_db_v2');
  if (!data) {
    localStorage.setItem('screenwise_db_v2', JSON.stringify(DEFAULT_LOCAL_DB));
    return DEFAULT_LOCAL_DB;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_LOCAL_DB;
  }
}

function saveLocalDb(db: DatabaseState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('screenwise_db_v2', JSON.stringify(db));
}

function getLocalSessionUserId(): string {
  if (typeof window === 'undefined') return 'parent_divyansh';
  const uId = localStorage.getItem('screenwise_session_uid');
  if (!uId) {
    localStorage.setItem('screenwise_session_uid', 'parent_divyansh');
    return 'parent_divyansh';
  }
  return uId;
}

function setLocalSessionUserId(userId: string | null) {
  if (typeof window === 'undefined') return;
  if (userId) {
    localStorage.setItem('screenwise_session_uid', userId);
  } else {
    localStorage.removeItem('screenwise_session_uid');
  }
}

export const API = {
  // Authentication
  async getMe(): Promise<{ user: User }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const currentSessionUserId = getLocalSessionUserId();
      const user = db.users.find(u => u.id === currentSessionUserId) || db.users[0];
      return { user };
    }
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error('Not OK');
      return await res.json();
    } catch (err) {
      console.warn("Backend API not reachable. Fallback to offline static mode.", err);
      isStaticMode = true;
      localStorage.setItem('screenwise_use_mock_api', 'true');
      const db = getLocalDb();
      const currentSessionUserId = getLocalSessionUserId();
      const user = db.users.find(u => u.id === currentSessionUserId) || db.users[0];
      return { user };
    }
  },

  async login(email: string, password?: string, role?: 'parent' | 'child' | 'admin'): Promise<{ success: boolean; user: User; message?: string; error?: string }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        setLocalSessionUserId(user.id);
        return { success: true, user };
      }
      return { success: false, user: null as any, error: 'User not found in local configuration.' };
    }
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    return res.json();
  },

  async signup(data: { name: string; email: string; password?: string; role: string; relation: string; dailyGoal: number; inviteCode?: string; familyName?: string }): Promise<{ success: boolean; user: User; error?: string }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const userExists = db.users.some(u => u.email.toLowerCase() === data.email.toLowerCase());
      if (userExists) {
        return { success: false, user: null as any, error: 'User with this email already exists.' };
      }
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: data.name,
        email: data.email,
        password: data.password || '123456',
        role: data.role as any,
        points: 100,
        streak: 0,
        badges: [],
        profilePic: data.role === 'parent' ? '👨‍💼' : '🧒',
        relation: data.relation,
        dailyGoal: Number(data.dailyGoal) || 120,
        usageToday: 0,
        weeklyDigest: true,
        streakAlerts: true,
        privacySync: true,
        darkMode: false,
        familyId: data.inviteCode ? 'fam_dubey' : undefined
      };
      db.users.push(newUser);
      saveLocalDb(db);
      setLocalSessionUserId(newUser.id);
      return { success: true, user: newUser };
    }
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async switchProfile(userId: string): Promise<{ success: boolean; user: User }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const user = db.users.find(u => u.id === userId);
      if (user) {
        setLocalSessionUserId(user.id);
        return { success: true, user };
      }
      return { success: false, user: db.users[0] };
    }
    const res = await fetch('/api/auth/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

  async logout(): Promise<{ success: boolean }> {
    if (isStaticMode) {
      setLocalSessionUserId(null);
      return { success: true };
    }
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    return res.json();
  },

  // Family Management
  async getFamily(): Promise<{ family: Family | null; members: User[]; routineCompletion: number }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const currentSessionUserId = getLocalSessionUserId();
      const currentUser = db.users.find(u => u.id === currentSessionUserId);
      const familyId = currentUser?.familyId || 'fam_dubey';
      const family = db.family?.id === familyId ? db.family : null;
      const members = db.users.filter(u => u.familyId === familyId || (!u.familyId && familyId === 'fam_dubey'));
      return { family, members, routineCompletion: db.settings?.familyRoutineCompletion || 71 };
    }
    try {
      const res = await fetch('/api/family');
      if (!res.ok) throw new Error('Not OK');
      return await res.json();
    } catch (err) {
      console.warn("Backend API not reachable. Fallback to offline static family mode.", err);
      isStaticMode = true;
      localStorage.setItem('screenwise_use_mock_api', 'true');
      const db = getLocalDb();
      const currentSessionUserId = getLocalSessionUserId();
      const currentUser = db.users.find(u => u.id === currentSessionUserId);
      const familyId = currentUser?.familyId || 'fam_dubey';
      const family = db.family?.id === familyId ? db.family : null;
      const members = db.users.filter(u => u.familyId === familyId || (!u.familyId && familyId === 'fam_dubey'));
      return { family, members, routineCompletion: db.settings?.familyRoutineCompletion || 71 };
    }
  },

  async createFamily(data: { familyName: string; parentName: string; limitCount: number }): Promise<{ success: boolean; family: Family; members: User[] }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const currentSessionUserId = getLocalSessionUserId();
      const newFam: Family = {
        id: `fam_${Date.now()}`,
        name: data.familyName,
        inviteCode: `SW-${Math.floor(1000 + Math.random() * 9000)}-FAM`,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SW-9842-FAM`,
        createdBy: currentSessionUserId
      };
      db.family = newFam;
      if (!db.families) db.families = [];
      db.families.push(newFam);
      
      db.users.forEach(u => {
        if (u.id === currentSessionUserId) {
          u.familyId = newFam.id;
        }
      });
      saveLocalDb(db);
      const members = db.users.filter(u => u.familyId === newFam.id);
      return { success: true, family: newFam, members };
    }
    const res = await fetch('/api/family/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async joinFamily(inviteCode: string): Promise<{ success: boolean; family: Family }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const currentSessionUserId = getLocalSessionUserId();
      const family = db.families?.find(f => f.inviteCode === inviteCode) || db.family;
      if (family) {
        db.users.forEach(u => {
          if (u.id === currentSessionUserId) {
            u.familyId = family.id;
          }
        });
        saveLocalDb(db);
        return { success: true, family };
      }
      return { success: false, family: db.family };
    }
    const res = await fetch('/api/family/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode })
    });
    return res.json();
  },

  // Screen Time & Category Tracking
  async getLogs(): Promise<{ logs: ScreenTimeLog[] }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const currentSessionUserId = getLocalSessionUserId();
      const currentUser = db.users.find(u => u.id === currentSessionUserId);
      const familyId = currentUser?.familyId || 'fam_dubey';
      const familyMembers = db.users.filter(u => (u.familyId || 'fam_dubey') === familyId);
      const memberIds = familyMembers.map(m => m.id);
      const filteredLogs = db.logs.filter(l => memberIds.includes(l.userId));
      return { logs: filteredLogs };
    }
    const res = await fetch('/api/logs');
    return res.json();
  },

  async incrementUsage(userId: string, minutes: number, category: string, appName?: string): Promise<{ success: boolean; user: User; log: ScreenTimeLog; appUsage?: any; timerExceededMessage?: string }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const user = db.users.find(u => u.id === userId);
      if (user) {
        user.usageToday += minutes;
        user.points += Math.floor(minutes / 2);
      }
      const todayStr = new Date().toISOString().split('T')[0];
      let log = db.logs.find(l => l.userId === userId && l.date === todayStr);
      if (!log) {
        log = {
          id: `log_${Date.now()}`,
          userId,
          date: todayStr,
          totalMinutes: 0,
          categories: { education: 0, socialMedia: 0, gaming: 0, entertainment: 0, communication: 0, productivity: 0, other: 0 }
        };
        db.logs.push(log);
      }
      log.totalMinutes += minutes;
      const cat = (category || 'other') as keyof typeof log.categories;
      if (log.categories[cat] !== undefined) {
        log.categories[cat] += minutes;
      } else {
        log.categories[cat] = minutes;
      }

      if (!db.appUsages) db.appUsages = [];
      let appUsage = db.appUsages.find(au => au.userId === userId && au.appName === appName && au.date === todayStr);
      if (!appUsage) {
        appUsage = {
          id: `au_${Date.now()}`,
          userId,
          date: todayStr,
          appName: appName || 'Other',
          category: (category || 'other') as keyof CategoryBreakdown,
          minutesUsed: 0
        };
        db.appUsages.push(appUsage);
      }
      appUsage.minutesUsed += minutes;

      let timerExceededMessage: string | undefined = undefined;
      const activeTimer = db.appTimers?.find(t => t.userId === userId && t.appName === appName);
      if (activeTimer) {
        const limit = activeTimer.limitMinutes;
        const alreadyNotified = db.notifications?.some(n => n.userId === userId && n.message.includes('exceeded') && n.message.includes(appName || ''));
        if (appUsage.minutesUsed >= limit && !alreadyNotified) {
          timerExceededMessage = `⚠️ Screen-time limit of ${limit} minutes exceeded for ${appName}! You've logged ${appUsage.minutesUsed} mins.`;
          if (!db.notifications) db.notifications = [];
          db.notifications.unshift({
            id: `n_${Date.now()}`,
            userId,
            message: timerExceededMessage,
            timestamp: new Date().toISOString(),
            type: 'limit_exceeded',
            read: false
          });
          const parentUser = db.users.find(u => u.role === 'parent');
          if (parentUser) {
            db.notifications.unshift({
              id: `n_p_${Date.now()}`,
              userId: parentUser.id,
              message: `⚠️ ${user?.name || 'Child'} exceeded their ${appName} limit today (Used: ${appUsage.minutesUsed}m, Limit: ${limit}m).`,
              timestamp: new Date().toISOString(),
              type: 'limit_exceeded',
              read: false
            });
          }
        }
      }

      saveLocalDb(db);
      return { success: true, user: user!, log, appUsage, timerExceededMessage };
    }
    const res = await fetch('/api/logs/increment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, minutes, category, appName })
    });
    return res.json();
  },

  // Schedules
  async getSchedules(): Promise<{ schedules: DeviceFreeSchedule[] }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const currentSessionUserId = getLocalSessionUserId();
      const currentUser = db.users.find(u => u.id === currentSessionUserId);
      const familyId = currentUser?.familyId || 'fam_dubey';
      const filteredSchedules = (db.schedules || []).filter(s => (s.familyId || 'fam_dubey') === familyId);
      return { schedules: filteredSchedules };
    }
    const res = await fetch('/api/schedules');
    return res.json();
  },

  async createSchedule(data: { title: string; startTime: string; endTime: string; days: string[]; remindersEnabled: boolean }): Promise<{ success: boolean; schedule: DeviceFreeSchedule }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const currentSessionUserId = getLocalSessionUserId();
      const currentUser = db.users.find(u => u.id === currentSessionUserId);
      const familyId = currentUser?.familyId || 'fam_dubey';
      const newSch: DeviceFreeSchedule = {
        id: `sch_${Date.now()}`,
        familyId,
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        days: data.days,
        remindersEnabled: data.remindersEnabled
      };
      if (!db.schedules) db.schedules = [];
      db.schedules.push(newSch);
      saveLocalDb(db);
      return { success: true, schedule: newSch };
    }
    const res = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateSchedule(id: string, data: Partial<DeviceFreeSchedule>): Promise<{ success: boolean; schedule: DeviceFreeSchedule }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const idx = db.schedules.findIndex(s => s.id === id);
      if (idx !== -1) {
        db.schedules[idx] = { ...db.schedules[idx], ...data };
        saveLocalDb(db);
        return { success: true, schedule: db.schedules[idx] };
      }
      return { success: false, schedule: {} as any };
    }
    const res = await fetch(`/api/schedules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteSchedule(id: string): Promise<{ success: boolean }> {
    if (isStaticMode) {
      const db = getLocalDb();
      db.schedules = db.schedules.filter(s => s.id !== id);
      saveLocalDb(db);
      return { success: true };
    }
    const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Offline Activities & Polls
  async getActivitiesAndPolls(): Promise<{ activities: OfflineActivity[]; polls: ActivityPoll[] }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const currentSessionUserId = getLocalSessionUserId();
      const currentUser = db.users.find(u => u.id === currentSessionUserId);
      const familyId = currentUser?.familyId || 'fam_dubey';
      const filteredActivities = (db.activities || []).filter(a => (a.familyId || 'fam_dubey') === familyId);
      const filteredPolls = (db.polls || []).filter(p => (p.familyId || 'fam_dubey') === familyId);
      return { activities: filteredActivities, polls: filteredPolls };
    }
    const res = await fetch('/api/activities');
    return res.json();
  },

  async createActivity(data: { title: string; pointsReward: number; date: string; status?: string }): Promise<{ success: boolean; activity: OfflineActivity }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const currentSessionUserId = getLocalSessionUserId();
      const currentUser = db.users.find(u => u.id === currentSessionUserId);
      const familyId = currentUser?.familyId || 'fam_dubey';
      const newAct: OfflineActivity = {
        id: `act_${Date.now()}`,
        familyId,
        title: data.title,
        pointsReward: data.pointsReward,
        date: data.date,
        status: (data.status || 'pending') as any
      };
      if (!db.activities) db.activities = [];
      db.activities.push(newAct);
      saveLocalDb(db);
      return { success: true, activity: newAct };
    }
    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async completeActivity(id: string, userId: string): Promise<{ success: boolean; activity: OfflineActivity; user: User }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const activity = db.activities.find(a => a.id === id);
      const user = db.users.find(u => u.id === userId);
      if (activity && user) {
        activity.status = 'completed';
        if (!activity.completedBy) activity.completedBy = [];
        if (!activity.completedBy.includes(userId)) {
          activity.completedBy.push(userId);
          user.points += activity.pointsReward;
        }
        saveLocalDb(db);
      }
      return { success: true, activity: activity!, user: user! };
    }
    const res = await fetch('/api/activities/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, userId })
    });
    return res.json();
  },

  async createPoll(data: { title: string; options: string[]; date: string }): Promise<{ success: boolean; poll: ActivityPoll }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const currentSessionUserId = getLocalSessionUserId();
      const currentUser = db.users.find(u => u.id === currentSessionUserId);
      const familyId = currentUser?.familyId || 'fam_dubey';
      const newPoll: ActivityPoll = {
        id: `poll_${Date.now()}`,
        familyId,
        title: data.title,
        options: data.options.map((title, i) => ({
          id: `opt_${Date.now()}_${i}`,
          title,
          votes: [],
          creatorName: currentUser?.name || 'Family Member'
        })),
        winningOptionId: null,
        date: data.date,
        isClosed: false
      };
      if (!db.polls) db.polls = [];
      db.polls.push(newPoll);
      saveLocalDb(db);
      return { success: true, poll: newPoll };
    }
    const res = await fetch('/api/polls/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async votePoll(pollId: string, optionId: string, userId: string): Promise<{ success: boolean; poll: ActivityPoll }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const poll = db.polls.find(p => p.id === pollId);
      if (poll) {
        if (poll.isClosed) {
          return { success: false } as any;
        }
        const targetOption = poll.options.find(opt => opt.id === optionId);
        const isUnvoting = targetOption && targetOption.votes.includes(userId);

        if (isUnvoting) {
          targetOption.votes = targetOption.votes.filter(uId => uId !== userId);
          const user = db.users.find(u => u.id === userId);
          if (user) {
            user.points = Math.max(0, user.points - 10);
          }
          if (!db.notifications) db.notifications = [];
          db.notifications.unshift({
            id: `n_vote_remove_${Date.now()}`,
            userId,
            message: 'Vote removed successfully. (10 points deducted)',
            timestamp: new Date().toISOString(),
            type: 'system',
            read: false
          });
        } else {
          const alreadyVotedAny = poll.options.some(opt => opt.votes.includes(userId));
          poll.options.forEach(opt => {
            opt.votes = opt.votes.filter(uId => uId !== userId);
          });
          if (targetOption) {
            targetOption.votes.push(userId);
            if (!alreadyVotedAny) {
              const user = db.users.find(u => u.id === userId);
              if (user) {
                user.points += 10;
              }
            }
          }
          if (!db.notifications) db.notifications = [];
          db.notifications.unshift({
            id: `n_vote_${Date.now()}`,
            userId,
            message: '🎉 Vote registered successfully! (+10 points for participating)',
            timestamp: new Date().toISOString(),
            type: 'goal_reached',
            read: false
          });
        }
        saveLocalDb(db);
        return { success: true, poll };
      }
      return { success: false } as any;
    }
    const res = await fetch('/api/polls/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollId, optionId, userId })
    });
    return res.json();
  },

  async closePoll(pollId: string): Promise<{ success: boolean; poll: ActivityPoll }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const poll = db.polls.find(p => p.id === pollId);
      if (poll) {
        poll.isClosed = true;
        let winningOptId: string | null = null;
        let maxVotes = -1;
        poll.options.forEach(opt => {
          if (opt.votes.length > maxVotes) {
            maxVotes = opt.votes.length;
            winningOptId = opt.id;
          }
        });
        poll.winningOptionId = winningOptId;
        saveLocalDb(db);
        return { success: true, poll };
      }
      return { success: false } as any;
    }
    const res = await fetch('/api/polls/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollId })
    });
    return res.json();
  },

  async deletePoll(id: string): Promise<{ success: boolean }> {
    if (isStaticMode) {
      const db = getLocalDb();
      db.polls = db.polls.filter(p => p.id !== id);
      saveLocalDb(db);
      return { success: true };
    }
    const res = await fetch(`/api/polls/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async deleteActivity(id: string): Promise<{ success: boolean }> {
    if (isStaticMode) {
      const db = getLocalDb();
      db.activities = db.activities.filter(a => a.id !== id);
      saveLocalDb(db);
      return { success: true };
    }
    const res = await fetch(`/api/activities/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Extra Screen Time Requests
  async getRequests(): Promise<{ requests: ExtraTimeRequest[] }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const currentSessionUserId = getLocalSessionUserId();
      const currentUser = db.users.find(u => u.id === currentSessionUserId);
      const familyId = currentUser?.familyId || 'fam_dubey';
      const filteredRequests = (db.requests || []).filter(r => (r.familyId || 'fam_dubey') === familyId);
      return { requests: filteredRequests };
    }
    const res = await fetch('/api/requests');
    return res.json();
  },

  async createRequest(data: { requestedMinutes: number; reason: string; category: string }): Promise<{ success: boolean; request: ExtraTimeRequest }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const currentSessionUserId = getLocalSessionUserId();
      const currentUser = db.users.find(u => u.id === currentSessionUserId);
      const familyId = currentUser?.familyId || 'fam_dubey';
      const newReq: ExtraTimeRequest = {
        id: `req_${Date.now()}`,
        userId: currentSessionUserId,
        userName: currentUser?.name || 'Child',
        familyId,
        requestedMinutes: Number(data.requestedMinutes),
        reason: data.reason,
        category: data.category as any,
        status: 'pending',
        date: new Date().toISOString().split('T')[0]
      };
      if (!db.requests) db.requests = [];
      db.requests.push(newReq);
      saveLocalDb(db);
      return { success: true, request: newReq };
    }
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async respondToRequest(requestId: string, status: 'approved' | 'rejected', note?: string): Promise<{ success: boolean; request: ExtraTimeRequest }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const reqObj = db.requests.find(r => r.id === requestId);
      if (reqObj) {
        reqObj.status = status;
        reqObj.note = note || '';
        if (status === 'approved') {
          const child = db.users.find(u => u.id === reqObj.userId);
          if (child) {
            child.dailyGoal += reqObj.requestedMinutes;
          }
        }
        saveLocalDb(db);
        return { success: true, request: reqObj };
      }
      return { success: false, request: {} as any };
    }
    const res = await fetch('/api/requests/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, status, note })
    });
    return res.json();
  },

  // Emergency Contacts & Restrict Settings
  async getContacts(): Promise<{ contacts: EmergencyContact[]; allowEmergencyCallsRestrictedTime: boolean }> {
    if (isStaticMode) {
      const db = getLocalDb();
      return { contacts: db.contacts || [], allowEmergencyCallsRestrictedTime: db.settings?.allowEmergencyCallsRestrictedTime ?? true };
    }
    const res = await fetch('/api/contacts');
    return res.json();
  },

  async createContact(data: { name: string; relationship: string; phoneNumber: string; allowedCallingApps: string[] }): Promise<{ success: boolean; contact: EmergencyContact }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const currentSessionUserId = getLocalSessionUserId();
      const newCon: EmergencyContact = {
        id: `con_${Date.now()}`,
        parentId: currentSessionUserId,
        name: data.name,
        relationship: data.relationship,
        phoneNumber: data.phoneNumber,
        allowedCallingApps: data.allowedCallingApps
      };
      if (!db.contacts) db.contacts = [];
      db.contacts.push(newCon);
      saveLocalDb(db);
      return { success: true, contact: newCon };
    }
    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateContact(id: string, data: Partial<EmergencyContact>): Promise<{ success: boolean; contact: EmergencyContact }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const idx = db.contacts.findIndex(c => c.id === id);
      if (idx !== -1) {
        db.contacts[idx] = { ...db.contacts[idx], ...data };
        saveLocalDb(db);
        return { success: true, contact: db.contacts[idx] };
      }
      return { success: false, contact: {} as any };
    }
    const res = await fetch(`/api/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteContact(id: string): Promise<{ success: boolean }> {
    if (isStaticMode) {
      const db = getLocalDb();
      db.contacts = db.contacts.filter(c => c.id !== id);
      saveLocalDb(db);
      return { success: true };
    }
    const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async toggleEmergencyCalls(allow: boolean): Promise<{ success: boolean; allowEmergencyCallsRestrictedTime: boolean }> {
    if (isStaticMode) {
      const db = getLocalDb();
      if (!db.settings) db.settings = { allowEmergencyCallsRestrictedTime: true, familyRoutineCompletion: 71 };
      db.settings.allowEmergencyCallsRestrictedTime = allow;
      saveLocalDb(db);
      return { success: true, allowEmergencyCallsRestrictedTime: allow };
    }
    const res = await fetch('/api/settings/toggle-emergency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allow })
    });
    return res.json();
  },

  // App Usages and Timers and Notifications additions
  async getAppUsages(): Promise<{ appUsages: any[] }> {
    if (isStaticMode) {
      const db = getLocalDb();
      return { appUsages: db.appUsages || [] };
    }
    const res = await fetch('/api/app-usages');
    return res.json();
  },

  async getAppTimers(): Promise<{ appTimers: any[] }> {
    if (isStaticMode) {
      const db = getLocalDb();
      return { appTimers: db.appTimers || [] };
    }
    const res = await fetch('/api/app-timers');
    return res.json();
  },

  async createAppTimer(data: { userId: string; appName: string; category: string; limitMinutes: number }): Promise<{ success: boolean; timer: any }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const currentSessionUserId = getLocalSessionUserId();
      const newTimer = {
        id: `t_${Date.now()}`,
        userId: data.userId,
        appName: data.appName,
        category: data.category as keyof CategoryBreakdown,
        limitMinutes: Number(data.limitMinutes),
        createdBy: currentSessionUserId
      };
      if (!db.appTimers) db.appTimers = [];
      db.appTimers.push(newTimer);
      saveLocalDb(db);
      return { success: true, timer: newTimer };
    }
    const res = await fetch('/api/app-timers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteAppTimer(id: string): Promise<{ success: boolean }> {
    if (isStaticMode) {
      const db = getLocalDb();
      db.appTimers = db.appTimers.filter(t => t.id !== id);
      saveLocalDb(db);
      return { success: true };
    }
    const res = await fetch(`/api/app-timers/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async getNotifications(): Promise<{ notifications: any[]; allNotifications: any[] }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const currentSessionUserId = getLocalSessionUserId();
      const userNotifications = (db.notifications || []).filter(n => n.userId === currentSessionUserId);
      return { notifications: userNotifications, allNotifications: db.notifications || [] };
    }
    const res = await fetch('/api/notifications');
    return res.json();
  },

  async markNotificationsRead(): Promise<{ success: boolean }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const currentSessionUserId = getLocalSessionUserId();
      (db.notifications || []).forEach(n => {
        if (n.userId === currentSessionUserId) {
          n.read = true;
        }
      });
      saveLocalDb(db);
      return { success: true };
    }
    const res = await fetch('/api/notifications/read', { method: 'POST' });
    return res.json();
  },

  // Group Chat Additions
  async getChatMessages(): Promise<{ chatMessages: any[] }> {
    if (isStaticMode) {
      const db = getLocalDb();
      return { chatMessages: db.chatMessages || [] };
    }
    const res = await fetch('/api/chat');
    return res.json();
  },

  async sendChatMessage(message: string): Promise<{ success: boolean; message: any }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const currentSessionUserId = getLocalSessionUserId();
      const currentUser = db.users.find(u => u.id === currentSessionUserId);
      const familyId = currentUser?.familyId || 'fam_dubey';
      const newMsg = {
        id: `msg_${Date.now()}`,
        userId: currentSessionUserId,
        userName: currentUser?.name || 'User',
        userProfilePic: currentUser?.profilePic || '👤',
        userRole: currentUser?.role || 'child',
        message: message,
        timestamp: new Date().toISOString(),
        familyId
      };
      if (!db.chatMessages) db.chatMessages = [];
      db.chatMessages.push(newMsg);
      saveLocalDb(db);
      return { success: true, message: newMsg };
    }
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    return res.json();
  },

  async updateProfilePic(userId: string, profilePic: string): Promise<{ success: boolean; user: User }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const user = db.users.find(u => u.id === userId);
      if (user) {
        user.profilePic = profilePic;
        saveLocalDb(db);
      }
      return { success: true, user: user! };
    }
    const res = await fetch('/api/users/update-profile-pic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, profilePic })
    });
    return res.json();
  },

  async updateUserSettings(
    userId: string, 
    settings: { weeklyDigest?: boolean; streakAlerts?: boolean; privacySync?: boolean; darkMode?: boolean }
  ): Promise<{ success: boolean; user: User }> {
    if (isStaticMode) {
      const db = getLocalDb();
      const user = db.users.find(u => u.id === userId);
      if (user) {
        if (settings.weeklyDigest !== undefined) user.weeklyDigest = settings.weeklyDigest;
        if (settings.streakAlerts !== undefined) user.streakAlerts = settings.streakAlerts;
        if (settings.privacySync !== undefined) user.privacySync = settings.privacySync;
        if (settings.darkMode !== undefined) user.darkMode = settings.darkMode;
        saveLocalDb(db);
      }
      return { success: true, user: user! };
    }
    const res = await fetch('/api/users/update-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...settings })
    });
    return res.json();
  }
};
