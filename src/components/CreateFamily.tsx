/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Family, User } from '../types';
import { API } from '../api';
import { Users, Copy, Check, QrCode, Sparkles, Send, ShieldAlert } from 'lucide-react';

interface CreateFamilyProps {
  onSuccess: (family: Family, members: User[]) => void;
  currentFamily: Family | null;
  currentUser: User;
}

export default function CreateFamily({ onSuccess, currentFamily, currentUser }: CreateFamilyProps) {
  const [familyName, setFamilyName] = useState('');
  const [parentName, setParentName] = useState(currentUser.name || '');
  const [limitCount, setLimitCount] = useState(4);
  const [inviteCodeToJoin, setInviteCodeToJoin] = useState('');
  
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim() || !parentName.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await API.createFamily({
        familyName,
        parentName,
        limitCount
      });
      if (res.success) {
        setSuccess('Family group created successfully!');
        setTimeout(() => {
          onSuccess(res.family, res.members);
        }, 1000);
      } else {
        setError('Could not create family group. Try again.');
      }
    } catch (err) {
      setError('Connection failed. Server could not be reached.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeToJoin.trim()) {
      setError('Please enter a valid invite code.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await API.joinFamily(inviteCodeToJoin);
      if (res.success) {
        setSuccess(`Successfully joined ${res.family.name}!`);
        // Refresh family overview
        const famDetails = await API.getFamily();
        setTimeout(() => {
          onSuccess(famDetails.family!, famDetails.members);
        }, 1000);
      } else {
        setError('Invalid invite code. Please check and try again.');
      }
    } catch (err) {
      setError('Invalid code or connection timed out.');
    } finally {
      setLoading(false);
    }
  };

  const copyInvite = () => {
    if (currentFamily) {
      navigator.clipboard.writeText(currentFamily.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div id="create-family-root" className="max-w-4xl mx-auto py-6 px-4 font-sans">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center gap-2">
          <Users className="w-8 h-8 text-indigo-600" />
          {currentFamily ? 'Your Family Circle' : 'Set Up Your Family Group'}
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          {currentFamily 
            ? `Manage connection protocols, download join codes, or invite members to join ${currentFamily.name}.`
            : 'Join an existing family network or establish a new digital wellbeing workspace.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium font-mono">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-2xl text-sm font-medium flex items-center gap-2 font-mono">
          <Sparkles className="w-5 h-5 text-green-500 animate-pulse" /> {success}
        </div>
      )}

      {currentFamily ? (
        /* Family Already Created Screen */
        <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-200 grid md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5" /> Group Configuration Ready
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-slate-800">{currentFamily.name}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Established by parent workspace administrator
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Family Invitation Hash Code</span>
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                <code className="text-lg font-bold font-mono text-indigo-700">{currentFamily.inviteCode}</code>
                <button
                  type="button"
                  id="copy-invite-btn"
                  onClick={copyInvite}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Provide this invitation code to other family members. When they sign in, they can enter this code to join your shared dashboard, align logs, and participate in offline polls.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-200 text-center">
            <QrCode className="w-8 h-8 text-indigo-600 mb-3" />
            <h4 className="text-sm font-bold text-slate-700">Scan to Sync Dashboard</h4>
            <p className="text-xs text-slate-500 mb-5 max-w-xs">
              Children can scan this QR code directly using their phone cameras to link workspaces.
            </p>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
              <img
                src={currentFamily.qrCodeUrl}
                alt="Family QR Invite Link"
                className="w-32 h-32"
              />
            </div>
            <span className="text-[10px] text-indigo-600 mt-4 font-mono font-bold tracking-wider">SECURE SYNC PROTOCOL ACTIVE</span>
          </div>

        </div>
      ) : (
        /* Create New Family / Join Family Panels */
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Create New Family */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 flex flex-col justify-between">
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-lg font-bold text-slate-800">Establish Family Group</h3>
                <p className="text-xs text-slate-500">Create a central hub for device logs, activity planning, and schedule locks.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Family Group Surname / Name</label>
                <input
                  type="text"
                  id="create-family-name"
                  placeholder="e.g. Dubey Family"
                  required
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Primary Parent Name</label>
                <input
                  type="text"
                  id="create-family-parent"
                  placeholder="e.g. Divyansh Dubey"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Planned Group Members Limit</label>
                <select
                  id="create-family-limit"
                  value={limitCount}
                  onChange={(e) => setLimitCount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50/50"
                >
                  <option value={2}>2 Members</option>
                  <option value={3}>3 Members</option>
                  <option value={4}>4 Members (Recommended)</option>
                  <option value={5}>5 Members</option>
                  <option value={6}>6+ Members</option>
                </select>
              </div>

              <button
                type="submit"
                id="submit-create-family-btn"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-indigo-100 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer pt-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Initialize Family Workspace
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Join Existing Family */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 flex flex-col justify-between">
            <form onSubmit={handleJoin} className="space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-lg font-bold text-slate-800">Join Family Circle</h3>
                <p className="text-xs text-slate-500">Connect to an established group to coordinate schedules and report usage metrics.</p>
              </div>

              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex gap-3">
                <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-800 leading-relaxed">
                  <strong>Parent/Admin Invitation Needed:</strong> Ask your parent administrator for the 10-character code (e.g. SW-9842-FAM) generated on their ScreenWise panel.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Invitation Hash Code</label>
                <input
                  type="text"
                  id="join-family-code"
                  placeholder="e.g. SW-9842-FAM"
                  required
                  value={inviteCodeToJoin}
                  onChange={(e) => setInviteCodeToJoin(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50/50 font-mono text-center text-lg uppercase tracking-widest text-indigo-700"
                />
              </div>

              <button
                type="submit"
                id="submit-join-family-btn"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-indigo-100 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer pt-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Bind Workspace Profile
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
