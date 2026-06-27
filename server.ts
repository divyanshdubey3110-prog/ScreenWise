/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { DatabaseState, User, Family, ScreenTimeLog, DeviceFreeSchedule, ActivityPoll, OfflineActivity, ExtraTimeRequest, EmergencyContact, SystemSettings } from './src/types';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}

// Initial Database State
const INITIAL_DB: DatabaseState = {
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
      dailyGoal: 240, // 4 hours
      usageToday: 190, // 3 hr 10 min
      weeklyDigest: true,
      streakAlerts: true,
      privacySync: true,
      darkMode: false,
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
      dailyGoal: 120, // 2 hours
      usageToday: 100, // 1 hr 40 min
      weeklyDigest: true,
      streakAlerts: true,
      privacySync: true,
      darkMode: false,
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
      dailyGoal: 90, // 1.5 hours
      usageToday: 80, // 1 hr 20 min
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
    // Rahul's Logs for past 7 days
    { id: 'l1', userId: 'child_rahul', date: '2026-06-18', totalMinutes: 150, categories: { education: 40, socialMedia: 30, gaming: 45, entertainment: 25, communication: 10, productivity: 0, other: 0 } },
    { id: 'l2', userId: 'child_rahul', date: '2026-06-19', totalMinutes: 130, categories: { education: 50, socialMedia: 20, gaming: 30, entertainment: 20, communication: 10, productivity: 0, other: 0 } },
    { id: 'l3', userId: 'child_rahul', date: '2026-06-20', totalMinutes: 160, categories: { education: 30, socialMedia: 45, gaming: 40, entertainment: 35, communication: 10, productivity: 0, other: 0 } },
    { id: 'l4', userId: 'child_rahul', date: '2026-06-21', totalMinutes: 180, categories: { education: 20, socialMedia: 50, gaming: 60, entertainment: 30, communication: 20, productivity: 0, other: 0 } },
    { id: 'l5', userId: 'child_rahul', date: '2026-06-22', totalMinutes: 120, categories: { education: 60, socialMedia: 15, gaming: 20, entertainment: 15, communication: 10, productivity: 0, other: 0 } },
    { id: 'l6', userId: 'child_rahul', date: '2026-06-23', totalMinutes: 110, categories: { education: 55, socialMedia: 10, gaming: 15, entertainment: 15, communication: 15, productivity: 0, other: 0 } },
    { id: 'l7', userId: 'child_rahul', date: '2026-06-24', totalMinutes: 100, categories: { education: 45, socialMedia: 20, gaming: 15, entertainment: 10, communication: 10, productivity: 0, other: 0 } },

    // Riya's Logs for past 7 days
    { id: 'l8', userId: 'child_riya', date: '2026-06-18', totalMinutes: 90, categories: { education: 30, socialMedia: 5, gaming: 20, entertainment: 30, communication: 5, productivity: 0, other: 0 } },
    { id: 'l9', userId: 'child_riya', date: '2026-06-19', totalMinutes: 80, categories: { education: 40, socialMedia: 0, gaming: 15, entertainment: 20, communication: 5, productivity: 0, other: 0 } },
    { id: 'l10', userId: 'child_riya', date: '2026-06-20', totalMinutes: 110, categories: { education: 20, socialMedia: 10, gaming: 40, entertainment: 40, communication: 0, productivity: 0, other: 0 } },
    { id: 'l11', userId: 'child_riya', date: '2026-06-21', totalMinutes: 120, categories: { education: 15, socialMedia: 10, gaming: 50, entertainment: 45, communication: 0, productivity: 0, other: 0 } },
    { id: 'l12', userId: 'child_riya', date: '2026-06-22', totalMinutes: 70, categories: { education: 35, socialMedia: 0, gaming: 10, entertainment: 20, communication: 5, productivity: 0, other: 0 } },
    { id: 'l13', userId: 'child_riya', date: '2026-06-23', totalMinutes: 85, categories: { education: 45, socialMedia: 5, gaming: 15, entertainment: 20, communication: 0, productivity: 0, other: 0 } },
    { id: 'l14', userId: 'child_riya', date: '2026-06-24', totalMinutes: 80, categories: { education: 40, socialMedia: 5, gaming: 15, entertainment: 20, communication: 0, productivity: 0, other: 0 } },

    // Parent Logs
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
      date: '2026-06-24'
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
      date: '2026-06-23'
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
    // Rahul's today app usages
    { id: 'au1', userId: 'child_rahul', date: '2026-06-24', appName: 'Duolingo', category: 'education', minutesUsed: 20 },
    { id: 'au2', userId: 'child_rahul', date: '2026-06-24', appName: 'Khan Academy', category: 'education', minutesUsed: 25 },
    { id: 'au3', userId: 'child_rahul', date: '2026-06-24', appName: 'Instagram', category: 'socialMedia', minutesUsed: 20 },
    { id: 'au4', userId: 'child_rahul', date: '2026-06-24', appName: 'Roblox', category: 'gaming', minutesUsed: 15 },
    { id: 'au5', userId: 'child_rahul', date: '2026-06-24', appName: 'YouTube', category: 'entertainment', minutesUsed: 10 },
    { id: 'au6', userId: 'child_rahul', date: '2026-06-24', appName: 'WhatsApp', category: 'communication', minutesUsed: 10 },

    // Riya's today app usages
    { id: 'au7', userId: 'child_riya', date: '2026-06-24', appName: 'Photomath', category: 'education', minutesUsed: 25 },
    { id: 'au8', userId: 'child_riya', date: '2026-06-24', appName: 'Wikipedia', category: 'education', minutesUsed: 15 },
    { id: 'au9', userId: 'child_riya', date: '2026-06-24', appName: 'Snapchat', category: 'socialMedia', minutesUsed: 5 },
    { id: 'au10', userId: 'child_riya', date: '2026-06-24', appName: 'Minecraft', category: 'gaming', minutesUsed: 15 },
    { id: 'au11', userId: 'child_riya', date: '2026-06-24', appName: 'Netflix', category: 'entertainment', minutesUsed: 20 },

    // Parent's today app usages
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

// Database helper functions
const readDb = (): DatabaseState => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
      return INITIAL_DB;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const state = JSON.parse(data) as DatabaseState;
    
    // Safety check / migrate missing keys
    let migrated = false;
    if (!state.appUsages) {
      state.appUsages = INITIAL_DB.appUsages;
      migrated = true;
    }
    if (!state.appTimers) {
      state.appTimers = INITIAL_DB.appTimers;
      migrated = true;
    }
    if (!state.notifications) {
      state.notifications = INITIAL_DB.notifications;
      migrated = true;
    }
    if (!state.chatMessages) {
      state.chatMessages = INITIAL_DB.chatMessages || [];
      migrated = true;
    }
    state.chatMessages.forEach(msg => {
      if (!msg.familyId) {
        msg.familyId = 'fam_dubey';
        migrated = true;
      }
    });
    if (!state.families) {
      state.families = state.family ? [state.family] : [{
        id: 'fam_dubey',
        name: 'Dubey Family',
        inviteCode: 'SW-9842-FAM',
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SW-9842-FAM',
        createdBy: 'parent_divyansh'
      }];
      migrated = true;
    }
    state.users.forEach(u => {
      if (!u.familyId) {
        u.familyId = 'fam_dubey';
        migrated = true;
      }
    });
    if (state.requests) {
      state.requests.forEach(r => {
        if (!r.familyId) {
          r.familyId = 'fam_dubey';
          migrated = true;
        }
      });
    }
    if (migrated) {
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    }
    return state;
  } catch (err) {
    console.error('Error reading DB:', err);
    return INITIAL_DB;
  }
};

const writeDb = (state: DatabaseState): void => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB:', err);
  }
};

// Express Middlewares
app.use(express.json());

// Session active user simulated state
let currentSessionUserId = ''; // start unauthenticated so they can see the beautiful login/register page initially

// API Routes

// Authentication & Switching Profile API
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  const db = readDb();
  
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please enter both email and password' });
  }

  // Find user by email
  const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  
  if (!user) {
    return res.status(401).json({ success: false, error: 'No user found with this email address' });
  }

  const expectedPassword = user.password || '123456';
  if (expectedPassword !== password) {
    return res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });
  }

  currentSessionUserId = user.id;
  return res.json({ success: true, user });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, role, relation, dailyGoal, inviteCode, familyName } = req.body;
  const db = readDb();

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, error: 'Email address is already registered' });
  }

  // Find or create family association
  let assignedFamilyId = '';

  if (inviteCode && inviteCode.trim()) {
    const code = inviteCode.trim().toUpperCase();
    const foundFamily = db.families?.find(f => f.inviteCode.toUpperCase() === code) || 
                        (db.family && db.family.inviteCode.toUpperCase() === code ? db.family : null);
    if (!foundFamily) {
      return res.status(400).json({ success: false, error: 'Invalid family invitation code' });
    }
    assignedFamilyId = foundFamily.id;
  } else if (familyName && familyName.trim()) {
    // Create a new family!
    const newInviteCode = `SW-${Math.floor(1000 + Math.random() * 9000)}-FAM`;
    const newFamily = {
      id: `fam_${Date.now()}`,
      name: familyName.trim(),
      inviteCode: newInviteCode,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${newInviteCode}`,
      createdBy: `u_${Date.now()}` // temporary, updated to user's real ID below
    };
    if (!db.families) {
      db.families = [];
    }
    db.families.push(newFamily);
    assignedFamilyId = newFamily.id;
  } else if (role === 'parent') {
    // Auto-create family if parent doesn't specify one
    const autoFamilyName = `${name.trim()}'s Family`;
    const newInviteCode = `SW-${Math.floor(1000 + Math.random() * 9000)}-FAM`;
    const newFamily = {
      id: `fam_${Date.now()}`,
      name: autoFamilyName,
      inviteCode: newInviteCode,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${newInviteCode}`,
      createdBy: `u_${Date.now()}`
    };
    if (!db.families) {
      db.families = [];
    }
    db.families.push(newFamily);
    assignedFamilyId = newFamily.id;
  } else {
    return res.status(400).json({ success: false, error: 'Family invitation code is required for child registration' });
  }

  const newUser: User = {
    id: `u_${Date.now()}`,
    name,
    email: email.trim().toLowerCase(),
    password: password,
    role: role || 'child',
    points: 0,
    streak: 1,
    badges: [],
    profilePic: role === 'parent' ? '👨‍💼' : '👦',
    relation: relation || (role === 'parent' ? 'Parent' : 'Child'),
    dailyGoal: Number(dailyGoal) || (role === 'parent' ? 240 : 120),
    usageToday: 0,
    familyId: assignedFamilyId
  };

  db.users.push(newUser);
  currentSessionUserId = newUser.id;

  // Correct createdBy on the newly created family
  if (db.families) {
    const fam = db.families.find(f => f.id === assignedFamilyId);
    if (fam && fam.createdBy.startsWith('u_')) {
      fam.createdBy = newUser.id;
    }
  }

  writeDb(db);

  return res.json({ success: true, user: newUser });
});

app.get('/api/auth/me', (req, res) => {
  const db = readDb();
  const user = db.users.find(u => u.id === currentSessionUserId) || null;
  res.json({ user });
});

app.post('/api/auth/switch', (req, res) => {
  const { userId } = req.body;
  const db = readDb();
  const user = db.users.find(u => u.id === userId);
  if (user) {
    currentSessionUserId = userId;
    return res.json({ success: true, user });
  }
  return res.status(404).json({ error: 'User not found' });
});

app.post('/api/auth/logout', (req, res) => {
  currentSessionUserId = '';
  res.json({ success: true });
});

// Family API
app.get('/api/family', (req, res) => {
  const db = readDb();
  const currentUser = db.users.find(u => u.id === currentSessionUserId);
  const familyId = currentUser?.familyId || 'fam_dubey';
  const family = db.families?.find(f => f.id === familyId) || db.family || db.families?.[0];
  const members = db.users.filter(u => u.familyId === familyId);
  res.json({
    family,
    members,
    routineCompletion: db.settings.familyRoutineCompletion
  });
});

app.post('/api/family/create', (req, res) => {
  const { familyName, parentName, limitCount } = req.body;
  const db = readDb();

  const inviteCode = `SW-${Math.floor(1000 + Math.random() * 9000)}-FAM`;
  const newFamily = {
    id: `fam_${Date.now()}`,
    name: familyName,
    inviteCode,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${inviteCode}`,
    createdBy: currentSessionUserId
  };

  if (!db.families) {
    db.families = [];
  }
  db.families.push(newFamily);
  db.family = newFamily;

  // Ensure current user is parent and associated with this new family
  const currentUserIndex = db.users.findIndex(u => u.id === currentSessionUserId);
  if (currentUserIndex > -1) {
    db.users[currentUserIndex].name = parentName || db.users[currentUserIndex].name;
    db.users[currentUserIndex].role = 'parent';
    db.users[currentUserIndex].familyId = newFamily.id;
  }

  writeDb(db);
  const members = db.users.filter(u => u.familyId === newFamily.id);
  res.json({ success: true, family: newFamily, members });
});

app.post('/api/family/join', (req, res) => {
  const { inviteCode } = req.body;
  const db = readDb();
  
  const code = (inviteCode || '').trim().toUpperCase();
  const foundFamily = db.families?.find(f => f.inviteCode.toUpperCase() === code) || 
                      (db.family && db.family.inviteCode.toUpperCase() === code ? db.family : null);
                      
  if (foundFamily) {
    const currentUser = db.users.find(u => u.id === currentSessionUserId);
    if (currentUser) {
      currentUser.familyId = foundFamily.id;
      writeDb(db);
    }
    return res.json({ success: true, family: foundFamily });
  }
  return res.status(400).json({ error: 'Invalid invitation code' });
});

app.post('/api/family/remove-member', (req, res) => {
  const { userId } = req.body;
  const db = readDb();
  
  const currentUser = db.users.find(u => u.id === currentSessionUserId);
  const familyId = currentUser?.familyId;
  const family = db.families?.find(f => f.id === familyId) || db.family;
  
  if (!family) {
    return res.status(400).json({ error: 'No active family group found' });
  }
  
  if (family.createdBy !== currentSessionUserId) {
    return res.status(403).json({ error: 'Only the family creator can remove members.' });
  }
  
  const targetUserIndex = db.users.findIndex(u => u.id === userId);
  if (targetUserIndex > -1) {
    if (db.users[targetUserIndex].id === currentSessionUserId) {
      return res.status(400).json({ error: 'You cannot remove yourself from the family.' });
    }
    
    // Clear familyId of target user so they are no longer in the family group
    db.users[targetUserIndex].familyId = undefined;
    writeDb(db);
    return res.json({ success: true });
  }
  
  return res.status(404).json({ error: 'User not found in this family.' });
});

// Screen Time Logging API (including simulated increment for active feel!)
app.get('/api/logs', (req, res) => {
  const db = readDb();
  res.json({ logs: db.logs });
});

app.post('/api/logs/increment', (req, res) => {
  const { userId, minutes, category, appName } = req.body;
  const db = readDb();
  
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.usageToday += minutes;

  // Find or create screen-time log for today
  const todayStr = '2026-06-24'; // Using local metadata year as reference anchor
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
  const cat = category as keyof typeof log.categories;
  if (log.categories[cat] !== undefined) {
    log.categories[cat] += minutes;
  } else {
    log.categories.other += minutes;
  }

  // Handle specific App Usage
  let appNameSelected = appName;
  if (!appNameSelected) {
    const defaultApps: Record<string, string> = {
      education: 'Duolingo',
      socialMedia: 'Instagram',
      gaming: 'Roblox',
      entertainment: 'YouTube',
      communication: 'WhatsApp',
      productivity: 'Notion',
      other: 'Settings'
    };
    appNameSelected = defaultApps[cat] || 'Settings';
  }

  let appUsage = db.appUsages.find(au => au.userId === userId && au.appName.toLowerCase() === appNameSelected.toLowerCase() && au.date === todayStr);
  if (!appUsage) {
    appUsage = {
      id: `au_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      appName: appNameSelected,
      category: cat,
      minutesUsed: 0,
      date: todayStr
    };
    db.appUsages.push(appUsage);
  }
  appUsage.minutesUsed += minutes;

  // Check App Timer Exceeded
  const activeTimer = db.appTimers.find(at => at.userId === userId && at.appName.toLowerCase() === appNameSelected.toLowerCase());
  let timerExceededMessage = '';
  if (activeTimer) {
    if (appUsage.minutesUsed >= activeTimer.limitMinutes) {
      // Check if we already created an alert today for this app
      const alreadyNotified = db.notifications.some(
        n => n.userId === userId && 
        n.message.includes(appNameSelected) && 
        n.message.includes('exceeded') && 
        n.timestamp.startsWith(todayStr)
      );

      if (!alreadyNotified) {
        timerExceededMessage = `⚠️ Screen-time limit of ${activeTimer.limitMinutes} minutes exceeded for ${appNameSelected}! You've logged ${appUsage.minutesUsed} mins.`;
        
        // Notify child
        db.notifications.unshift({
          id: `n_${Date.now()}_c`,
          userId,
          message: timerExceededMessage,
          timestamp: new Date().toISOString(),
          type: 'limit_exceeded',
          read: false
        });

        // Notify parents
        db.users.filter(u => u.role === 'parent').forEach(p => {
          db.notifications.unshift({
            id: `n_${Date.now()}_p_${p.id}`,
            userId: p.id,
            message: `⚠️ ${user.name} exceeded their ${appNameSelected} limit today (Used: ${appUsage.minutesUsed}m, Limit: ${activeTimer.limitMinutes}m).`,
            timestamp: new Date().toISOString(),
            type: 'limit_exceeded',
            read: false
          });
        });
      }
    }
  }

  writeDb(db);
  res.json({ success: true, user, log, appUsage, timerExceededMessage });
});

// Schedules API
app.get('/api/schedules', (req, res) => {
  const db = readDb();
  res.json({ schedules: db.schedules });
});

app.post('/api/schedules', (req, res) => {
  const { title, startTime, endTime, days, remindersEnabled } = req.body;
  const db = readDb();

  const newSchedule: DeviceFreeSchedule = {
    id: `sch_${Date.now()}`,
    familyId: db.family?.id || 'fam_dubey',
    title,
    startTime,
    endTime,
    days: days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    remindersEnabled: remindersEnabled !== undefined ? remindersEnabled : true
  };

  db.schedules.push(newSchedule);
  writeDb(db);
  res.json({ success: true, schedule: newSchedule });
});

app.put('/api/schedules/:id', (req, res) => {
  const { id } = req.params;
  const { title, startTime, endTime, days, remindersEnabled } = req.body;
  const db = readDb();

  const idx = db.schedules.findIndex(s => s.id === id);
  if (idx > -1) {
    db.schedules[idx] = {
      ...db.schedules[idx],
      title: title || db.schedules[idx].title,
      startTime: startTime || db.schedules[idx].startTime,
      endTime: endTime || db.schedules[idx].endTime,
      days: days || db.schedules[idx].days,
      remindersEnabled: remindersEnabled !== undefined ? remindersEnabled : db.schedules[idx].remindersEnabled
    };
    writeDb(db);
    return res.json({ success: true, schedule: db.schedules[idx] });
  }
  return res.status(404).json({ error: 'Schedule not found' });
});

app.delete('/api/schedules/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();

  const initialLen = db.schedules.length;
  db.schedules = db.schedules.filter(s => s.id !== id);
  
  if (db.schedules.length < initialLen) {
    writeDb(db);
    return res.json({ success: true });
  }
  return res.status(404).json({ error: 'Schedule not found' });
});

// Activity Planner & Poll API
app.get('/api/activities', (req, res) => {
  const db = readDb();
  res.json({ activities: db.activities, polls: db.polls });
});

app.post('/api/activities', (req, res) => {
  const { title, pointsReward, date, status } = req.body;
  const db = readDb();

  const newActivity: OfflineActivity = {
    id: `act_${Date.now()}`,
    familyId: db.family?.id || 'fam_dubey',
    title,
    date: date || '2026-06-25',
    status: status || 'pending',
    pointsReward: Number(pointsReward) || 15
  };

  db.activities.push(newActivity);
  writeDb(db);
  res.json({ success: true, activity: newActivity });
});

app.delete('/api/activities/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const initialLength = db.activities.length;
  db.activities = db.activities.filter(a => a.id !== id);
  if (db.activities.length < initialLength) {
    writeDb(db);
    return res.json({ success: true });
  }
  return res.status(404).json({ error: 'Activity not found' });
});

app.post('/api/activities/complete', (req, res) => {
  const { id, userId } = req.body;
  const db = readDb();

  const activity = db.activities.find(a => a.id === id);
  if (activity) {
    activity.status = 'completed';
    if (!activity.completedBy) activity.completedBy = [];
    if (!activity.completedBy.includes(userId)) {
      activity.completedBy.push(userId);
    }

    // Award points to user
    const user = db.users.find(u => u.id === userId);
    if (user) {
      user.points += activity.pointsReward;
      
      // Also add points log/streak check
      if (user.streak < 7) {
        user.streak += 1;
      }
      
      // Unlock badge triggers for presentation
      if (user.points >= 400 && !user.badges.includes('ScreenWise Champion')) {
        user.badges.push('ScreenWise Champion');
      }
    }

    writeDb(db);
    return res.json({ success: true, activity, user });
  }
  return res.status(404).json({ error: 'Activity not found' });
});

app.post('/api/polls/create', (req, res) => {
  const { title, options, date } = req.body; // options is array of strings
  const db = readDb();

  const creator = db.users.find(u => u.id === currentSessionUserId);
  const creatorName = creator ? creator.name : 'Family Member';

  const newPoll: ActivityPoll = {
    id: `poll_${Date.now()}`,
    familyId: db.family?.id || 'fam_dubey',
    title,
    options: (options || []).map((optTitle: string, i: number) => ({
      id: `opt_${Date.now()}_${i}`,
      title: optTitle,
      votes: [],
      creatorName
    })),
    winningOptionId: null,
    date: date || '2026-06-28',
    isClosed: false
  };

  db.polls.push(newPoll);
  writeDb(db);
  res.json({ success: true, poll: newPoll });
});

app.delete('/api/polls/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const initialLength = db.polls.length;
  db.polls = db.polls.filter(p => p.id !== id);
  if (db.polls.length < initialLength) {
    writeDb(db);
    return res.json({ success: true });
  }
  return res.status(404).json({ error: 'Poll not found' });
});

app.post('/api/polls/vote', (req, res) => {
  const { pollId, optionId, userId } = req.body;
  const db = readDb();

  const poll = db.polls.find(p => p.id === pollId);
  if (!poll) {
    return res.status(404).json({ error: 'Poll not found' });
  }

  if (poll.isClosed) {
    return res.status(400).json({ error: 'Poll is closed' });
  }

  // Check if user already voted for this specific option
  const targetOption = poll.options.find(opt => opt.id === optionId);
  const isUnvoting = targetOption && targetOption.votes.includes(userId);

  if (isUnvoting) {
    // Unvote!
    targetOption.votes = targetOption.votes.filter(uId => uId !== userId);
    
    // Deduct points
    const user = db.users.find(u => u.id === userId);
    if (user) {
      user.points = Math.max(0, user.points - 10);
    }

    // Add unvote notification to top warning bar
    db.notifications.unshift({
      id: `n_vote_remove_${Date.now()}`,
      userId,
      message: 'Vote removed successfully. (10 points deducted)',
      timestamp: new Date().toISOString(),
      type: 'system',
      read: false
    });

    writeDb(db);
    return res.json({ success: true, poll });
  } else {
    // Check if the user had already voted for some other option in this poll
    const alreadyVotedAny = poll.options.some(opt => opt.votes.includes(userId));

    // Remove previous vote from any option in this poll for this user
    poll.options.forEach(opt => {
      opt.votes = opt.votes.filter(uId => uId !== userId);
    });

    if (targetOption) {
      targetOption.votes.push(userId);
      
      // Add points for voting if they haven't voted in this poll yet
      if (!alreadyVotedAny) {
        const user = db.users.find(u => u.id === userId);
        if (user) {
          user.points += 10;
        }
      }
    }

    // Add vote notification to top warning bar
    db.notifications.unshift({
      id: `n_vote_${Date.now()}`,
      userId,
      message: '🎉 Vote registered successfully! (+10 points for participating)',
      timestamp: new Date().toISOString(),
      type: 'goal_reached',
      read: false
    });

    writeDb(db);
    return res.json({ success: true, poll });
  }
});

app.post('/api/polls/close', (req, res) => {
  const { pollId } = req.body;
  const db = readDb();

  const poll = db.polls.find(p => p.id === pollId);
  if (!poll) {
    return res.status(404).json({ error: 'Poll not found' });
  }

  poll.isClosed = true;

  // Determine winning option
  let maxVotes = -1;
  let winnerId: string | null = null;
  let winnerTitle = '';

  poll.options.forEach(opt => {
    if (opt.votes.length > maxVotes) {
      maxVotes = opt.votes.length;
      winnerId = opt.id;
      winnerTitle = opt.title;
    }
  });

  poll.winningOptionId = winnerId;

  // Create an offline activity for the winning item in calendar!
  if (winnerId) {
    const newActivity: OfflineActivity = {
      id: `act_${Date.now()}`,
      familyId: poll.familyId,
      title: `${winnerTitle} (Winning Activity)`,
      date: poll.date,
      status: 'pending',
      pointsReward: 25
    };
    db.activities.push(newActivity);
  }

  writeDb(db);
  res.json({ success: true, poll });
});

// Extra Time Request API
app.get('/api/requests', (req, res) => {
  const db = readDb();
  const currentUser = db.users.find(u => u.id === currentSessionUserId);
  const familyId = currentUser?.familyId || 'fam_dubey';
  const filtered = (db.requests || []).filter(r => (r.familyId || 'fam_dubey') === familyId);
  res.json({ requests: filtered });
});

app.post('/api/requests', (req, res) => {
  const { requestedMinutes, reason, category } = req.body;
  const db = readDb();

  const currentUser = db.users.find(u => u.id === currentSessionUserId);
  if (!currentUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const newRequest: ExtraTimeRequest = {
    id: `req_${Date.now()}`,
    userId: currentSessionUserId,
    userName: currentUser.name,
    familyId: currentUser.familyId || 'fam_dubey',
    requestedMinutes: Number(requestedMinutes),
    reason,
    category: category || 'education',
    status: 'pending',
    date: '2026-06-24'
  };

  db.requests.unshift(newRequest); // put newest first
  writeDb(db);
  res.json({ success: true, request: newRequest });
});

app.post('/api/requests/respond', (req, res) => {
  const { requestId, status, note } = req.body; // status: 'approved' | 'rejected'
  const db = readDb();

  const currentUser = db.users.find(u => u.id === currentSessionUserId);
  if (!currentUser || currentUser.role !== 'parent') {
    return res.status(403).json({ error: 'Unauthorized: Only parents can approve or reject requests' });
  }

  const reqObj = db.requests.find(r => r.id === requestId);
  if (!reqObj) {
    return res.status(404).json({ error: 'Request not found' });
  }

  reqObj.status = status;
  reqObj.note = note || '';

  // If approved, update user's screen-time goal or today's allowed limit!
  if (status === 'approved') {
    const child = db.users.find(u => u.id === reqObj.userId);
    if (child) {
      child.dailyGoal += reqObj.requestedMinutes;
    }
  }

  writeDb(db);
  res.json({ success: true, request: reqObj });
});

// Emergency Contacts API
app.get('/api/contacts', (req, res) => {
  const db = readDb();
  res.json({
    contacts: db.contacts,
    allowEmergencyCallsRestrictedTime: db.settings.allowEmergencyCallsRestrictedTime
  });
});

app.post('/api/contacts', (req, res) => {
  const { name, relationship, phoneNumber, allowedCallingApps } = req.body;
  const db = readDb();

  const newContact: EmergencyContact = {
    id: `con_${Date.now()}`,
    parentId: currentSessionUserId,
    name,
    relationship,
    phoneNumber,
    allowedCallingApps: allowedCallingApps || ['Phone']
  };

  db.contacts.push(newContact);
  writeDb(db);
  res.json({ success: true, contact: newContact });
});

app.put('/api/contacts/:id', (req, res) => {
  const { id } = req.params;
  const { name, relationship, phoneNumber, allowedCallingApps } = req.body;
  const db = readDb();

  const idx = db.contacts.findIndex(c => c.id === id);
  if (idx > -1) {
    db.contacts[idx] = {
      ...db.contacts[idx],
      name: name || db.contacts[idx].name,
      relationship: relationship || db.contacts[idx].relationship,
      phoneNumber: phoneNumber || db.contacts[idx].phoneNumber,
      allowedCallingApps: allowedCallingApps || db.contacts[idx].allowedCallingApps
    };
    writeDb(db);
    return res.json({ success: true, contact: db.contacts[idx] });
  }
  return res.status(404).json({ error: 'Contact not found' });
});

app.delete('/api/contacts/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();

  const initialLen = db.contacts.length;
  db.contacts = db.contacts.filter(c => c.id !== id);

  if (db.contacts.length < initialLen) {
    writeDb(db);
    return res.json({ success: true });
  }
  return res.status(404).json({ error: 'Contact not found' });
});

app.post('/api/settings/toggle-emergency', (req, res) => {
  const { allow } = req.body;
  const db = readDb();
  
  db.settings.allowEmergencyCallsRestrictedTime = allow;
  writeDb(db);
  res.json({ success: true, allowEmergencyCallsRestrictedTime: db.settings.allowEmergencyCallsRestrictedTime });
});

app.post('/api/users/update-goal', (req, res) => {
  const { userId, goal } = req.body;
  const db = readDb();
  
  const user = db.users.find(u => u.id === userId);
  if (user) {
    user.dailyGoal = Number(goal);
    writeDb(db);
    return res.json({ success: true, user });
  }
  return res.status(404).json({ error: 'User not found' });
});

app.post('/api/users/update-profile-pic', (req, res) => {
  const { userId, profilePic } = req.body;
  const db = readDb();
  
  const user = db.users.find(u => u.id === userId);
  if (user) {
    user.profilePic = profilePic;
    
    // Also update any chat messages profile pic!
    if (db.chatMessages) {
      db.chatMessages.forEach(msg => {
        if (msg.userId === userId) {
          msg.userProfilePic = profilePic;
        }
      });
    }
    
    writeDb(db);
    return res.json({ success: true, user });
  }
  return res.status(404).json({ error: 'User not found' });
});

app.post('/api/users/update-settings', (req, res) => {
  const { userId, weeklyDigest, streakAlerts, privacySync, darkMode } = req.body;
  const db = readDb();
  
  const user = db.users.find(u => u.id === userId);
  if (user) {
    if (weeklyDigest !== undefined) user.weeklyDigest = Boolean(weeklyDigest);
    if (streakAlerts !== undefined) user.streakAlerts = Boolean(streakAlerts);
    if (privacySync !== undefined) user.privacySync = Boolean(privacySync);
    if (darkMode !== undefined) user.darkMode = Boolean(darkMode);
    
    writeDb(db);
    return res.json({ success: true, user });
  }
  return res.status(404).json({ error: 'User not found' });
});

// App Usages API
app.get('/api/app-usages', (req, res) => {
  const db = readDb();
  res.json({ appUsages: db.appUsages });
});

// App Timers API
app.get('/api/app-timers', (req, res) => {
  const db = readDb();
  res.json({ appTimers: db.appTimers });
});

app.post('/api/app-timers', (req, res) => {
  const { userId, appName, category, limitMinutes } = req.body;
  const db = readDb();

  const newTimer = {
    id: `timer_${Date.now()}`,
    userId,
    appName,
    category,
    limitMinutes: Number(limitMinutes),
    createdBy: currentSessionUserId
  };

  db.appTimers.push(newTimer);
  writeDb(db);
  res.json({ success: true, timer: newTimer });
});

app.delete('/api/app-timers/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();

  const initialLen = db.appTimers.length;
  db.appTimers = db.appTimers.filter(t => t.id !== id);

  if (db.appTimers.length < initialLen) {
    writeDb(db);
    return res.json({ success: true });
  }
  return res.status(404).json({ error: 'Timer not found' });
});

// Notifications API
app.get('/api/notifications', (req, res) => {
  const db = readDb();
  // Filter for current session user so children don't see parental alerts unless appropriate,
  // but let's actually return all for flexibility or filter by session user.
  // We'll return filtered by current user so it's private and personal, or all if the client handles it.
  // Let's return both for convenience:
  const userNotifications = db.notifications.filter(n => n.userId === currentSessionUserId);
  res.json({ notifications: userNotifications, allNotifications: db.notifications });
});

app.post('/api/notifications/read', (req, res) => {
  const db = readDb();
  db.notifications.forEach(n => {
    if (n.userId === currentSessionUserId) {
      n.read = true;
    }
  });
  writeDb(db);
  res.json({ success: true });
});

// Group Chat API
app.get('/api/chat', (req, res) => {
  const db = readDb();
  const currentUser = db.users.find(u => u.id === currentSessionUserId);
  const familyId = currentUser?.familyId || 'fam_dubey';

  const messages = (db.chatMessages || []).filter(msg => {
    const msgFamilyId = msg.familyId || 'fam_dubey';
    return msgFamilyId === familyId;
  });

  res.json({ chatMessages: messages });
});

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message content cannot be empty' });
  }

  const db = readDb();
  const user = db.users.find(u => u.id === currentSessionUserId);
  if (!user) {
    return res.status(404).json({ error: 'Current session user not found' });
  }

  const familyId = user.familyId || 'fam_dubey';

  const newMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    userId: user.id,
    userName: user.name,
    userProfilePic: user.profilePic || '👤',
    userRole: user.role,
    message: message.trim(),
    timestamp: new Date().toISOString(),
    familyId: familyId
  };

  if (!db.chatMessages) {
    db.chatMessages = [];
  }
  db.chatMessages.push(newMessage);
  writeDb(db);

  res.json({ success: true, message: newMessage });
});


// Serve static assets in production, otherwise mount Vite server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
