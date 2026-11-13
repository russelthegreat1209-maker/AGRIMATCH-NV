import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StakeholderRole, UserAccount } from '../types';
import { X, Users, Check, ShieldCheck, MapPin, Search } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

export const DemoAccountSwitcherDrawer: React.FC = () => {
  const {
    isDemoSwitcherOpen,
    setIsDemoSwitcherOpen,
    accounts,
    currentUser,
    switchDemoAccount,
  } = useApp();

  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isDemoSwitcherOpen) return null;

  const roles: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All 25 Accounts' },
    { id: 'Farmer', label: '5 Farmers' },
    { id: 'Supplier', label: '5 Suppliers' },
    { id: 'Buyer', label: '5 Buyers' },
    { id: 'Cooperative', label: '5 Cooperatives' },
    { id: 'Government', label: 'Gov & Master Admin' },
  ];

  const filteredAccounts = accounts.filter((acc) => {
    const matchesRole =
      selectedRoleFilter === 'ALL'
        ? true
        : selectedRoleFilter === 'Government'
        ? acc.role === 'Government' || acc.role === 'MASTER_ADMIN'
        : acc.role === selectedRoleFilter;

    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.municipality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.organization && acc.organization.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesRole && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md h-full glass-light shadow-2xl border-l border-[#91EAAF] flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#91EAAF]/60 flex items-center justify-between bg-white/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#1F4B2C] text-[#C3E956]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#1F4B2C] tracking-tight">
                Demo Quick-Login Switcher
              </h3>
              <p className="text-[11px] text-neutral-500 font-medium">
                25 Pre-seeded Nueva Vizcaya stakeholder accounts
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDemoSwitcherOpen(false)}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
            aria-label="Close switcher"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Role Filter Bar */}
        <div className="p-3 border-b border-neutral-200 bg-white/40 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or municipality..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-[#4D7111]"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRoleFilter(r.id)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                  selectedRoleFilter === r.id
                    ? 'bg-[#1F4B2C] text-[#F4FFFC] shadow-xs'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accounts List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredAccounts.map((acc: UserAccount) => {
            const isCurrent = currentUser?.id === acc.id;

            return (
              <div
                key={acc.id}
                onClick={() => {
                  switchDemoAccount(acc.id);
                  setIsDemoSwitcherOpen(false);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer text-left relative flex items-start gap-3 ${
                  isCurrent
                    ? 'bg-[#C3E956]/20 border-[#4D7111] ring-2 ring-[#4D7111]/40 shadow-sm'
                    : 'bg-white/80 border-neutral-200 hover:border-[#91EAAF] hover:bg-white'
                }`}
              >
                <UserAvatar
                  name={acc.name}
                  avatar={acc.avatar}
                  role={acc.role}
                  sizeClass="w-10 h-10"
                  className="border border-[#91EAAF] mt-0.5"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-[#1F4B2C] truncate">
                      {acc.name}
                    </h4>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        acc.role === 'MASTER_ADMIN'
                          ? 'bg-red-600 text-white'
                          : acc.role === 'Farmer'
                          ? 'bg-[#C3E956]/40 text-[#1F4B2C]'
                          : acc.role === 'Supplier'
                          ? 'bg-amber-100 text-amber-900'
                          : acc.role === 'Buyer'
                          ? 'bg-blue-100 text-blue-900'
                          : acc.role === 'Cooperative'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-purple-100 text-purple-900'
                      }`}
                    >
                      {acc.role === 'MASTER_ADMIN' ? 'Master Admin' : acc.role}
                    </span>
                  </div>

                  {acc.organization && (
                    <p className="text-[11px] text-neutral-600 truncate font-medium">
                      {acc.organization}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-neutral-500">
                    <MapPin className="w-3 h-3 text-[#4D7111]" />
                    <span>
                      {acc.municipality}, {acc.barangay}
                    </span>
                  </div>

                  <p className="text-[10px] text-neutral-500 mt-1 line-clamp-1 italic">
                    {acc.bio}
                  </p>
                </div>

                {isCurrent && (
                  <span className="shrink-0 p-1 rounded-full bg-[#1F4B2C] text-[#C3E956]">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Master Admin Direct Action */}
        <div className="p-3 border-t border-[#91EAAF]/60 bg-white/70">
          <button
            onClick={() => {
              switchDemoAccount('master_admin');
              setIsDemoSwitcherOpen(false);
            }}
            className="w-full py-2.5 px-3 rounded-full btn-sprout text-xs font-black flex items-center justify-center gap-2 shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-[#1F4B2C]" />
            <span>Instant Switch: Master Admin Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
