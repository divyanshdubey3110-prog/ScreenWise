/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User } from '../types';
import { Award, Flame, Star, Trophy, Target, ShieldCheck, Heart, Sparkles } from 'lucide-react';

interface RewardsStreaksProps {
  currentUser: User;
}

const REWARD_RULES = [
  { title: 'Goal Adherence', points: '+20 pts', desc: 'Stay completely within your customized daily screen-time allocation.', icon: '🎯' },
  { title: 'Offline Completion', points: '+15 pts', desc: 'Perform and report any designated family offline hobbies or walks.', icon: '🚴' },
  { title: 'Device-Free Hour', points: '+10 pts', desc: 'Keep devices fully closed during scheduled Dinner or Study Blocks.', icon: '⏰' },
  { title: 'Weeklong Focus Streak', points: '+50 pts', desc: 'Sustain perfect goal compliance for 7 consecutive calendar days.', icon: '🔥' }
];

const ALL_ACHIEVEMENTS = [
  { id: 'focus_3', title: '3-Day Focus Streak', desc: 'Exercised healthy screen limits for 3 consecutive days.', icon: '🥉', pointsRequired: 100 },
  { id: 'first_study', title: 'Study First Badge', desc: 'Earned by logging 4+ hours on educational applications.', icon: '📚', pointsRequired: 200 },
  { id: 'family_hero', title: 'Family Time Hero', desc: 'Completed 5 offline parent-scheduled family walks or board games.', icon: '👨‍👩‍👧‍👦', pointsRequired: 250 },
  { id: 'sw_champion', title: 'ScreenWise Champion', desc: 'Achieved a total of 300+ reward points. Outstanding balance!', icon: '🏆', pointsRequired: 300 },
  { id: 'creative_minds', title: 'Creative Minds Badge', desc: 'Spent 2+ hours on drawing or creative presentation tools.', icon: '🎨', pointsRequired: 350 },
  { id: 'digital_saint', title: 'Digital Saint Badge', desc: 'Achieved an outstanding 10-day goal adherence streak.', icon: '😇', pointsRequired: 400 }
];

export default function RewardsStreaks({ currentUser }: RewardsStreaksProps) {
  return (
    <div id="rewards-streaks-root" className="max-w-4xl mx-auto py-6 px-4 space-y-8 font-sans">
      
      {/* Top Banner Trophies */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg grid sm:grid-cols-3 gap-6 items-center">
        
        <div className="sm:col-span-2 space-y-3">
          <span className="text-[10px] uppercase font-bold text-yellow-300 bg-white/20 px-3 py-1 rounded-full font-mono">
            🏆 MOTIVATIONAL GAME REWARDS
          </span>
          <h2 className="text-2xl font-black tracking-tight leading-tight">
            Level Up Your Digital Wellbeing!
          </h2>
          <p className="text-xs text-blue-100 leading-relaxed">
            Every minute saved from entertainment apps helps you level up. Earn badges, log points, and unlock offline bonuses with your family group!
          </p>
        </div>

        <div className="flex sm:justify-end gap-3 shrink-0">
          <div className="bg-white/10 px-4 py-3 rounded-2xl text-center border border-white/10 min-w-[100px]">
            <Flame className="w-5 h-5 text-amber-300 mx-auto mb-1 animate-pulse" />
            <span className="text-xl font-black block leading-none font-mono">{currentUser.streak}</span>
            <span className="text-[9px] text-blue-100 uppercase font-semibold">Active Streak</span>
          </div>
          <div className="bg-white/10 px-4 py-3 rounded-2xl text-center border border-white/10 min-w-[100px]">
            <Award className="w-5 h-5 text-yellow-300 mx-auto mb-1" />
            <span className="text-xl font-black block leading-none font-mono">{currentUser.points}</span>
            <span className="text-[9px] text-blue-100 uppercase font-semibold">Total Points</span>
          </div>
        </div>

      </div>

      {/* Reward Rules Rules Column */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">How to Earn Points</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REWARD_RULES.map((rule, idx) => {
            return (
              <div key={idx} className="p-4 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between h-36">
                <div className="flex justify-between items-start">
                  <span className="text-2xl">{rule.icon}</span>
                  <span className="text-xs font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-100 font-mono">
                    {rule.points}
                  </span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs leading-none">{rule.title}</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">{rule.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Badges Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-end border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Achievements & Badges</h3>
            <p className="text-xs text-slate-400">Unlock custom badges as your digital wellbeing point totals increase!</p>
          </div>
          <span className="text-xs text-slate-500 font-semibold font-mono">
            Unlocked: {currentUser.badges.length} / {ALL_ACHIEVEMENTS.length}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {ALL_ACHIEVEMENTS.map((badge) => {
            // Is unlocked if current user points are >= required points or already in user badge list
            const isUnlocked = currentUser.points >= badge.pointsRequired || currentUser.badges.includes(badge.title);

            return (
              <div 
                key={badge.id}
                className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-between h-44 relative overflow-hidden transition-all ${isUnlocked ? 'bg-white border-slate-200 hover:shadow-md' : 'bg-slate-50 border-slate-200/60 opacity-60'}`}
              >
                {/* Lock icon background watermarks */}
                {!isUnlocked && (
                  <div className="absolute top-1 right-2 text-slate-300 font-black text-[10px] uppercase font-mono tracking-wider">
                    🔒 Locked
                  </div>
                )}
                {isUnlocked && (
                  <div className="absolute top-2 right-3 text-emerald-600">
                    <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                  </div>
                )}

                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${isUnlocked ? 'bg-yellow-50 border border-yellow-100' : 'bg-slate-200 border border-slate-300'}`}>
                    {badge.icon}
                  </div>
                  
                  <div className="space-y-0.5">
                    <h4 className={`font-bold text-xs ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>{badge.title}</h4>
                    <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">{badge.desc}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-bold">Requirement:</span>
                  <span className={`font-bold uppercase ${isUnlocked ? 'text-emerald-600' : 'text-slate-500'} font-mono`}>
                    {isUnlocked ? '🏆 Active' : `${badge.pointsRequired} Points`}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
