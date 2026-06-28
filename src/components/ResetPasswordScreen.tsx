import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Layers, Lock, Key, ArrowRight, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface ResetPasswordScreenProps {
  theme: 'dark' | 'light';
  onBackToLogin: () => void;
}

export default function ResetPasswordScreen({ theme, onBackToLogin }: ResetPasswordScreenProps) {
  const isLight = theme === 'light';
  const { updatePassword, signOut } = useAuth();

  // Form states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Status states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleRedirectToLogin = async () => {
    try {
      await signOut();
    } catch (e) {
      console.warn('Signout warning during password reset flow redirection:', e);
    }
    onBackToLogin();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validation
    if (!password || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please request identical credentials.');
      return;
    }

    setSubmitting(true);

    const { error } = await updatePassword(password);
    setSubmitting(false);

    if (error) {
      setErrorMsg(error.message || 'Failed to update your password. Your link might be expired.');
    } else {
      setSuccessMsg('Your password has been updated successfully.');
      setPassword('');
      setConfirmPassword('');
      
      // Auto redirect with a beautiful countdown
      let count = 4;
      setCountdown(count);
      const interval = setInterval(async () => {
        count -= 1;
        if (count <= 0) {
          clearInterval(interval);
          await handleRedirectToLogin();
        } else {
          setCountdown(count);
        }
      }, 1000);
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
            Corporate Password Restoration Block
          </p>
        </div>

        {/* Form Enclosure */}
        <div className={`p-8 rounded-3xl border transition-all duration-300 ${
          isLight ? 'bg-white border-slate-250 shadow-2xl' : 'bg-slate-900 border-slate-800 shadow-2xl shadow-black/60'
        }`}>
          
          <div className="border-b border-slate-800/25 dark:border-slate-800 mb-6 pb-2 text-center text-indigo-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider block">
              Set New Password
            </span>
            <span className="text-[10px] text-slate-500 font-mono block mt-1">
              Provide a highly secure corporate passphrase.
            </span>
          </div>

          {/* Form Message Statuses */}
          {errorMsg && (
            <div className="p-3.5 mb-5 rounded-xl text-xs bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-2.5 animate-pulse">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 mb-5 rounded-xl text-xs bg-green-500/10 border border-green-500/20 text-green-500 flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <Check className="w-4.5 h-4.5 shrink-0 text-green-450" />
                <span>{successMsg}</span>
              </div>
              {countdown !== null && (
                <span className="text-[10px] font-mono text-slate-400 pl-7">
                  Redirecting to sign in screen in {countdown}s...
                </span>
              )}
            </div>
          )}

          {!successMsg ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 dark:text-slate-450 uppercase font-bold tracking-wider font-mono block">
                  New Passphrase
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="At least 8 characters"
                    className={`w-full pl-11 pr-11 py-3 text-sm rounded-xl border outline-none transition-all ${
                      isLight 
                        ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500' 
                        : 'bg-slate-950 border-slate-800 text-slate-150 focus:border-indigo-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 dark:text-slate-450 uppercase font-bold tracking-wider font-mono block">
                  Confirm Passphrase
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat your password"
                    className={`w-full pl-11 pr-11 py-3 text-sm rounded-xl border outline-none transition-all ${
                      isLight 
                        ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500' 
                        : 'bg-slate-950 border-slate-800 text-slate-150 focus:border-indigo-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-indigo-650/20 active:scale-98 cursor-pointer flex justify-center items-center gap-2"
              >
                {submitting ? 'Updating Passphrase...' : 'Reset Passphrase'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button
              onClick={handleRedirectToLogin}
              className="w-full py-3 mt-2 bg-slate-850 hover:bg-slate-800 text-white hover:text-indigo-400 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-800 cursor-pointer flex justify-center items-center gap-2"
            >
              Sign In Now
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="mt-5 pt-4 border-t border-slate-850 text-center">
            <button
              onClick={handleRedirectToLogin}
              className="text-xs font-mono text-slate-400 hover:text-indigo-400 cursor-pointer transition-colors"
            >
              ← Back to login portal
            </button>
          </div>

        </div>

        {/* Footer Support Info */}
        <p className="text-center text-[10px] text-slate-500 mt-6 font-mono max-w-sm mx-auto leading-relaxed">
          Need database integration help? Sign in and use the <strong>Developer Console & SQL Schema</strong> tab to easily provision your Cloud persistence.
        </p>

      </div>
    </div>
  );
}
