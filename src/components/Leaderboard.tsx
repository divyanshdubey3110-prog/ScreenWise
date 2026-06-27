/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, AppUsage } from '../types';
import { motion } from 'motion/react';
import { Trophy, Clock, Star, Crown, Sparkles } from 'lucide-react';

interface LeaderboardProps {
  members: User[];
  appUsages: AppUsage[];
}

export default function Leaderboard({ members, appUsages }: LeaderboardProps) {
  // Compute leaderboard details for all members
  const scoredMembers = members.map(member => {
    const totalMins = member.usageToday;
    
    // Filter app usages for this user where category is educational/productive
    const userUsages = appUsages.filter(au => au.userId === member.id);
    const productiveMins = userUsages
      .filter(au => au.category === 'education' || au.category === 'productivity')
      .reduce((sum, au) => sum + au.minutesUsed, 0);
    
    const focusPercentage = totalMins > 0 ? Math.round((productiveMins / totalMins) * 100) : 100;
    
    // Balanced Score formula:
    // Base score is 500.
    // Subtract total screen time (lower total is better)
    // Add productive minutes multiplied by 2 (rewards high value usage)
    const score = Math.max(0, Math.round(500 - totalMins + (productiveMins * 2)));

    // Find their top productive app
    const topProdApp = userUsages
      .filter(au => au.category === 'education' || au.category === 'productivity')
      .sort((a, b) => b.minutesUsed - a.minutesUsed)[0]?.appName || 'None';

    return {
      ...member,
      totalMins,
      productiveMins,
      focusPercentage,
      score,
      topProdApp
    };
  });

  // Sort by total screen time in increasing order (lowest screen time is #1)
  const rankedMembers = [...scoredMembers].sort((a, b) => {
    if (a.totalMins !== b.totalMins) {
      return a.totalMins - b.totalMins;
    }
    return b.focusPercentage - a.focusPercentage; // tie breaker
  });

  const formatTime = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    const remFormatted = rem % 1 === 0 ? rem : parseFloat(rem.toFixed(1));
    if (hrs === 0) return `${remFormatted}m`;
    return `${hrs}h ${remFormatted}m`;
  };

  return (
    <div id="leaderboard-root" className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/85 space-y-5 relative overflow-hidden">
      
      {/* Background soft subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-50 blur-3xl rounded-full pointer-events-none"></div>

      {/* Header section - cleaner & smaller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="space-y-0.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[9px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" /> Active Balance Tracker
          </span>
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-1.5 tracking-tight">
            <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
            Household Screen-Time Leaderboard
          </h3>
          <p className="text-[10.5px] text-slate-500">
            Ranked daily by combining minimal overall screen duration with productive focus.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-2 py-1 rounded-lg text-[10px] font-semibold text-slate-600 self-start sm:self-center">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono uppercase text-[9px]">Live Standings</span>
        </div>
      </div>

      {/* Podium Showcase for Top 3 - Smaller height & sizes */}
      {rankedMembers.length > 0 && (
        <div className="grid grid-cols-3 gap-2 pt-3 pb-2 items-end max-w-md mx-auto relative z-10 border-b border-slate-100">
          
          {/* 2nd Place */}
          {rankedMembers[1] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, type: 'spring' }}
              className="flex flex-col items-center text-center space-y-1.5"
            >
              <div className="relative group cursor-pointer">
                <motion.div 
                  whileHover={{ scale: 1.12, rotate: -4 }}
                  className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-300 flex items-center justify-center text-2xl shadow-sm relative overflow-hidden"
                >
                  {rankedMembers[1].profilePic.startsWith('data:image') ? (
                    <img src={rankedMembers[1].profilePic} alt={rankedMembers[1].name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span>{rankedMembers[1].profilePic}</span>
                  )}
                </motion.div>
                <div className="absolute -bottom-1.5 -right-1 bg-slate-200 text-slate-700 font-extrabold rounded-lg text-[8px] px-1 py-0.2 border border-slate-300 shadow-sm">
                  2nd
                </div>
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-slate-700 truncate max-w-[70px]">{rankedMembers[1].name.split(' ')[0]}</h4>
                <p className="text-[10px] text-slate-500 font-extrabold">{rankedMembers[1].score} pts</p>
                <span className="text-[9px] text-indigo-600 font-bold block">{rankedMembers[1].focusPercentage}% Focus</span>
              </div>
            </motion.div>
          )}

          {/* 1st Place (Center Podium) */}
          {rankedMembers[0] && (
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
              className="flex flex-col items-center text-center space-y-1.5 pb-1"
            >
              <div className="relative group cursor-pointer">
                {/* Floating crown animation */}
                <motion.div 
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  className="absolute -top-5 left-1/2 -translate-x-1/2 z-20"
                >
                  <Crown className="w-5 h-5 text-amber-500 drop-shadow-[0_1.5px_4px_rgba(245,158,11,0.35)]" />
                </motion.div>
                
                {/* Glowing ring */}
                <span className="absolute -inset-1 rounded-2xl bg-amber-100 blur-sm group-hover:bg-amber-200 transition-all duration-300"></span>

                <motion.div 
                  whileHover={{ scale: 1.15, rotate: 6 }}
                  className="w-15 h-15 rounded-2xl bg-amber-50 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-md relative overflow-hidden z-10"
                >
                  {rankedMembers[0].profilePic.startsWith('data:image') ? (
                    <img src={rankedMembers[0].profilePic} alt={rankedMembers[0].name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span>{rankedMembers[0].profilePic}</span>
                  )}
                </motion.div>
                
                <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 font-black rounded-lg text-[9px] w-5 h-5 flex items-center justify-center border border-amber-500 shadow">
                  👑
                </div>
              </div>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-xs text-amber-900 truncate max-w-[85px] flex items-center justify-center gap-0.5">
                  {rankedMembers[0].name.split(' ')[0]}
                </h4>
                <p className="text-xs text-slate-800 font-black">{rankedMembers[0].score} pts</p>
                <span className="text-[9px] bg-emerald-550/10 text-emerald-600 border border-emerald-200/50 px-1.5 py-0.2 rounded-full font-bold inline-block mt-0.5">
                  {rankedMembers[0].focusPercentage}% Focus
                </span>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {rankedMembers[2] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
              className="flex flex-col items-center text-center space-y-1.5"
            >
              <div className="relative group cursor-pointer">
                <motion.div 
                  whileHover={{ scale: 1.12, rotate: 4 }}
                  className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-300 flex items-center justify-center text-2xl shadow-sm relative overflow-hidden"
                >
                  {rankedMembers[2].profilePic.startsWith('data:image') ? (
                    <img src={rankedMembers[2].profilePic} alt={rankedMembers[2].name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span>{rankedMembers[2].profilePic}</span>
                  )}
                </motion.div>
                <div className="absolute -bottom-1.5 -right-1 bg-amber-100 text-amber-800 font-extrabold rounded-lg text-[8px] px-1 py-0.2 border border-amber-200 shadow-sm">
                  3rd
                </div>
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-slate-700 truncate max-w-[70px]">{rankedMembers[2].name.split(' ')[0]}</h4>
                <p className="text-[10px] text-slate-500 font-extrabold">{rankedMembers[2].score} pts</p>
                <span className="text-[9px] text-indigo-600 font-bold block">{rankedMembers[2].focusPercentage}% Focus</span>
              </div>
            </motion.div>
          )}

        </div>
      )}

      {/* Detailed Rank List */}
      <div className="space-y-2 relative z-10">
        <h4 className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest pl-1">Detailed Household Standings</h4>
        
        <div className="space-y-1.5">
          {rankedMembers.map((member, index) => {
            const isTop = index === 0;
            const rankLabel = index + 1;
            
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.005 }}
                className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isTop 
                    ? 'bg-indigo-50/40 border-indigo-100 shadow-inner' 
                    : 'bg-white border-slate-100 hover:bg-slate-50/60'
                }`}
              >
                {/* Left: Rank, Animate Profile Pic, and Relation */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-5 font-mono text-[11px] font-black text-slate-400 flex justify-center items-center">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${rankLabel}`}
                  </div>
                  
                  {/* Interactive animated Profile Pic container */}
                  <div className="relative shrink-0">
                    <motion.div 
                      whileHover={{ 
                        scale: 1.15, 
                        rotate: index % 2 === 0 ? 10 : -10,
                        boxShadow: "0px 0px 8px rgba(99, 102, 241, 0.25)"
                      }}
                      transition={{ type: "spring", stiffness: 350, damping: 15 }}
                      className={`w-9 h-9 rounded-xl bg-slate-50 border flex items-center justify-center text-xl shadow-inner select-none cursor-pointer overflow-hidden ${
                        isTop ? 'border-amber-400' : 'border-slate-200'
                      }`}
                    >
                      {member.profilePic.startsWith('data:image') ? (
                        <img src={member.profilePic} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span>{member.profilePic}</span>
                      )}
                    </motion.div>
                    
                    {/* Tiny badge indicating role/relation */}
                    <span className="absolute -bottom-1 -right-1 bg-indigo-100 text-[8px] font-extrabold tracking-tight text-indigo-700 px-1 py-0.2 rounded border border-white leading-none">
                      {member.relation}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h5 className="font-extrabold text-[11.5px] text-slate-800 truncate flex items-center gap-1 leading-tight">
                      {member.name}
                      {isTop && <Crown className="w-3 h-3 text-amber-500 shrink-0 inline" />}
                    </h5>
                    <p className="text-[9.5px] text-slate-400 font-medium mt-0.5 flex items-center gap-1 leading-none">
                      <Clock className="w-2.5 h-2.5 text-slate-400" /> {formatTime(member.totalMins)} screen time today
                    </p>
                  </div>
                </div>

                {/* Right: Score and focus details */}
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1 font-mono">
                    <span className="text-[9px] font-bold text-slate-400">Score:</span>
                    <span className={`text-[11.5px] font-black ${isTop ? 'text-indigo-600 font-black' : 'text-slate-700'}`}>{member.score}</span>
                  </div>
                  
                  {/* Category Pill and percentage */}
                  <div className="mt-0.5 flex items-center justify-end gap-1">
                    {member.topProdApp !== 'None' && (
                      <span className="text-[8px] bg-indigo-50 text-indigo-600 border border-indigo-100/60 px-1.5 py-0.2 rounded font-mono font-bold">
                        {member.topProdApp}
                      </span>
                    )}
                    <span className="text-[9.5px] text-emerald-600 font-extrabold">{member.focusPercentage}% Focus</span>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Rules explanation footer */}
      <div className="pt-2 text-[8.5px] text-slate-400 flex items-center gap-1 border-t border-slate-100 justify-center">
        <Star className="w-2.5 h-2.5 text-indigo-400 fill-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
        <span>Ranks refresh daily. Reduce overall screen time and boost productivity to top the board!</span>
      </div>

    </div>
  );
}
