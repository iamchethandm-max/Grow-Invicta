/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layers, Mail, Lock, User, PlusCircle, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  adminEmail: string;
  logoUrl?: string;
}

interface LoginScreenProps {
  companies: Company[];
  onLogin: (companyId: string, role: string, username: string) => void;
  onRegisterCompany: (companyName: string, adminName: string, email: string) => void;
  theme: 'dark' | 'light';
}

export default function LoginScreen({ companies, onLogin, onRegisterCompany, theme }: LoginScreenProps) {
  const isLight = theme === 'light';
  const [activeMode, setActiveMode] = useState<'signin' | 'register'>('signin');
  
  // Sign-in states
  const [selectedCompanyId, setSelectedCompanyId] = useState(companies[0]?.id || 'grow_invicta');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState<'Super Admin' | 'Manager' | 'Employee'>('Super Admin');
  
  // Registration states
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regAdminName, setRegAdminName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Auto prefill email when company changes to match demo accounts
  const handleCompanyChange = (compId: string) => {
    setSelectedCompanyId(compId);
    const comp = companies.find(c => c.id === compId);
    if (comp) {
      setEmail(comp.adminEmail);
    }
  };

  // Set default initial prefill
  React.useEffect(() => {
    const defaultComp = companies.find(c => c.id === selectedCompanyId);
    if (defaultComp && !email) {
      setEmail(defaultComp.adminEmail);
    }
  }, [companies, selectedCompanyId, email]);

  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const comp = companies.find(c => c.id === selectedCompanyId);
    const defaultUsername = email.split('@')[0].split('.').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
    onLogin(selectedCompanyId, userRole, defaultUsername || 'Chethan D. M.');
  };

  const handleSubmitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regCompanyName.trim() || !regAdminName.trim() || !regEmail.trim()) return;
    
    onRegisterCompany(regCompanyName.trim(), regAdminName.trim(), regEmail.trim());
    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setActiveMode('signin');
      setRegCompanyName('');
      setRegAdminName('');
      setRegEmail('');
    }, 2000);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans transition-colors ${
      isLight ? 'bg-gray-100 text-gray-900' : 'bg-slate-950 text-slate-100'
    }`}>
      
      {/* Background radial highlight */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[500px] h-[500px] rounded-full bg-indigo-505 opacity-10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-lg z-10">
        
        {/* Brand visual header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/30 mb-4 animate-bounce">
            <Layers className="w-8 h-8" />
          </div>
          <h1 className={`text-2xl font-bold tracking-tight font-display ${isLight ? 'text-gray-900' : 'text-white'}`}>
            GrowInvicta Corporate Console
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1.5 uppercase tracking-widest">
            Multi-Tenant Business Management Suite
          </p>
        </div>

        {/* Auth form enclosure */}
        <div className={`p-8 rounded-2xl border ${
          isLight ? 'bg-white border-gray-200 shadow-xl' : 'bg-slate-900 border-slate-850 shadow-2xl shadow-black/80'
        }`}>
          
          {/* Tab buttons */}
          <div className="flex border-b border-slate-800 mb-6 pb-2 justify-center gap-6">
            <button
              onClick={() => setActiveMode('signin')}
              className={`pb-1 text-xs font-mono font-bold uppercase cursor-pointer tracking-wider transition-all border-b-2 ${
                activeMode === 'signin' 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-350'
              }`}
            >
              Sign In to Workspace
            </button>
            <button
              onClick={() => setActiveMode('register')}
              className={`pb-1 text-xs font-mono font-bold uppercase cursor-pointer tracking-wider transition-all border-b-2 ${
                activeMode === 'register' 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-350'
              }`}
            >
              Register New Business Node
            </button>
          </div>

          {activeMode === 'signin' ? (
            <form onSubmit={handleSubmitLogin} className="space-y-5 animate-fadeIn">
              
              {/* Select Business Node segment */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono block">
                  Select Business Node (Company tenant)
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => handleCompanyChange(e.target.value)}
                    className={`w-full text-xs rounded-xl px-4 py-3 focus:outline-none transition-all ${
                      isLight 
                        ? 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-indigo-500' 
                        : 'bg-slate-950 border border-slate-800 text-slate-200 focus:border-indigo-500'
                    }`}
                  >
                    {companies.map(comp => (
                      <option key={comp.id} value={comp.id}>
                        {comp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Login creds */}
              <div className="space-y-4">
                
                {/* Username/Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono block">
                    Enterprise Staff Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="email@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-all ${
                        isLight 
                          ? 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-indigo-500' 
                          : 'bg-slate-950 border border-slate-800 text-slate-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Password input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono block">
                    Security Passkey
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-all ${
                        isLight 
                          ? 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-indigo-500' 
                          : 'bg-slate-950 border border-slate-800 text-slate-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                </div>

                {/* RBAC levels selectors */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono block">
                    RBAC Authority Authorization Level
                  </label>
                  <div className={`grid grid-cols-3 gap-1 p-0.5 rounded-xl border ${
                    isLight ? 'bg-gray-100 border-gray-200' : 'bg-slate-950 border-slate-850'
                  }`}>
                    {(['Super Admin', 'Manager', 'Employee'] as const).map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setUserRole(role)}
                        className={`py-2 rounded-lg text-[9.5px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                          userRole === role 
                            ? isLight
                              ? 'bg-white text-indigo-600 shadow-sm font-extrabold'
                              : 'bg-slate-900 border border-indigo-500/20 text-indigo-400 font-extrabold'
                            : 'text-slate-500 hover:text-slate-450'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-750 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 transition-all font-mono mt-6"
              >
                <span>LOG IN TO GROW INVICTA AGENCY CORE</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-[10px] font-mono text-slate-500 border-t border-slate-850">
                💡 Pre-filled demo credentials correspond to standard admin nodes. Just click Log In for automatic secure sync.
              </div>

            </form>
          ) : (
            <form onSubmit={handleSubmitRegister} className="space-y-5 animate-fadeIn">
              
              {regSuccess ? (
                <div className="text-center py-8 space-y-3">
                  <div className="inline-flex p-3 bg-emerald-500/10 rounded-full text-emerald-400 border border-emerald-500/20 mb-2">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-display">Workspace Node Provisioned!</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Company ID registered cleanly. Bootstrapping empty workspace schemas...
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    
                    {/* New Company Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono block">
                        New Company / Business Legal Name
                      </label>
                      <div className="relative">
                        <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          required
                          placeholder="E.g. Acme Tech Labs Ltd"
                          value={regCompanyName}
                          onChange={(e) => setRegCompanyName(e.target.value)}
                          className={`w-full text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-all ${
                            isLight 
                              ? 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-indigo-500' 
                              : 'bg-slate-950 border border-slate-800 text-slate-200 focus:border-indigo-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Admin Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono block">
                        Admin Representative Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          required
                          placeholder="E.g. Chethan D. M."
                          value={regAdminName}
                          onChange={(e) => setRegAdminName(e.target.value)}
                          className={`w-full text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-all ${
                            isLight 
                              ? 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-indigo-500' 
                              : 'bg-slate-950 border border-slate-800 text-slate-200 focus:border-indigo-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Admin Email */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono block">
                        Enterprise Owner Root Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          required
                          placeholder="owner@yourcompany.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className={`w-full text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-all ${
                            isLight 
                              ? 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-indigo-500' 
                              : 'bg-slate-950 border border-slate-800 text-slate-200 focus:border-indigo-500'
                          }`}
                        />
                      </div>
                    </div>

                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-750 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10 transition-all font-mono mt-6"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>CREATE CORPORATE DATA SLICE</span>
                  </button>

                  <div className="pt-2 text-center text-[10px] font-mono text-slate-500 border-t border-slate-850">
                    🔒 Registering a custom company sets up a real-time sandbox that operates completely separately from pre-loaded demo data.
                  </div>
                </>
              )}

            </form>
          )}

        </div>

        {/* Footer brand details */}
        <div className="text-center mt-6 text-[10px] font-mono text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>AES-256 Client-Side Real-Time Database Sandboxed Node</span>
        </div>

      </div>
    </div>
  );
}
