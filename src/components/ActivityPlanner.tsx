/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, ActivityPoll, OfflineActivity } from '../types';
import { API } from '../api';
import { Calendar, Plus, Trophy, Sparkles, CheckCircle2, Circle, Flame, Vote, Sliders, Trash2 } from 'lucide-react';

interface ActivityPlannerProps {
  currentUser: User;
  onRefreshNotifications?: () => void;
}

const SUGGESTED_ACTIVITIES = [
  { title: '🚴 Cycling Adventure', category: 'Exercise', duration: '45 mins', points: 20 },
  { title: '🏸 Badminton Match', category: 'Sports', duration: '60 mins', points: 15 },
  { title: '📖 Quiet Reading', category: 'Education', duration: '30 mins', points: 10 },
  { title: '👨‍🍳 Cooking Challenge', category: 'Family', duration: '90 mins', points: 25 },
  { title: '🎲 Board Games', category: 'Fun', duration: '60 mins', points: 15 },
  { title: '🪴 Family Gardening', category: 'Nature', duration: '45 mins', points: 20 },
  { title: '🎨 Drawing Class', category: 'Art', duration: '40 mins', points: 15 },
  { title: '🚶 Evening Walk', category: 'Relax', duration: '30 mins', points: 10 }
];

export default function ActivityPlanner({ currentUser, onRefreshNotifications }: ActivityPlannerProps) {
  const [activities, setActivities] = useState<OfflineActivity[]>([]);
  const [polls, setPolls] = useState<ActivityPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [pollTitle, setPollTitle] = useState('Sunday Activity Poll');
  const [optionsText, setOptionsText] = useState('Badminton, Movie at Home, Cooking Challenge');
  const [feedback, setFeedback] = useState('');
  const [confirmDeletePollId, setConfirmDeletePollId] = useState<string | null>(null);
  const [confirmDeleteActivityId, setConfirmDeleteActivityId] = useState<string | null>(null);

  const isParent = currentUser.role === 'parent';

  const loadPlannerData = async () => {
    try {
      const res = await API.getActivitiesAndPolls();
      setActivities(res.activities);
      setPolls(res.polls);
    } catch (err) {
      console.error('Error fetching activities/polls', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlannerData();
  }, [currentUser]);

  const handleVote = async (pollId: string, optionId: string) => {
    try {
      const res = await API.votePoll(pollId, optionId, currentUser.id);
      if (res.success) {
        setPolls(prev => prev.map(p => p.id === pollId ? res.poll : p));
        onRefreshNotifications?.();
        loadPlannerData();
      }
    } catch (err) {
      console.error('Error voting', err);
    }
  };

  const handleClosePoll = async (pollId: string) => {
    try {
      const res = await API.closePoll(pollId);
      if (res.success) {
        setFeedback('Poll closed! The winner has been posted to the Family Calendar.');
        loadPlannerData();
      }
    } catch (err) {
      console.error('Error closing poll', err);
    } finally {
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const opts = optionsText.split(',').map(o => o.trim()).filter(Boolean);
    if (opts.length < 2) {
      setFeedback('⚠️ Please specify at least 2 options separated by commas.');
      return;
    }

    try {
      const res = await API.createPoll({
        title: pollTitle,
        options: opts,
        date: '2026-06-28' // Sunday
      });

      if (res.success) {
        setPolls(prev => [...prev, res.poll]);
        setFeedback('Created family offline activity poll!');
        setShowCreatePoll(false);
        setPollTitle('Sunday Activity Poll');
        setOptionsText('Badminton, Movie at Home, Cooking Challenge');
      }
    } catch (err) {
      console.error('Error creating poll', err);
    } finally {
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleCompleteActivity = async (activityId: string, title: string) => {
    try {
      const res = await API.completeActivity(activityId, currentUser.id);
      if (res.success) {
        setFeedback(`Activity "${title}" completed! points awarded.`);
        loadPlannerData();
      }
    } catch (err) {
      console.error('Error completing activity', err);
    } finally {
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleCreateDirectActivity = async (title: string, pts: number) => {
    try {
      const res = await API.createActivity({
        title,
        pointsReward: pts,
        date: '2026-06-25',
        status: 'pending'
      });
      if (res.success) {
        setFeedback(`Direct Activity "${title}" added to calendar!`);
        loadPlannerData();
      }
    } catch (err) {
      console.error('Error creating direct activity', err);
    } finally {
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    try {
      const res = await API.deletePoll(pollId);
      if (res.success) {
        setFeedback('Poll deleted successfully!');
        setConfirmDeletePollId(null);
        loadPlannerData();
      }
    } catch (err) {
      console.error('Error deleting poll', err);
    } finally {
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      const res = await API.deleteActivity(activityId);
      if (res.success) {
        setFeedback('Activity deleted successfully!');
        setConfirmDeleteActivityId(null);
        loadPlannerData();
      }
    } catch (err) {
      console.error('Error deleting activity', err);
    } finally {
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  return (
    <div id="planner-screen-root" className="max-w-5xl mx-auto py-6 px-4 space-y-8 font-sans">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            Offline Activity Planner
          </h2>
          <p className="text-xs text-slate-500">Stimulate phone-free recreation. Propose voting polls, compile streaks, and build calendar schedules.</p>
        </div>

        <button
          type="button"
          id="create-poll-btn"
          onClick={() => setShowCreatePoll(!showCreatePoll)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Activity Poll
        </button>
      </div>

      {feedback && (
        <div id="planner-feedback-alert" className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl font-semibold text-center">
          {feedback}
        </div>
      )}

      {/* Create Activity Poll Modal/Sheet */}
      {showCreatePoll && (
        <form onSubmit={handleCreatePoll} className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4 animate-fadeIn">
          <h3 className="font-bold text-slate-800 text-sm">Add New Activity Poll</h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">Poll Title</label>
              <input
                type="text"
                id="poll-title"
                required
                value={pollTitle}
                onChange={(e) => setPollTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs bg-slate-50/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">Poll Options (Separate with commas)</label>
              <input
                type="text"
                id="poll-options"
                required
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs bg-slate-50/50"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              id="submit-poll-btn"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Initialize Poll
            </button>
            <button
              type="button"
              onClick={() => setShowCreatePoll(false)}
              className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Columns - Calendar & Polls */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Active Family Polls Widget */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Active Activity Polls</h3>
            
            {loading ? (
              <div className="text-center py-6">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : polls.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 text-center border border-slate-200 text-slate-400 text-xs">
                No active activity polls. Propose one using the "Create Activity Poll" button!
              </div>
            ) : (
              <div className="space-y-4">
                {polls.map((poll) => {
                  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);

                  return (
                    <div key={poll.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-indigo-500">Group Decision poll</span>
                          <h4 className="font-extrabold text-slate-800 text-sm">{poll.title}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          {poll.isClosed ? (
                            <span className="bg-slate-100 border text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Closed
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                              Live Voting
                            </span>
                          )}
                          {confirmDeletePollId === poll.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDeletePoll(poll.id)}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-bold rounded-lg cursor-pointer transition-all active:scale-95 shadow-sm"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeletePollId(null)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[9px] font-bold rounded-lg cursor-pointer transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeletePollId(poll.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                              title="Delete Poll"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {poll.options.map((opt) => {
                          const votesCount = opt.votes.length;
                          const ratio = totalVotes > 0 ? votesCount / totalVotes : 0;
                          const hasVoted = opt.votes.includes(currentUser.id);

                          return (
                            <div 
                              key={opt.id} 
                              className={`p-3 rounded-2xl border transition-all space-y-2 ${
                                hasVoted 
                                  ? 'bg-emerald-50/70 border-emerald-200' 
                                  : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                              }`}
                            >
                              <div className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                  {/* Radio selector */}
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                    hasVoted 
                                      ? 'border-emerald-600 bg-emerald-600 text-white' 
                                      : 'border-slate-300 bg-white'
                                  }`}>
                                    {hasVoted && (
                                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-scaleIn" />
                                    )}
                                  </div>
                                  <span className={`font-bold ${hasVoted ? 'text-emerald-800' : 'text-slate-700'}`}>
                                    {opt.title}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500 font-semibold">{votesCount} votes</span>
                                  {!poll.isClosed && (
                                    <button
                                      type="button"
                                      id={`vote-opt-${opt.id}`}
                                      onClick={() => handleVote(poll.id, opt.id)}
                                      className={`px-3 py-1 text-[10px] font-extrabold rounded-lg cursor-pointer transition-all active:scale-95 flex items-center gap-1 ${
                                        hasVoted 
                                          ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700' 
                                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                      }`}
                                    >
                                      <Vote className="w-3 h-3" />
                                      {hasVoted ? 'Voted' : 'Vote'}
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    hasVoted ? 'bg-emerald-600' : 'bg-indigo-500'
                                  }`}
                                  style={{ width: `${ratio * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Parent Controls - Close Poll */}
                      {!poll.isClosed && isParent && (
                        <div className="pt-2 border-t border-slate-200 flex justify-end">
                          <button
                            type="button"
                            id={`close-poll-btn-${poll.id}`}
                            onClick={() => handleClosePoll(poll.id)}
                            className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-100 cursor-pointer flex items-center gap-1"
                          >
                            <Sliders className="w-3 h-3" /> Lock Poll & Post Winner
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Family Calendar Activities list */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Scheduled Offline Calendar</h3>
            
            {loading ? (
              <div className="text-center py-6">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : activities.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 text-center border border-slate-200 text-slate-400 text-xs">
                No offline activities scheduled. Complete a poll or add suggested ones!
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {activities.map((act) => {
                  const completed = act.status === 'completed';
                  return (
                    <div 
                      key={act.id} 
                      className={`p-4 rounded-3xl border shadow-sm flex flex-col justify-between h-32 transition-all ${completed ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                          <span className="text-[9px] uppercase font-bold text-slate-400">Date: {act.date}</span>
                          <h4 className="font-extrabold text-slate-800 text-xs mt-0.5 line-clamp-1">{act.title}</h4>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {completed ? (
                            <span className="text-emerald-600 bg-emerald-100 p-1 rounded-lg">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          ) : (
                            <button
                              type="button"
                              id={`complete-act-${act.id}`}
                              onClick={() => handleCompleteActivity(act.id, act.title)}
                              className="p-1 border border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                              title="Mark Completed"
                            >
                              <Circle className="w-4 h-4" />
                            </button>
                          )}
                          {confirmDeleteActivityId === act.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDeleteActivity(act.id)}
                                className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white text-[8px] font-bold rounded cursor-pointer transition-colors"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteActivityId(null)}
                                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[8px] font-bold rounded cursor-pointer transition-colors"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteActivityId(act.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                              title="Delete Activity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs border-t border-slate-200 pt-2.5">
                        <span className="text-amber-600 font-bold flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" /> +{act.pointsReward} pts
                        </span>
                        <span className={`text-[10px] font-bold uppercase ${completed ? 'text-emerald-700' : 'text-slate-500 animate-pulse'}`}>
                          {completed ? 'Earned' : 'Pending Completion'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar - Suggested catalog */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Suggested Catalog</h3>
          <div className="space-y-3">
            {SUGGESTED_ACTIVITIES.map((item, index) => {
              return (
                <div 
                  key={index} 
                  className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all group"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-800 text-xs">{item.title}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">{item.category} • {item.duration}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCreateDirectActivity(item.title, item.points)}
                    className="p-1 text-[11px] bg-slate-100 group-hover:bg-indigo-600 text-slate-600 group-hover:text-white font-bold rounded-lg cursor-pointer transition-colors shrink-0"
                    title="Add directly to calendar"
                  >
                    + Add
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
