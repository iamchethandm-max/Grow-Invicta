import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Layers, Mail, Lock, User, PlusCircle, ArrowRight, Check, AlertCircle, HelpCircle } from 'lucide-react';

interface LoginScreenProps {
  theme: 'dark' | 'light';
}

export default function LoginScreen({ theme }: LoginScreenProps) {
  const isLight = theme === 'light';
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  
  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // Status states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleModeChange = (newMode: 'signin' | 'signup' | 'forgot') => {
    setMode(newMode);
    clearMessages();
  };

  const handleSubmitSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please provide both your email and password.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const { error } = await signIn(email, password);
    setSubmitting(false);

    if (error) {
      setErrorMsg(error.message || 'Failed to authenticate. Check your credentials.');
    } else {
      setSuccessMsg('Successfully authenticated! Loading dashboard...');
    }
  };

  const handleSubmitSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !companyName) {
      setErrorMsg('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const { error } = await signUp(email, password, fullName, companyName);
    setSubmitting(false);

    if (error) {
      setErrorMsg(error.message || 'Could not register new SaaS account.');
    } else {
      setSuccessMsg('Account registered successfully! An email verification has been issued. Please check your inbox to verify your corporate account.');
    }
  };

  const handleSubmitForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please input your registered email address.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const { error } = await resetPassword(email);
    setSubmitting(false);

    if (error) {
      setErrorMsg(error.message || 'Could not send recovery link.');
    } else {
      setSuccessMsg('A password restoration link has been sent to your email inbox.');
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setErrorMsg('');
    const { error } = await signInWithGoogle();
    setSubmitting(false);
    if (error) {
      setErrorMsg(error.message || 'Google Auth flow initialization failed.');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans transition-colors relative ${
      isLight ? 'bg-slate-50 text-slate-800' : 'bg-slate-950 text-slate-100'
    }`}>
      
      {/* Background modern radial glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-indigo-600 opacity-[0.08] blur-[120px] absolute" />
        <div className="w-[300px] h-[300px] rounded-full bg-indigo-500 opacity-[0.06] blur-[80px] absolute translate-x-20 -translate-y-20" />
      </div>

      <div className="relative w-full max-w-md z-10 animate-fade-in">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-650/20 mb-4 hover:scale-105 transition-transform duration-300">
            <Layers className="w-8 h-8" />
          </div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            GrowInvicta SaaS Suite
          </h1>
          <p className="text-xs text-indigo-400 font-semibold font-mono mt-1 uppercase tracking-widest">
            Multi-User Project & Client CRM Platform
          </p>
        </div>

        {/* Auth Enclosure */}
        <div className={`p-8 rounded-3xl border transition-all duration-300 ${
          isLight ? 'bg-white border-slate-250 shadow-2xl' : 'bg-slate-900 border-slate-800 shadow-2xl shadow-black/60'
        }`}>
          
          {/* Tabs */}
          <div className="flex border-b border-slate-800/25 dark:border-slate-800 mb-6 pb-2 justify-center gap-6">
            <button
              onClick={() => handleModeChange('signin')}
              className={`pb-2 text-xs font-mono font-bold uppercase cursor-pointer tracking-wider transition-all border-b-2 ${
                mode === 'signin' 
                  ? 'border-indigo-500 text-indigo-505 dark:text-indigo-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-350 dark:text-slate-500'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleModeChange('signup')}
              className={`pb-2 text-xs font-mono font-bold uppercase cursor-pointer tracking-wider transition-all border-b-2 ${
                mode === 'signup' 
                  ? 'border-indigo-500 text-indigo-550 dark:text-indigo-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-350 dark:text-slate-500'
              }`}
            >
              Sign Up
            </button>
            {mode === 'forgot' && (
              <span className="pb-2 text-xs font-mono font-bold uppercase tracking-wider border-b-2 border-indigo-500 text-indigo-400">
                Recover Account
              </span>
            )}
          </div>

          {/* Form Message Statuses */}
          {errorMsg && (
            <div className="p-3.5 mb-5 rounded-xl text-xs bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-2.5 animate-pulse">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 mb-5 rounded-xl text-xs bg-green-500/10 border border-green-500/20 text-green-500 flex items-start gap-2.5">
              <Check className="w-4.5 h-4.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* FORM: Sign In */}
          {mode === 'signin' && (
            <form onSubmit={handleSubmitSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 dark:text-slate-450 uppercase font-bold tracking-wider font-mono block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="email@company.com"
                    className={`w-full pl-11 pr-4 py-3 text-sm rounded-xl border outline-none transition-all ${
                      isLight 
                        ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500' 
                        : 'bg-slate-950 border-slate-800 text-slate-150 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-500 dark:text-slate-450 uppercase font-bold tracking-wider font-mono block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => handleModeChange('forgot')}
                    className="text-[10px] font-mono text-indigo-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-4 py-3 text-sm rounded-xl border outline-none transition-all ${
                      isLight 
                        ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500' 
                        : 'bg-slate-950 border-slate-800 text-slate-150 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-indigo-650/20 active:scale-98 cursor-pointer flex justify-center items-center gap-2"
              >
                {submitting ? 'Authenticating...' : 'Sign In To Workspace'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* FORM: Sign Up */}
          {mode === 'signup' && (
            <form onSubmit={handleSubmitSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 dark:text-slate-450 uppercase font-bold tracking-wider font-mono block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="John Doe"
                    className={`w-full pl-11 pr-4 py-3 text-sm rounded-xl border outline-none transition-all ${
                      isLight 
                        ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500' 
                        : 'bg-slate-950 border-slate-800 text-slate-150 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 dark:text-slate-450 uppercase font-bold tracking-wider font-mono block">
                  Company Name (SaaS Tenant ID)
                </label>
                <div className="relative">
                  <PlusCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    placeholder="GrowInvicta Agency"
                    className={`w-full pl-11 pr-4 py-3 text-sm rounded-xl border outline-none transition-all ${
                      isLight 
                        ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500' 
                        : 'bg-slate-950 border-slate-800 text-slate-150 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 dark:text-slate-450 uppercase font-bold tracking-wider font-mono block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="john@company.com"
                    className={`w-full pl-11 pr-4 py-3 text-sm rounded-xl border outline-none transition-all ${
                      isLight 
                        ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500' 
                        : 'bg-slate-950 border-slate-800 text-slate-150 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 dark:text-slate-450 uppercase font-bold tracking-wider font-mono block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="At least 6 characters"
                    className={`w-full pl-11 pr-4 py-3 text-sm rounded-xl border outline-none transition-all ${
                      isLight 
                        ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500' 
                        : 'bg-slate-950 border-slate-800 text-slate-150 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 mt-2 bg-indigo-650 hover:bg-slate-800 hover:text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-98 cursor-pointer flex justify-center items-center gap-2"
              >
                {submitting ? 'Registering...' : 'Provision New Tenant'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* FORM: Forgot Password */}
          {mode === 'forgot' && (
            <form onSubmit={handleSubmitForgot} className="space-y-4 animate-fadeIn">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 dark:text-slate-450 uppercase font-bold tracking-wider font-mono block">
                  SaaS Connected Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your-email@company.com"
                    className={`w-full pl-11 pr-4 py-3 text-sm rounded-xl border outline-none transition-all ${
                      isLight 
                        ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500' 
                        : 'bg-slate-950 border-slate-800 text-slate-150 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer flex justify-center items-center gap-2"
              >
                {submitting ? 'Sending Request...' : 'Send Password recovery Link'}
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('signin')}
                className="w-full text-center text-xs text-slate-400 hover:text-indigo-400 mt-2 font-mono"
              >
                ← Return to Sign In
              </button>
            </form>
          )}

          {/* GOOGLE SIGN IN BAR */}
          {(mode === 'signin' || mode === 'signup') && (
            <div className="mt-6 pt-5 border-t border-slate-800/25 dark:border-slate-800/50">
              <div className="relative mb-4 text-center">
                <span className={`px-3 text-[10px] font-mono tracking-wider uppercase ${
                  isLight ? 'bg-white text-slate-400' : 'bg-slate-900 text-slate-500'
                }`}>
                  Or connect with identity
                </span>
              </div>
              <button
                onClick={handleGoogleLogin}
                disabled={submitting}
                type="button"
                className={`w-full py-3 border rounded-xl flex items-center justify-center gap-3 text-xs font-mono font-bold uppercase tracking-wider hover:bg-indigo-50 hover:text-slate-950 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                  isLight 
                    ? 'border-slate-200 text-slate-700 bg-white' 
                    : 'border-slate-800 text-slate-350 bg-slate-950'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Google Identity authentication
              </button>
            </div>
          )}

        </div>

        {/* Footer Support Info */}
        <p className="text-center text-[10px] text-slate-500 mt-6 font-mono max-w-sm mx-auto leading-relaxed">
          Need database integration help? Sign in and use the <strong>Developer Console & SQL Schema</strong> tab to easily provision your Cloud persistence.
        </p>

      </div>
    </div>
  );
}
