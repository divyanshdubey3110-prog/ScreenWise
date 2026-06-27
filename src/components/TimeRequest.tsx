/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, ExtraTimeRequest, CategoryBreakdown } from '../types';
import { API } from '../api';
import { Clock, Send, Sparkles, ShieldAlert, Check, X, ShieldCheck, Heart } from 'lucide-react';

interface TimeRequestProps {
  currentUser: User;
  onRefreshUser: () => void;
}

export default function TimeRequest({ currentUser, onRefreshUser }: TimeRequestProps) {
  const [requests, setRequests] = useState<ExtraTimeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedMinutes, setRequestedMinutes] = useState(30);
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState<keyof CategoryBreakdown>('education');
  const [parentNote, setParentNote] = useState('');
  const [selectedReqIdForNote, setSelectedReqIdForNote] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const isParent = currentUser.role === 'parent';

  const loadRequests = async () => {
    try {
      const res = await API.getRequests();
      setRequests(res.requests);
    } catch (err) {
      console.error('Error fetching requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [currentUser]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setFeedback('⚠️ Please specify a valid justification for extra minutes.');
      return;
    }

    try {
      const res = await API.createRequest({
        requestedMinutes,
        reason,
        category
      });

      if (res.success) {
        setRequests(prev => [res.request, ...prev]);
        setFeedback('Request submitted successfully! Pushed to Parent Dashboard.');
        setReason('');
        setRequestedMinutes(30);
      }
    } catch (err) {
      console.error('Error creating request', err);
    } finally {
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleRespond = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const note = selectedReqIdForNote === id ? parentNote : '';
      const res = await API.respondToRequest(id, status, note);
      
      if (res.success) {
        setRequests(prev => prev.map(r => r.id === id ? res.request : r));
        setFeedback(`Request ${status === 'approved' ? 'Approved' : 'Rejected'}!`);
        setSelectedReqIdForNote(null);
        setParentNote('');
        
        // Refresh global current user states to show goal update live!
        onRefreshUser();
      }
    } catch (err) {
      console.error('Error responding to request', err);
    } finally {
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  return (
    <div id="request-screen-root" className="max-w-4xl mx-auto py-6 px-4 space-y-8 font-sans">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600" />
            Extra Screen-Time Allocations
          </h2>
          <p className="text-xs text-slate-500">Allow children to request supplementary minutes for school tasks or weekend rewards.</p>
        </div>

        <div className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-xl text-[10px] text-blue-700 font-bold flex items-center gap-1 shrink-0">
          {isParent ? (
            <>👑 Parent Review Mode</>
          ) : (
            <>👦 Child Request Panel</>
          )}
        </div>
      </div>

      {feedback && (
        <div id="req-feedback-alert" className="p-3 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-2xl font-semibold text-center animate-pulse">
          {feedback}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: Form (if child) or Queue Statistics (if parent) */}
        <div className="md:col-span-1 space-y-6">
          
          {!isParent ? (
            /* Submission Form for Kids */
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="font-bold text-slate-800 text-base">Request Additional Time</h3>
                <p className="text-[11px] text-slate-400 mt-1">Provide clear academic or creative reasons to help your parents decide.</p>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Category</label>
                  <select
                    id="request-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as keyof CategoryBreakdown)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-slate-50/50"
                  >
                    <option value="education">📚 Educational Study</option>
                    <option value="productivity">🚀 Productivity / Creation</option>
                    <option value="gaming">🎮 Leisure Gaming</option>
                    <option value="entertainment">🍿 Entertainment</option>
                    <option value="other">⚙️ Other Activities</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Requested Minutes</label>
                  <select
                    id="request-minutes-select"
                    value={requestedMinutes}
                    onChange={(e) => setRequestedMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-slate-50/50"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>1 Hour</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Justification Reason</label>
                  <textarea
                    id="request-reason-input"
                    rows={3}
                    placeholder="e.g. I need to finish my school presentation slides."
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-slate-50/50 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  id="submit-allocation-request-btn"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl shadow-sm text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Allocation Request
                </button>
              </form>
            </div>
          ) : (
            /* Queue Guidelines for Parents */
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-base">Parental Review Panel</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Approve or decline temporary additions. Encouraging educational apps over games builds balanced self-regulation in children.
              </p>

              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-indigo-700">Recommended Policy</span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Approve presentation preparation or language drills. Limit gaming request extensions to active weekends after offline tasks.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Queue (both roles see, but parents can approve/reject!) */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Allocation Status History</h3>

          {loading ? (
            <div className="text-center py-6">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 font-bold text-xs">
              No Request Available
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => {
                const isPending = req.status === 'pending';
                const isApproved = req.status === 'approved';
                const isRejected = req.status === 'rejected';

                let tagClass = 'bg-amber-50 text-amber-700 border-amber-100';
                if (isApproved) tagClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                if (isRejected) tagClass = 'bg-red-50 text-red-700 border-red-100';

                return (
                  <div key={req.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Request from {req.userName}</span>
                        <h4 className="font-extrabold text-slate-800 text-sm mt-0.5">
                          +{req.requestedMinutes} mins for {req.category.toUpperCase()}
                        </h4>
                      </div>

                      <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border font-bold ${tagClass}`}>
                        {req.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 italic bg-slate-50/50 p-3 rounded-2xl border border-slate-200">
                      “{req.reason}”
                    </p>

                    {/* Show Admin/Parent responses or notes */}
                    {req.note && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5 px-1 font-semibold">
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Parent note: <span className="italic">“{req.note}”</span>
                      </p>
                    )}

                    {/* Decision Bar (only pending & for parents!) */}
                    {isPending && isParent && (
                      <div className="pt-3 border-t border-slate-200 space-y-3">
                        {/* Note Input field */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add approval note (optional)..."
                            value={selectedReqIdForNote === req.id ? parentNote : ''}
                            onChange={(e) => {
                              setSelectedReqIdForNote(req.id);
                              setParentNote(e.target.value);
                            }}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:outline-none"
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            id={`approve-btn-${req.id}`}
                            onClick={() => handleRespond(req.id, 'approved')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve (+{req.requestedMinutes}m)
                          </button>
                          <button
                            type="button"
                            id={`reject-btn-${req.id}`}
                            onClick={() => handleRespond(req.id, 'rejected')}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
