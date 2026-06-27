/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, EmergencyContact } from '../types';
import { API } from '../api';
import { ShieldCheck, Plus, Trash2, Phone, Sparkles, Sliders, Bell } from 'lucide-react';

interface EmergencyContactScreenProps {
  currentUser: User;
}

export default function EmergencyContactScreen({ currentUser }: EmergencyContactScreenProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [allowEmergency, setAllowEmergency] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [allowedApps, setAllowedApps] = useState<string[]>(['Phone']);
  const [feedback, setFeedback] = useState('');

  const isParent = currentUser.role === 'parent';

  const loadContacts = async () => {
    try {
      const res = await API.getContacts();
      setContacts(res.contacts);
      setAllowEmergency(res.allowEmergencyCallsRestrictedTime);
    } catch (err) {
      console.error('Error loading contacts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleToggleEmergency = async (val: boolean) => {
    if (!isParent) {
      setFeedback('⚠️ Parental access required to toggle calling overrides.');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    try {
      setAllowEmergency(val);
      await API.toggleEmergencyCalls(val);
      setFeedback(`Emergency call bypass set to: ${val ? 'ALLOWED' : 'RESTRICTED'}`);
    } catch (err) {
      console.error('Error toggling emergency override', err);
    } finally {
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isParent) {
      setFeedback('⚠️ Only parents can define emergency bypass contacts.');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    if (!name.trim() || !phoneNumber.trim()) return;

    try {
      const res = await API.createContact({
        name,
        relationship,
        phoneNumber,
        allowedCallingApps: allowedApps
      });

      if (res.success) {
        setContacts(prev => [...prev, res.contact]);
        setFeedback(`Emergency bypass configured for ${name}!`);
        setShowAddForm(false);
        setName('');
        setRelationship('');
        setPhoneNumber('');
        setAllowedApps(['Phone']);
      }
    } catch (err) {
      console.error('Error adding contact', err);
    } finally {
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleDeleteContact = async (id: string, contactName: string) => {
    if (!isParent) {
      setFeedback('⚠️ Parental authorization required.');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    try {
      setContacts(prev => prev.filter(c => c.id !== id));
      await API.deleteContact(id);
      setFeedback(`Bypass deleted for ${contactName}.`);
    } catch (err) {
      console.error('Error deleting contact', err);
    } finally {
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleToggleApp = (app: string) => {
    if (allowedApps.includes(app)) {
      setAllowedApps(prev => prev.filter(a => a !== app));
    } else {
      setAllowedApps(prev => [...prev, app]);
    }
  };

  return (
    <div id="emergency-screen-root" className="max-w-4xl mx-auto py-6 px-4 space-y-8 font-sans">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            Emergency Contacts Override
          </h2>
          <p className="text-xs text-slate-500">Configure safety bypasses so children remain reachable by key contacts during study & sleep blocks.</p>
        </div>

        {isParent ? (
          <button
            type="button"
            id="add-contact-trigger-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Emergency Contact
          </button>
        ) : (
          <div className="px-3 py-1 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-700 font-bold flex items-center gap-1 shrink-0">
            ⚠️ View Only (Child Profile)
          </div>
        )}
      </div>

      {feedback && (
        <div id="emergency-feedback-alert" className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl font-semibold text-center">
          {feedback}
        </div>
      )}

      {/* Safety Bypass General Toggle */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-800 text-sm">Allow emergency calls during restricted time</h3>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            When enabled, children can receive phone calls and utilize permitted communication apps from designated safety contacts, even during scheduled Dinner or Bedtime screen-locks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase ${allowEmergency ? 'text-indigo-600' : 'text-slate-400'} font-mono`}>
            {allowEmergency ? 'Bypass Active' : 'Restricted'}
          </span>
          <button
            type="button"
            id="toggle-emergency-calls-btn"
            disabled={!isParent}
            onClick={() => handleToggleEmergency(!allowEmergency)}
            className={`w-12 h-6 rounded-full p-1 transition-all relative cursor-pointer ${allowEmergency ? 'bg-indigo-600' : 'bg-slate-300'} ${!isParent && 'opacity-50 cursor-not-allowed'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-all shadow ${allowEmergency ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>

      {/* Add Contact Form Panel */}
      {showAddForm && isParent && (
        <form onSubmit={handleAddContact} className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4 animate-fadeIn">
          <h3 className="font-bold text-slate-800 text-sm">Add Safety Bypass Contact</h3>
          
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">Contact Name</label>
              <input
                type="text"
                id="contact-name-input"
                placeholder="e.g. Uncle Ramesh"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs bg-slate-50/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">Relationship</label>
              <input
                type="text"
                id="contact-rel-input"
                placeholder="e.g. Uncle, Doctor"
                required
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs bg-slate-50/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">Phone Number</label>
              <input
                type="tel"
                id="contact-phone-input"
                placeholder="e.g. +91 98765 43210"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs bg-slate-50/50"
              />
            </div>
          </div>

          {/* Allowed Apps Row */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-600 block">Permitted Calling Apps (Bypass restricted blocks)</span>
            <div className="flex gap-3">
              {['Phone', 'WhatsApp', 'FaceTime'].map((app) => {
                const active = allowedApps.includes(app);
                return (
                  <button
                    key={app}
                    type="button"
                    onClick={() => handleToggleApp(app)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${active ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500'}`}
                  >
                    {app}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              id="save-contact-btn"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Save Bypass Contact
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Safety Contacts Grid */}
      {loading ? (
        <div className="text-center py-6">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 text-xs">
          No emergency contacts declared. Define safety bypass contacts to ensure reachable communications.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {contacts.map((con) => {
            return (
              <div key={con.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between h-36">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                      📞
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm leading-none">{con.name}</h4>
                      <span className="text-[10px] text-slate-400 font-bold block mt-1">{con.relationship}</span>
                    </div>
                  </div>

                  {isParent && (
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(con.id, con.name)}
                      className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 text-red-500 transition-colors cursor-pointer"
                      title="Delete Bypass"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-600 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {con.phoneNumber}
                  </span>
                  
                  {/* Apps allowed pills */}
                  <div className="flex gap-1">
                    {con.allowedCallingApps.map(app => (
                      <span key={app} className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                        {app}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
