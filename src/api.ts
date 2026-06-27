/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Family, ScreenTimeLog, DeviceFreeSchedule, ActivityPoll, OfflineActivity, ExtraTimeRequest, EmergencyContact, SystemSettings } from './types';

export const API = {
  // Authentication
  async getMe(): Promise<{ user: User }> {
    const res = await fetch('/api/auth/me');
    return res.json();
  },

  async login(email: string, password?: string, role?: 'parent' | 'child' | 'admin'): Promise<{ success: boolean; user: User; message?: string; error?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    return res.json();
  },

  async signup(data: { name: string; email: string; password?: string; role: string; relation: string; dailyGoal: number; inviteCode?: string; familyName?: string }): Promise<{ success: boolean; user: User; error?: string }> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async switchProfile(userId: string): Promise<{ success: boolean; user: User }> {
    const res = await fetch('/api/auth/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

  async logout(): Promise<{ success: boolean }> {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    return res.json();
  },

  // Family Management
  async getFamily(): Promise<{ family: Family | null; members: User[]; routineCompletion: number }> {
    const res = await fetch('/api/family');
    return res.json();
  },

  async createFamily(data: { familyName: string; parentName: string; limitCount: number }): Promise<{ success: boolean; family: Family; members: User[] }> {
    const res = await fetch('/api/family/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async joinFamily(inviteCode: string): Promise<{ success: boolean; family: Family }> {
    const res = await fetch('/api/family/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode })
    });
    return res.json();
  },

  // Screen Time & Category Tracking
  async getLogs(): Promise<{ logs: ScreenTimeLog[] }> {
    const res = await fetch('/api/logs');
    return res.json();
  },

  async incrementUsage(userId: string, minutes: number, category: string, appName?: string): Promise<{ success: boolean; user: User; log: ScreenTimeLog; appUsage?: any; timerExceededMessage?: string }> {
    const res = await fetch('/api/logs/increment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, minutes, category, appName })
    });
    return res.json();
  },

  // Schedules
  async getSchedules(): Promise<{ schedules: DeviceFreeSchedule[] }> {
    const res = await fetch('/api/schedules');
    return res.json();
  },

  async createSchedule(data: { title: string; startTime: string; endTime: string; days: string[]; remindersEnabled: boolean }): Promise<{ success: boolean; schedule: DeviceFreeSchedule }> {
    const res = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateSchedule(id: string, data: Partial<DeviceFreeSchedule>): Promise<{ success: boolean; schedule: DeviceFreeSchedule }> {
    const res = await fetch(`/api/schedules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteSchedule(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Offline Activities & Polls
  async getActivitiesAndPolls(): Promise<{ activities: OfflineActivity[]; polls: ActivityPoll[] }> {
    const res = await fetch('/api/activities');
    return res.json();
  },

  async createActivity(data: { title: string; pointsReward: number; date: string; status?: string }): Promise<{ success: boolean; activity: OfflineActivity }> {
    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async completeActivity(id: string, userId: string): Promise<{ success: boolean; activity: OfflineActivity; user: User }> {
    const res = await fetch('/api/activities/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, userId })
    });
    return res.json();
  },

  async createPoll(data: { title: string; options: string[]; date: string }): Promise<{ success: boolean; poll: ActivityPoll }> {
    const res = await fetch('/api/polls/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async votePoll(pollId: string, optionId: string, userId: string): Promise<{ success: boolean; poll: ActivityPoll }> {
    const res = await fetch('/api/polls/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollId, optionId, userId })
    });
    return res.json();
  },

  async closePoll(pollId: string): Promise<{ success: boolean; poll: ActivityPoll }> {
    const res = await fetch('/api/polls/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollId })
    });
    return res.json();
  },

  async deletePoll(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/polls/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async deleteActivity(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/activities/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Extra Screen Time Requests
  async getRequests(): Promise<{ requests: ExtraTimeRequest[] }> {
    const res = await fetch('/api/requests');
    return res.json();
  },

  async createRequest(data: { requestedMinutes: number; reason: string; category: string }): Promise<{ success: boolean; request: ExtraTimeRequest }> {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async respondToRequest(requestId: string, status: 'approved' | 'rejected', note?: string): Promise<{ success: boolean; request: ExtraTimeRequest }> {
    const res = await fetch('/api/requests/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, status, note })
    });
    return res.json();
  },

  // Emergency Contacts & Restrict Settings
  async getContacts(): Promise<{ contacts: EmergencyContact[]; allowEmergencyCallsRestrictedTime: boolean }> {
    const res = await fetch('/api/contacts');
    return res.json();
  },

  async createContact(data: { name: string; relationship: string; phoneNumber: string; allowedCallingApps: string[] }): Promise<{ success: boolean; contact: EmergencyContact }> {
    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateContact(id: string, data: Partial<EmergencyContact>): Promise<{ success: boolean; contact: EmergencyContact }> {
    const res = await fetch(`/api/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteContact(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async toggleEmergencyCalls(allow: boolean): Promise<{ success: boolean; allowEmergencyCallsRestrictedTime: boolean }> {
    const res = await fetch('/api/settings/toggle-emergency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allow })
    });
    return res.json();
  },

  // App Usages and Timers and Notifications additions
  async getAppUsages(): Promise<{ appUsages: any[] }> {
    const res = await fetch('/api/app-usages');
    return res.json();
  },

  async getAppTimers(): Promise<{ appTimers: any[] }> {
    const res = await fetch('/api/app-timers');
    return res.json();
  },

  async createAppTimer(data: { userId: string; appName: string; category: string; limitMinutes: number }): Promise<{ success: boolean; timer: any }> {
    const res = await fetch('/api/app-timers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteAppTimer(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/app-timers/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async getNotifications(): Promise<{ notifications: any[]; allNotifications: any[] }> {
    const res = await fetch('/api/notifications');
    return res.json();
  },

  async markNotificationsRead(): Promise<{ success: boolean }> {
    const res = await fetch('/api/notifications/read', { method: 'POST' });
    return res.json();
  },

  // Group Chat Additions
  async getChatMessages(): Promise<{ chatMessages: any[] }> {
    const res = await fetch('/api/chat');
    return res.json();
  },

  async sendChatMessage(message: string): Promise<{ success: boolean; message: any }> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    return res.json();
  },

  async updateProfilePic(userId: string, profilePic: string): Promise<{ success: boolean; user: User }> {
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
    const res = await fetch('/api/users/update-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...settings })
    });
    return res.json();
  }
};
