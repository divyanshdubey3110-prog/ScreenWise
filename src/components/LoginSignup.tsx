/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { API } from '../api';
import { Shield, Sparkles, LogIn, UserPlus, Heart, Laptop, Eye, EyeOff } from 'lucide-react';
import ScreenWiseLogo from './ScreenWiseLogo';

interface LoginSignupProps {
  onAuthSuccess: (user: User) => void;
}

export default function LoginSignup({ onAuthSuccess }: LoginSignupProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('parent');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  
  // Multi-family signup state variables
  const [inviteCode, setInviteCode] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [parentAction, setParentAction] = useState<'create' | 'join'>('create');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (forgotPasswordMode) {
        // Mock forgot password
        setTimeout(() => {
          setSuccess(`A password reset link has been sent to ${email}.`);
          setLoading(false);
          setForgotPasswordMode(false);
        }, 1000);
        return;
      }

      if (isLogin) {
        if (!password) {
          setError('Please provide your password.');
          setLoading(false);
          return;
        }
        const payloadEmail = email || (role === 'parent' ? 'divyanshdubey3110@gmail.com' : 'rahul@screenwise.com');
        const res = await API.login(payloadEmail, password, role);
        if (res.success) {
          setSuccess('Welcome back! Logging you in...');
          setTimeout(() => {
            onAuthSuccess(res.user);
          }, 800);
        } else {
          setError(res.error || 'Invalid login credentials or email.');
        }
      } else {
        if (!name) {
          setError('Please provide a full name.');
          setLoading(false);
          return;
        }
        if (!password) {
          setError('Please specify a password.');
          setLoading(false);
          return;
        }

        // Multi-family validations
        if (role === 'child' && !inviteCode.trim()) {
          setError('Please specify your family invitation code to sign up as a Child.');
          setLoading(false);
          return;
        }
        if (role === 'parent' && parentAction === 'create' && !familyName.trim()) {
          setError('Please specify a Family Name to create a new family.');
          setLoading(false);
          return;
        }
        if (role === 'parent' && parentAction === 'join' && !inviteCode.trim()) {
          setError('Please specify a family invitation code to join.');
          setLoading(false);
          return;
        }

        const rel = relation || (role === 'parent' ? 'Mother/Father' : 'Son/Daughter');
        const goal = role === 'parent' ? 240 : 120;
        const res = await API.signup({
          name,
          email,
          password,
          role,
          relation: rel,
          dailyGoal: goal,
          inviteCode: (role === 'child' || parentAction === 'join') ? inviteCode.trim() : undefined,
          familyName: (role === 'parent' && parentAction === 'create') ? familyName.trim() : undefined
        });
        if (res.success) {
          setSuccess('Account created successfully! Welcome to ScreenWise.');
          setTimeout(() => {
            onAuthSuccess(res.user);
          }, 800);
        } else {
          setError(res.error || 'Error signing up. Email might already be taken.');
        }
      }
    } catch (err) {
      setError('An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoQuickLogin = async (demoRole: UserRole, demoEmail: string) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await API.login(demoEmail, '123456', demoRole);
      if (res.success) {
        setSuccess(`Logged in as ${res.user.name} (${res.user.relation})!`);
        setTimeout(() => {
          onAuthSuccess(res.user);
        }, 800);
      } else {
        setError(res.error || 'Quick demo login failed.');
      }
    } catch (err) {
      setError('Could not connect to the API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-screen-root" className="min-h-[85vh] flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 grid md:grid-cols-2">
        
        {/* Visual Illustration Panel */}
        <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Background decorative circles */}
          <div className="absolute top-[-20%] right-[-20%] w-72 h-72 rounded-full bg-white/10 blur-xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-60 h-60 rounded-full bg-indigo-200/10 blur-lg"></div>

          <div className="relative z-10">
            <div className="mb-6">
              <ScreenWiseLogo size="md" showText={true} theme="white" />
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight leading-tight mb-4">
              Cultivate Healthy Digital Habits Together
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              Balance screen time, motivate children with fun challenges, coordinate offline family events, and track improvement indicators as a unified group.
            </p>
          </div>

          {/* Custom SVG Family/Wellbeing Illustration */}
          <div className="relative my-4 flex justify-center items-center z-10">
            <svg viewBox="0 0 200 140" className="w-56 h-auto drop-shadow-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Floor/Ground */}
              <ellipse cx="100" cy="125" rx="80" ry="12" fill="white" fillOpacity="0.15" />
              {/* Sofa / Cozy Area */}
              <path d="M40,110 L160,110 L150,122 L50,122 Z" fill="#ffffff" fillOpacity="0.25" />
              {/* Parent */}
              <circle cx="75" cy="70" r="14" fill="#ffffff" />
              <path d="M75,84 C63,84 57,98 57,112 L93,112 C93,98 87,84 75,84 Z" fill="#93c5fd" />
              {/* Child */}
              <circle cx="125" cy="78" r="10" fill="#ffffff" />
              <path d="M125,88 C117,88 112,98 112,110 L138,110 C138,98 133,88 125,88 Z" fill="#c084fc" />
              {/* Devices Floating Away (Crossed Out / Blocked Indicator) */}
              <g transform="translate(100, 30)">
                <rect x="-12" y="-18" width="24" height="36" rx="4" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2" />
                <rect x="-8" y="-13" width="16" height="26" rx="2" fill="#3b82f6" fillOpacity="0.3" />
                <circle cx="0" cy="15" r="1.5" fill="white" />
                {/* Hearth/Shield Protection Glow */}
                <path d="M-15, -2 C0,-20 0,-20 15,-2" stroke="#fcd34d" strokeWidth="2" strokeDasharray="3,3" />
              </g>
              {/* Sun/Heart glow */}
              <path d="M92,80 Q100,72 108,80 Q100,88 92,80 Z" fill="#ef4444" />
            </svg>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/20 text-xs text-blue-100 flex items-center justify-between">
            <span>👨‍👩‍👧‍👦 Created for Digital Wellbeing</span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400 fill-red-400" /> Active Family Care</span>
          </div>
        </div>

        {/* Authentication Form Panel */}
        <div className="p-8 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-800">
              {forgotPasswordMode ? 'Reset Your Password' : isLogin ? 'Welcome Back' : 'Create Family Account'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {forgotPasswordMode 
                ? 'Enter your email to receive recovery instructions.' 
                : isLogin 
                  ? 'Access your routines, rewards, and logs.' 
                  : 'Get started and connect with your household.'}
            </p>
          </div>

          {/* Form Switcher (Only when not in forgot password) */}
          {!forgotPasswordMode && (
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button
                type="button"
                id="toggle-login-tab"
                onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                className={`flex-1 text-center py-2 text-sm font-semibold rounded-lg transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                id="toggle-signup-tab"
                onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                className={`flex-1 text-center py-2 text-sm font-semibold rounded-lg transition-all ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Register
              </button>
            </div>
          )}

          {error && (
            <div id="auth-error-msg" className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl mb-4 font-medium">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div id="auth-success-msg" className="p-3 bg-green-50 border border-green-200 text-green-600 text-xs rounded-xl mb-4 font-medium flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-green-500" /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Selection Option */}
            {!forgotPasswordMode && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Identify Your Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    id="role-parent-btn"
                    onClick={() => setRole('parent')}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${role === 'parent' ? 'border-indigo-500 bg-indigo-50/50 text-indigo-800' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👨‍💼</span>
                      <div>
                        <p className="text-xs font-bold leading-none">Parent</p>
                        <p className="text-[10px] text-slate-500 mt-1">Admin & Controls</p>
                      </div>
                    </div>
                    {role === 'parent' && <div className="w-2 h-2 rounded-full bg-indigo-600"></div>}
                  </button>
                  <button
                    type="button"
                    id="role-child-btn"
                    onClick={() => setRole('child')}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${role === 'child' ? 'border-purple-500 bg-purple-50/50 text-purple-800' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👦</span>
                      <div>
                        <p className="text-xs font-bold leading-none">Child / Teen</p>
                        <p className="text-[10px] text-slate-500 mt-1">Activities & Polls</p>
                      </div>
                    </div>
                    {role === 'child' && <div className="w-2 h-2 rounded-full bg-purple-600"></div>}
                  </button>
                </div>
              </div>
            )}

            {/* Form Fields */}
            {!isLogin && !forgotPasswordMode && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Full Name</label>
                <input
                  type="text"
                  id="signup-name"
                  placeholder="Divyansh Dubey"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-slate-50/50"
                />
              </div>
            )}

            {!isLogin && !forgotPasswordMode && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Relationship to family (e.g. Son, Daughter, Mother, Father)</label>
                <input
                  type="text"
                  id="signup-relation"
                  placeholder="e.g. Son"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-slate-50/50"
                />
              </div>
            )}

            {/* Multi-Family Selection Setup */}
            {!isLogin && !forgotPasswordMode && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Family Association</p>
                
                {role === 'parent' ? (
                  <div className="space-y-3">
                    <div className="flex gap-2 p-1 bg-slate-200/60 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setParentAction('create')}
                        className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          parentAction === 'create'
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        Create New Family
                      </button>
                      <button
                        type="button"
                        onClick={() => setParentAction('join')}
                        className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          parentAction === 'join'
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        Join Family (Invite)
                      </button>
                    </div>

                    {parentAction === 'create' ? (
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 block">Family Name</label>
                        <input
                          type="text"
                          id="signup-family-name"
                          placeholder="e.g. Dubey Family"
                          value={familyName}
                          onChange={(e) => setFamilyName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
                        />
                        <span className="text-[10px] text-slate-500 block leading-tight mt-1">
                          Creates a brand new separate ScreenWise panel and generates a code for children.
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 block">Family Invitation Code</label>
                        <input
                          type="text"
                          id="signup-invite-code-parent"
                          placeholder="e.g. SW-9842-FAM"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white uppercase font-mono"
                        />
                        <span className="text-[10px] text-slate-500 block leading-tight mt-1">
                          Enter your family's 10-character code to join as a co-parent/co-admin.
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Family Invitation Code</label>
                    <input
                      type="text"
                      id="signup-invite-code-child"
                      placeholder="e.g. SW-9842-FAM"
                      required={role === 'child'}
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white uppercase font-mono"
                    />
                    <span className="text-[10px] text-slate-500 block leading-tight mt-1">
                      Ask your parent/admin for the code from their screen, or use the demo family code: <strong className="font-semibold text-indigo-600">SW-9842-FAM</strong>.
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">Email Address</label>
              <input
                type="email"
                id="auth-email"
                placeholder={role === 'parent' ? 'parent@screenwise.com' : 'child@screenwise.com'}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-slate-50/50"
              />
            </div>

            {!forgotPasswordMode && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-600 block">Password</label>
                  {isLogin && (
                    <button
                      type="button"
                      id="forgot-password-btn"
                      onClick={() => setForgotPasswordMode(true)}
                      className="text-[11px] text-indigo-600 hover:underline font-medium focus:outline-none"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="auth-password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              id="auth-submit-btn"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : forgotPasswordMode ? (
                'Send Reset Instructions'
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Create Account
                </>
              )}
            </button>

            {forgotPasswordMode && (
              <button
                type="button"
                id="cancel-forgot-btn"
                onClick={() => setForgotPasswordMode(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl transition-all text-sm focus:outline-none"
              >
                Back to Sign In
              </button>
            )}
          </form>


        </div>

      </div>
    </div>
  );
}
