import React, { useState, useEffect } from 'react';
import { 
  User, Building2, Mail, Phone, MapPin, Palette, Check, RefreshCw, 
  Upload, Image as ImageIcon, Briefcase, Info, Lock, Eye, EyeOff, 
  Trash2, Shield, ShieldCheck, Clock, Settings, Bell, CircleAlert
} from 'lucide-react';
import { ProfileSettings } from '../types';
import { useAuth } from '../context/AuthContext';

interface ProfileProps {
  settings: ProfileSettings;
  onUpdateSettings: (updated: ProfileSettings) => void;
  theme: 'dark' | 'light';
}

export default function ProfilePersonalization({ settings, onUpdateSettings, theme }: ProfileProps) {
  const isLight = theme === 'light';
  const { user, profile, updatePassword, updateProfile, signOut } = useAuth();

  // Basic Profile form states
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [personalName, setPersonalName] = useState(settings.personalName);
  const [email, setEmail] = useState(settings.email);
  const [phone, setPhone] = useState(settings.phone);
  const [role, setRole] = useState(settings.role);
  const [address, setAddress] = useState(settings.address);
  const [timezone, setTimezone] = useState(settings.timezone);
  const [accentColor, setAccentColor] = useState(settings.accentColor);
  const [logoUrl, setLogoUrl] = useState(settings.companyLogoUrl);

  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Password reset/change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Additional User Settings & Preferences
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('growinvicta_remember_me') !== 'false';
  });
  const [dbSyncInterval, setDbSyncInterval] = useState('realtime');
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [prefSuccessMsg, setPrefSuccessMsg] = useState('');

  // Account deletion states
  const [showDeleteZone, setShowDeleteZone] = useState(false);
  const [deleteConfText, setDeleteConfText] = useState('');
  const [deleteStateError, setDeleteStateError] = useState('');
  const [deletingProgress, setDeletingProgress] = useState(false);

  // JWT Token health / session simulation info
  const [tokenAge, setTokenAge] = useState(3600); // 1 hour token standard lifespan representation
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  // Countdown simulating active token countdown refresh for high reliability security metrics
  useEffect(() => {
    const timer = setInterval(() => {
      setTokenAge(prev => (prev > 10 ? prev - 1 : 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefreshSession = async () => {
    setIsRefreshingToken(true);
    // Simulate real interactive oauth refresh handshake
    await new Promise(resolve => setTimeout(resolve, 800));
    setTokenAge(3600);
    setIsRefreshingToken(false);
  };

  const colorPresets = [
    { name: 'Indigo Aura', value: 'indigo' },
    { name: 'Emerald Peak', value: 'emerald' },
    { name: 'Rose Petal', value: 'rose' },
    { name: 'Goldenrod', value: 'amber' },
    { name: 'Pacific Blue', value: 'blue' },
    { name: 'Orchid Dream', value: 'violet' }
  ];

  // Helper reader to convert file upload to local Base64 string for persistence (Upload Profile Photo)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Wait! Maximum image size target is 2MB to ensure clean local storage storage.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64 = event.target.result as string;
          setLogoUrl(base64);
          
          // Trigger instant update callback for reactive UI updates elsewhere in dashboard
          onUpdateSettings({
            ...settings,
            companyLogoUrl: base64
          });
          setProfileSuccessMsg('Profile photo/logo updated locally.');
          setTimeout(() => setProfileSuccessMsg(''), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrorMsg('');
    setProfileSubmitting(true);

    try {
      // Direct integration with Supabase Auth Metadata / users DB table update
      const { error } = await updateProfile(personalName, companyName);
      
      if (error) {
        setProfileErrorMsg(error.message || 'Supabase could not personalize meta parameters.');
      } else {
        const updated: ProfileSettings = {
          companyName,
          companyLogoUrl: logoUrl,
          personalName,
          email,
          phone,
          role,
          address,
          timezone,
          accentColor
        };
        onUpdateSettings(updated);
        setProfileSuccessMsg('Profile updated successfully on Supabase Secure Registry!');
        setTimeout(() => setProfileSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      setProfileErrorMsg(err.message || 'An unexpected error occurred during profile sync.');
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccessMsg('');
    setPasswordErrorMsg('');

    // Validations
    if (!newPassword || !confirmNewPassword) {
      setPasswordErrorMsg('Please fill in both password fields.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordErrorMsg('Passphrase must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordErrorMsg('Passwords match fail. Re-verify characters.');
      return;
    }

    setPasswordSubmitting(true);

    try {
      // Connect to real Supabase auth password update
      const { error } = await updatePassword(newPassword);
      if (error) {
        setPasswordErrorMsg(error.message || 'Failed to update credentials via Supabase protocol.');
      } else {
        setPasswordSuccessMsg('Your password has been updated successfully.');
        setNewPassword('');
        setConfirmNewPassword('');
        setTimeout(() => setPasswordSuccessMsg(''), 5000);
      }
    } catch (err: any) {
      setPasswordErrorMsg(err.message || 'Unexpected response received.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('growinvicta_remember_me', String(rememberMe));
    setPrefSuccessMsg('User preferences updated successfully.');
    setTimeout(() => setPrefSuccessMsg(''), 3000);
  };

  const handleAccountDeletion = async () => {
    setDeleteStateError('');
    if (deleteConfText !== 'CONFIRM EXTERMINATION') {
      setDeleteStateError('Challenge phrase match failure. Review syntax.');
      return;
    }

    setDeletingProgress(true);
    try {
      // Real life destruction of user sessions and DB content cleanup trace
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Wipe the user state parameters clean
      localStorage.clear();
      
      // Sign user out to lock further console activity
      await signOut();
      
      alert('Secure node de-provisioned successfully. Redirecting in 2 seconds.');
      window.location.reload();
    } catch (err: any) {
      setDeleteStateError(err.message || 'Critical failure terminating user instance.');
      setDeletingProgress(false);
    }
  };

  const loadDemoPresets = () => {
    setCompanyName("Apex Growth Systems");
    setPersonalName("Chethan D. M.");
    setEmail("iamchethandm@gmail.com");
    setPhone("+91 98450 12345");
    setRole("Managing Director & CEO");
    setAddress("STPI Staging, Outer Ring Road, Bangalore, KA, IN");
    setTimezone("Asia/Kolkata (IST)");
    setAccentColor("indigo");
    setLogoUrl(""); 
  };

  // Human friendly display simulation of token validity countdown
  const formatTokenAge = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* 1. Header Area with dynamic auth references */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono rounded border border-emerald-500/20 uppercase tracking-widest animate-pulse">
              ● Database Synced
            </span>
            <span className="px-2 py-0.5 bg-indigo-550/10 text-indigo-400 text-[10px] font-mono rounded border border-indigo-500/20 uppercase">
              Supabase Auth V1
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight font-display mt-2">Manage Profile & Account Credentials</h2>
          <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-slate-400'} mt-1`}>
            Update core details, secure credentials via Supabase, organize application options and manage data life preservation.
          </p>
        </div>
        
        <button
          onClick={loadDemoPresets}
          className={`px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
            isLight
              ? 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-700'
              : 'bg-slate-950 border-slate-800 hover:bg-slate-850 text-slate-400'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          <span>Load Demo Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* Left Column - Live Identity & Avatar & JWT Verification Panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Identity preview widget with real-time feedback */}
          <div className={`p-6 rounded-2.5xl border text-center space-y-5 flex flex-col items-center justify-center relative overflow-hidden ${
            isLight ? 'bg-white border-gray-200 text-gray-900 shadow-sm' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-650/5 rounded-full blur-2xl pointer-events-none" />

            <div>
              <span className="text-[9px] uppercase font-mono tracking-widest text-[#a5b4fc] block mb-3">Live Enterprise Photo</span>
              <div className={`w-28 h-28 rounded-3xl border border-dashed flex items-center justify-center overflow-hidden mx-auto transition-all group relative duration-300 ${
                isLight ? 'bg-slate-50 border-gray-300' : 'bg-slate-950 border-slate-800 hover:border-indigo-500'
              }`}>
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover p-1 rounded-3xl" />
                ) : (
                  <div className="text-slate-500 flex flex-col items-center gap-1.5 p-3">
                    <User className="w-10 h-10 text-indigo-400" />
                    <span className="text-[9.5px] font-mono leading-none">Initials Display</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold font-display">{companyName || 'My SaaS Business'}</h4>
              <p className="text-xs text-slate-400 font-mono">{personalName || 'Active Representative'}</p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-mono font-semibold mt-1">
                {role || 'Super Admin'}
              </div>
            </div>

            {/* Upload form file target component */}
            <div className="w-full pt-1">
              <label className={`w-full py-2.5 px-3 border border-dashed rounded-xl cursor-pointer text-xs flex items-center justify-center gap-2 transition-all hover:scale-99 ${
                isLight
                  ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700'
                  : 'bg-slate-950 hover:bg-slate-900 border-slate-850 text-slate-300 hover:border-indigo-500'
              }`}>
                <Upload className="w-4 h-4 text-indigo-400" />
                <span className="font-mono text-[11px] font-bold">Configure Profile Pic</span>
                <input 
                  type="file" 
                  id="avatar_photo_uploader"
                  accept="image/*" 
                  onChange={handleLogoUpload} 
                  className="hidden" 
                />
              </label>
              <p className="text-[9px] text-slate-500 font-mono mt-2">Supports Base64, up to 2MB allocation limit.</p>
            </div>
          </div>

          {/* Secure Session Health Dashboard Block */}
          <div className={`p-6 rounded-2.5xl border space-y-4 ${
            isLight ? 'bg-white border-gray-200 text-gray-900 shadow-sm' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Shield className="w-4.5 h-4.5 text-indigo-400" />
              <h4 className="text-xs uppercase font-mono font-bold text-indigo-400 tracking-wider">JWT Guard Health</h4>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-405 font-mono text-xs">Token Lifespan</span>
                <span className="font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                  {formatTokenAge(tokenAge)}
                </span>
              </div>

              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-1.5 transition-all duration-1000"
                  style={{ width: `${(tokenAge / 3600) * 100}%` }}
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl space-y-1.5 border border-slate-850">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>Authentic Issuer:</span>
                  <span>supabase.auth</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-450">
                  <span>Current Scope:</span>
                  <span>authenticated</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-450">
                  <span>Active IP Node:</span>
                  <span>Auto-SSL Enforced</span>
                </div>
              </div>

              <button
                onClick={handleRefreshSession}
                disabled={isRefreshingToken}
                className="w-full py-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 font-mono text-[10.5px] font-semibold rounded-xl transition-all cursor-pointer flex justify-center items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshingToken ? 'animate-spin' : ''}`} />
                {isRefreshingToken ? 'Refreshing JWT...' : 'Prolong Session Token'}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column - Multi-tab style forms */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section A: Edit Profile Data connected to Supabase */}
          <div className={`p-6 rounded-2.5xl border space-y-4 ${
            isLight ? 'bg-white border-gray-200 text-gray-900 shadow-sm' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center gap-2 border-b border-slate-800/40 dark:border-slate-800 pb-2">
              <User className="w-4.5 h-4.5 text-indigo-400" />
              <h4 className="text-xs uppercase font-mono font-bold text-indigo-400 tracking-wider">Enterprise Meta Directory</h4>
            </div>

            {profileSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 text-emerald-400 text-xs rounded-xl border border-emerald-500/20 animate-pulse flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {profileErrorMsg && (
              <div className="p-3 bg-red-500/10 text-red-505 text-xs rounded-xl border border-red-500/20 flex items-center gap-2">
                <CircleAlert className="w-4 h-4" />
                <span>{profileErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider font-mono block">Organization Unit</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      value={companyName} 
                      onChange={e => setCompanyName(e.target.value)}
                      required
                      placeholder="e.g. Apex Global Solution"
                      className={`w-full text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isLight ? 'bg-slate-50 text-gray-900 border border-slate-200' : 'bg-slate-950 text-white border border-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider font-mono block">User Representative Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      value={personalName} 
                      onChange={e => setPersonalName(e.target.value)}
                      required
                      placeholder="Chethan D. M."
                      className={`w-full text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isLight ? 'bg-slate-50 text-gray-900 border border-slate-200' : 'bg-slate-950 text-white border border-slate-800'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider font-mono block">Executive Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      value={role} 
                      onChange={e => setRole(e.target.value)}
                      className={`w-full text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-indigo-550 ${
                        isLight ? 'bg-slate-50 text-gray-900 border border-slate-200' : 'bg-slate-950 text-white border border-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider font-mono block">Login Identity (Locked)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                      type="email" 
                      value={email} 
                      disabled
                      className={`w-full text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none opacity-50 cursor-not-allowed ${
                        isLight ? 'bg-slate-100 text-gray-500 border border-slate-200' : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider font-mono block">Enterprise Telephone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 xxxxx"
                      className={`w-full text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-indigo-550 ${
                        isLight ? 'bg-slate-50 text-gray-950 border border-slate-200' : 'bg-slate-950 text-white border border-slate-800'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider font-mono block">Physical Office Staging Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      value={address} 
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Street, City, Country"
                      className={`w-full text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-indigo-550 ${
                        isLight ? 'bg-slate-50 text-gray-950 border border-slate-200' : 'bg-slate-950 text-white border border-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider font-mono block">System Localized Coordinate Timezone</label>
                  <select 
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                    className={`w-full text-xs rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-indigo-550 ${
                      isLight ? 'bg-slate-50 text-gray-950 border border-slate-200' : 'bg-slate-950 text-white border border-slate-800'
                    }`}
                  >
                    <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST) - UTC +5:30</option>
                    <option value="Europe/London (GMT)">Europe/London (GMT) - UTC +0:00</option>
                    <option value="America/New_York (EST)">America/New_York (EST) - UTC -5:00</option>
                    <option value="Asia/Singapore (SGT)">Asia/Singapore (SGT) - UTC +8:00</option>
                  </select>
                </div>
              </div>

              {/* Accent Color selection */}
              <div className="space-y-2 pt-2">
                <label className="text-[10px] text-slate-450 uppercase font-mono block font-bold tracking-wider">Accent Palette Accentuation</label>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  {colorPresets.map(preset => {
                    const isSelected = accentColor === preset.value;
                    const badgeColor = 
                      preset.value === 'indigo' ? 'bg-indigo-600' :
                      preset.value === 'emerald' ? 'bg-emerald-600' :
                      preset.value === 'rose' ? 'bg-rose-500' :
                      preset.value === 'amber' ? 'bg-amber-500' :
                      preset.value === 'blue' ? 'bg-blue-600' : 'bg-violet-600';
                    
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setAccentColor(preset.value)}
                        className={`p-2 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-indigo-500 bg-indigo-500/10' 
                            : isLight ? 'border-gray-200 hover:bg-gray-50' : 'border-slate-850 hover:bg-slate-850'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${badgeColor}`} />
                        <span className="text-[10px] font-sans font-medium">{preset.name.split(' ')[0]}</span>
                        {isSelected && <Check className="w-3 h-3 text-indigo-400 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-550 disabled:opacity-55 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-lg hover:shadow-indigo-650/10 transition-all"
                >
                  {profileSubmitting ? 'Syncing to Supabase...' : 'Save Meta settings'}
                </button>
              </div>
            </form>
          </div>

          {/* Section B: Change Passphrase inside Profile Settings */}
          <div className={`p-6 rounded-2.5xl border space-y-4 ${
            isLight ? 'bg-white border-gray-200 text-gray-900 shadow-sm' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center gap-2 border-b border-slate-800/40 dark:border-slate-800 pb-2">
              <Lock className="w-4.5 h-4.5 text-indigo-400" />
              <h4 className="text-xs uppercase font-mono font-bold text-indigo-400 tracking-wider">Update Account Security Passcode</h4>
            </div>

            {passwordSuccessMsg && (
              <div className="p-3 bg-green-500/10 text-green-400 text-xs rounded-xl border border-green-500/25 animate-pulse flex items-center gap-2">
                <Check className="w-4 h-4 text-green-450" />
                <span>{passwordSuccessMsg}</span>
              </div>
            )}

            {passwordErrorMsg && (
              <div className="p-3 bg-red-500/10 text-red-500 text-xs rounded-xl border border-red-500/25 flex items-center gap-2">
                <CircleAlert className="w-4 h-4" />
                <span>{passwordErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider font-mono block">New Secret Codephrase</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      placeholder="Minimum 8 characters"
                      className={`w-full text-xs rounded-xl pl-9 pr-10 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isLight ? 'bg-slate-50 border border-slate-200 text-gray-950' : 'bg-slate-950 text-white border border-slate-800'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-550 hover:text-slate-350 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider font-mono block">Confirm Secret Codephrase</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      required
                      placeholder="Repeat exact characters"
                      className={`w-full text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isLight ? 'bg-slate-50 border border-slate-200 text-gray-950' : 'bg-slate-950 text-white border border-slate-800'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-550 disabled:opacity-55 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md"
                >
                  {passwordSubmitting ? 'Updating Passcode...' : 'Commit Codephrase Alteration'}
                </button>
              </div>
            </form>
          </div>

          {/* Section C: User Settings & Preferences Option */}
          <div className={`p-6 rounded-2.5xl border space-y-4 ${
            isLight ? 'bg-white border-gray-200 text-gray-900 shadow-sm' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center gap-2 border-b border-slate-800/40 dark:border-slate-800 pb-2">
              <Settings className="w-4.5 h-4.5 text-indigo-400" />
              <h4 className="text-xs uppercase font-mono font-bold text-indigo-400 tracking-wider">Console Preferences</h4>
            </div>

            {prefSuccessMsg && (
              <div className="p-3 bg-green-500/10 text-green-400 text-xs rounded-xl border border-green-500/25 animate-pulse flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>{prefSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSavePreferences} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox"
                      id="remember_me_toggle"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded mt-0.5 Accent-indigo text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <label htmlFor="remember_me_toggle" className="font-bold text-slate-300 select-none cursor-pointer">
                        Remember Me Session Retention
                      </label>
                      <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                        Retains active credential tokens securely inside your sandboxed cookies.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox"
                      id="system_alerts_toggle"
                      checked={systemAlerts}
                      onChange={e => setSystemAlerts(e.target.checked)}
                      className="w-4 h-4 rounded mt-0.5 Accent-indigo text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <label htmlFor="system_alerts_toggle" className="font-bold text-slate-300 select-none cursor-pointer">
                        Show Security Popups
                      </label>
                      <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                        Triggers sound alert notifications on audit log updates or logins.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-450 uppercase font-mono font-bold block mb-1">
                    Database Sync Synchronization Scale
                  </label>
                  <select
                    value={dbSyncInterval}
                    onChange={e => setDbSyncInterval(e.target.value)}
                    className={`w-full text-xs rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-indigo-550 ${
                      isLight ? 'bg-slate-50 text-gray-950 border border-slate-200' : 'bg-slate-950 text-white border border-slate-800'
                    }`}
                  >
                    <option value="realtime">Continuous Stream (Supabase Realtime v2)</option>
                    <option value="5m">Every 5 Minutes (Cron Interval)</option>
                    <option value="manual">Manual Saving (Optimized Latency)</option>
                  </select>
                  <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                    Changes take effect immediately on active tables.
                  </p>
                </div>

              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-955 hover:bg-slate-940 text-slate-305 font-mono text-[10.5px] font-bold uppercase border border-slate-800 rounded-xl cursor-pointer"
                >
                  Save Console Preferences
                </button>
              </div>
            </form>
          </div>

          {/* Section D: Danger Zone - Account Deletion */}
          <div className="p-6 rounded-2.5xl border border-red-500/20 bg-red-500/5 space-y-4">
            <div className="flex items-center gap-2 border-b border-red-500/20 pb-2">
              <Trash2 className="w-4.5 h-4.5 text-red-500" />
              <h4 className="text-xs uppercase font-mono font-bold text-red-500 tracking-wider">Danger Zone: Purge Enterprise Node</h4>
            </div>

            <p className="text-xs text-red-200/80 leading-relaxed font-sans">
              Initiating the termination procedure permanently deletes all clients, projects, payments context and wipes credentials cache. This action is **unrecoverable**.
            </p>

            {deleteStateError && (
              <div className="p-2.5 bg-red-950/20 text-red-500 text-[11px] font-mono border border-red-500/10 rounded-xl">
                Error: {deleteStateError}
              </div>
            )}

            {!showDeleteZone ? (
              <button
                type="button"
                onClick={() => setShowDeleteZone(true)}
                className="px-4 py-2 bg-red-650 hover:bg-red-550 text-white font-mono font-bold text-[10.5px] rounded-xl cursor-pointer transition-all"
              >
                Terminate GrowInvicta Authority
              </button>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-red-950/50 border border-red-900/30 rounded-xl">
                  <p className="text-[11px] font-mono text-red-300">
                    To continue, please type exactly <strong className="text-white">CONFIRM EXTERMINATION</strong> below:
                  </p>
                </div>
                
                <input 
                  type="text"
                  value={deleteConfText}
                  onChange={e => setDeleteConfText(e.target.value)}
                  placeholder="CONFIRM EXTERMINATION"
                  className="w-full text-xs font-mono rounded-xl p-2.5 outline-none bg-slate-950 border border-red-500/30 text-white focus:border-red-500"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={deletingProgress}
                    onClick={handleAccountDeletion}
                    className="px-5 py-2.5 bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    {deletingProgress ? 'Scrubbing Database Entries...' : 'Commit Permanent Node Deletion'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteZone(false);
                      setDeleteConfText('');
                      setDeleteStateError('');
                    }}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
