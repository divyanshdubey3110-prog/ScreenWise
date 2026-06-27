/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'parent' | 'child' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  points: number;
  streak: number;
  badges: string[];
  profilePic: string; // Avatar placeholder name
  relation: string; // e.g. "Father", "Mother", "Son", "Daughter"
  dailyGoal: number; // in minutes
  usageToday: number; // in minutes
  weeklyDigest?: boolean;
  streakAlerts?: boolean;
  privacySync?: boolean;
  darkMode?: boolean;
  familyId?: string;
}

export interface Family {
  id: string;
  name: string;
  inviteCode: string;
  qrCodeUrl: string;
  createdBy: string;
}

export interface CategoryBreakdown {
  education: number;
  socialMedia: number;
  gaming: number;
  entertainment: number;
  communication: number;
  productivity: number;
  other: number;
}

export interface ScreenTimeLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  categories: CategoryBreakdown;
}

export interface DeviceFreeSchedule {
  id: string;
  familyId: string;
  title: string;
  startTime: string; // "HH:MM" 24h format
  endTime: string; // "HH:MM" 24h format
  remindersEnabled: boolean;
  days: string[]; // e.g. ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
}

export interface ActivityPollOption {
  id: string;
  title: string;
  votes: string[]; // userIds who voted
  creatorName: string;
}

export interface ActivityPoll {
  id: string;
  familyId: string;
  title: string; // e.g. "Sunday Family Activity"
  options: ActivityPollOption[];
  winningOptionId: string | null;
  date: string;
  isClosed: boolean;
}

export interface OfflineActivity {
  id: string;
  familyId: string;
  title: string;
  date: string;
  status: 'completed' | 'pending';
  pointsReward: number;
  completedBy?: string[]; // userIds
}

export interface RewardRule {
  id: string;
  title: string;
  points: number;
  description: string;
  icon: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface ExtraTimeRequest {
  id: string;
  userId: string;
  userName: string;
  familyId?: string;
  requestedMinutes: number;
  reason: string;
  category: keyof CategoryBreakdown;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  date: string;
}

export interface EmergencyContact {
  id: string;
  parentId: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  allowedCallingApps: string[]; // e.g. ["Phone", "WhatsApp", "FaceTime"]
}

export interface SystemSettings {
  allowEmergencyCallsRestrictedTime: boolean;
  familyRoutineCompletion: number;
}

export interface AppUsage {
  id: string;
  userId: string;
  appName: string;
  category: keyof CategoryBreakdown;
  minutesUsed: number;
  date: string; // YYYY-MM-DD
}

export interface AppTimer {
  id: string;
  userId: string;
  appName: string;
  category: keyof CategoryBreakdown;
  limitMinutes: number;
  createdBy: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  type: 'limit_exceeded' | 'system' | 'goal_reached';
  read: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userProfilePic: string;
  userRole: string;
  message: string;
  timestamp: string; // ISO string
  familyId?: string;
}

export interface DatabaseState {
  users: User[];
  family: Family | null;
  families?: Family[];
  logs: ScreenTimeLog[];
  schedules: DeviceFreeSchedule[];
  polls: ActivityPoll[];
  activities: OfflineActivity[];
  requests: ExtraTimeRequest[];
  contacts: EmergencyContact[];
  settings: SystemSettings;
  appUsages: AppUsage[];
  appTimers: AppTimer[];
  notifications: AppNotification[];
  chatMessages: ChatMessage[];
}
