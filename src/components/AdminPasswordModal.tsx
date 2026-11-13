import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Lock, Eye, EyeOff, X, AlertCircle } from 'lucide-react';

export const AdminPasswordModal: React.FC = () => {
  const {
    isAdminPasswordModalOpen,
    setIsAdminPasswordModalOpen,
    verifyMasterAdminPassword,
  } = useApp();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isAdminPasswordModalOpen) return null;

  const handleClose = () => {
    setPassword('');
    setErrorMsg('');
    setIsAdminPasswordModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Please enter the Master Admin password.');
      return;
    }
    setIsVerifying(true);
    setErrorMsg('');
    const result = await verifyMasterAdminPassword(password);
    setIsVerifying(false);
    if (result.success) {
      setPassword('');
      setErrorMsg('');
      setIsAdminPasswordModalOpen(false);
    } else {
      setErrorMsg(result.message || 'Invalid Master Admin password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-light rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-[#91EAAF] text-left space-y-5">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
          aria-label="Close Master Admin authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1F4B2C] text-[#C3E956] flex items-center justify-center shrink-0 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="inline-block px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-wider">
              Restricted Governance Gate
            </span>
            <h3 className="text-lg font-black text-[#1F4B2C] tracking-tight mt-0.5">
              Master Admin Verification
            </h3>
          </div>
        </div>

        <p className="text-xs text-neutral-600 font-medium leading-relaxed">
          Master Admin access is password-protected and cannot be bypassed via quick role switching.
          Enter your administrator password to unlock the Command Center, NVAT AI Processor, and Cloud SQL Explorer.
        </p>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="master-admin-password-input"
              className="block text-xs font-bold text-[#1F4B2C] mb-1.5"
            >
              Master Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="master-admin-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Master Admin password"
                autoFocus
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-[#4D7111] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-600 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="px-5 py-2.5 rounded-xl btn-forest text-xs font-black shadow-md disabled:opacity-50"
            >
              {isVerifying ? 'Verifying...' : 'Unlock Master Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
