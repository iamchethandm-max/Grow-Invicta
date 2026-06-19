import React, { useState } from 'react';
import { User, Building2, Mail, Phone, MapPin, Palette, Check, RefreshCw, Upload, Image as ImageIcon, Briefcase, Info } from 'lucide-react';
import { ProfileSettings } from '../types';

interface ProfileProps {
  settings: ProfileSettings;
  onUpdateSettings: (updated: ProfileSettings) => void;
  theme: 'dark' | 'light';
}

export default function ProfilePersonalization({ settings, onUpdateSettings, theme }: ProfileProps) {
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [personalName, setPersonalName] = useState(settings.personalName);
  const [email, setEmail] = useState(settings.email);
  const [phone, setPhone] = useState(settings.phone);
  const [role, setRole] = useState(settings.role);
  const [address, setAddress] = useState(settings.address);
  const [timezone, setTimezone] = useState(settings.timezone);
  const [accentColor, setAccentColor] = useState(settings.accentColor);
  const [logoUrl, setLogoUrl] = useState(settings.companyLogoUrl);

  const [isSuccess, setIsSuccess] = useState(false);

  const colorPresets = [
    { name: 'Indigo Aura', value: 'indigo' },
    { name: 'Emerald Peak', value: 'emerald' },
    { name: 'Rose Petal', value: 'rose' },
    { name: 'Goldenrod', value: 'amber' },
    { name: 'Pacific Blue', value: 'blue' },
    { name: 'Orchid Dream', value: 'violet' }
  ];

  // Helper reader to convert file upload to local Base64 string for persistence
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
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* 1. Introductory Title bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight font-display">Personalize Dashboard & Profile</h2>
          <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-slate-400'} mt-0.5`}>
            Configure personalized details, upload corporate branding, company logo, and select color layouts.
          </p>
        </div>
        
        <button
          onClick={loadDemoPresets}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 border transition-colors cursor-pointer ${
            theme === 'light'
              ? 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-700'
              : 'bg-slate-950 border-slate-800 hover:bg-slate-850 text-slate-400'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left segment - Interactive file uploads and preview card */}
        <div className={`lg:col-span-4 p-5 rounded-2xl border text-center space-y-5 flex flex-col items-center justify-center ${
          theme === 'light' ? 'bg-white border-gray-200 text-gray-900 shadow-sm' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <div>
            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block mb-2">Live Brand Identity Preview</span>
            <div className={`w-24 h-24 rounded-2xl border border-dashed flex items-center justify-center overflow-hidden mx-auto ${
              theme === 'light' ? 'bg-gray-50 border-gray-300' : 'bg-slate-950 border-slate-800'
            }`}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-slate-500 flex flex-col items-center gap-1 p-2">
                  <ImageIcon className="w-8 h-8 text-indigo-400" />
                  <span className="text-[9px] font-mono leading-none">Preset Active</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold font-display">{companyName || 'GROWINVICTA'}</h4>
            <p className="text-[10px] text-slate-400 font-mono italic">{personalName || 'Administrator'}</p>
            <p className="text-[9.5px] text-indigo-500 font-mono font-medium">{role || 'Super Admin'}</p>
          </div>

          {/* Interactive uploader button */}
          <div className="w-full pt-2">
            <label className={`w-full py-2 px-3 border border-dashed rounded-xl cursor-pointer text-xs flex items-center justify-center gap-2 transition-all ${
              theme === 'light'
                ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700'
                : 'bg-slate-950 hover:bg-slate-850 border-slate-850 text-slate-300'
            }`}>
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Upload Custom logo</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleLogoUpload} 
                className="hidden" 
              />
            </label>
            <p className="text-[9px] text-slate-500 font-mono mt-2">GIF, PNG or JPG supported (Max 2MB)</p>
          </div>
        </div>

        {/* Right segment - Details Forms */}
        <form onSubmit={handleSave} className={`lg:col-span-8 p-6 rounded-2xl border space-y-4 ${
          theme === 'light' ? 'bg-white border-gray-200 text-gray-900 shadow-sm' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Company / Organization name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={companyName} 
                  onChange={e => setCompanyName(e.target.value)}
                  className={`w-full text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-indigo-550 ${
                    theme === 'light' ? 'bg-gray-150 text-gray-900 border border-gray-200' : 'bg-slate-950 text-white border border-slate-800'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Principal Representative Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={personalName} 
                  onChange={e => setPersonalName(e.target.value)}
                  className={`w-full text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-indigo-550 ${
                    theme === 'light' ? 'bg-gray-150 text-gray-900 border border-gray-200' : 'bg-slate-950 text-white border border-slate-800'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Functional Executive Role</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={role} 
                  onChange={e => setRole(e.target.value)}
                  className={`w-full text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-indigo-550 ${
                    theme === 'light' ? 'bg-gray-150 text-gray-900 border border-gray-200' : 'bg-slate-950 text-white border border-slate-800'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Corporate Contact Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className={`w-full text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-indigo-550 ${
                    theme === 'light' ? 'bg-gray-150 text-gray-900 border border-gray-200' : 'bg-slate-950 text-white border border-slate-800'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Corporate Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  className={`w-full text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-indigo-550 ${
                    theme === 'light' ? 'bg-gray-150 text-gray-900 border border-gray-200' : 'bg-slate-950 text-white border border-slate-800'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Office Staging Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={address} 
                  onChange={e => setAddress(e.target.value)}
                  className={`w-full text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-indigo-550 ${
                    theme === 'light' ? 'bg-gray-150 text-gray-900 border border-gray-200' : 'bg-slate-950 text-white border border-slate-800'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">System Timezone Context</label>
              <select 
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className={`w-full text-xs rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-indigo-550 ${
                  theme === 'light' ? 'bg-gray-150 text-gray-900 border border-gray-200' : 'bg-slate-950 text-white border border-slate-800'
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
            <label className="text-[10px] text-slate-400 uppercase font-mono block">App Brand Accent Color Tone</label>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {colorPresets.map(preset => {
                const isSelected = accentColor === preset.value;
                const badgeColor = 
                  preset.value === 'indigo' ? 'bg-indigo-600' :
                  preset.value === 'emerald' ? 'bg-emerald-600' :
                  preset.value === 'rose' ? 'bg-rose-500' :
                  preset.value === 'amber' ? 'bg-amber-550' :
                  preset.value === 'blue' ? 'bg-blue-600' : 'bg-violet-600';
                
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setAccentColor(preset.value)}
                    className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-indigo-550 bg-indigo-500/10' 
                        : theme === 'light' ? 'border-gray-200 hover:bg-gray-50' : 'border-slate-850 hover:bg-slate-850'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${badgeColor}`} />
                    <span className="text-[10.5px] font-sans font-medium">{preset.name.split(' ')[0]}</span>
                    {isSelected && <Check className="w-3 h-3 text-indigo-400 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800 items-center">
            {isSuccess && (
              <span className="text-emerald-400 text-xs font-mono flex items-center gap-1 animate-pulse">
                <Check className="w-4 h-4" />
                <span>Profile synchronization successful!</span>
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-755 text-white font-medium text-xs rounded-xl cursor-pointer"
            >
              Sync Personalization Settings
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}
