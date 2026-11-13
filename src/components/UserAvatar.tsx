import React from 'react';
import { getUserInitials } from '../utils/agriMath';
import { StakeholderRole } from '../types';

interface UserAvatarProps {
  name?: string;
  avatar?: string;
  role?: StakeholderRole | string;
  sizeClass?: string;
  textSizeClass?: string;
  className?: string;
}

const ROLE_BG: Record<string, string> = {
  Farmer: 'bg-[#1F4B2C] text-[#F4FFFC]',
  Supplier: 'bg-amber-700 text-amber-50',
  Cooperative: 'bg-emerald-700 text-emerald-50',
  Buyer: 'bg-blue-700 text-blue-50',
  MASTER_ADMIN: 'bg-red-800 text-red-50',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'Stakeholder',
  avatar,
  role = 'Farmer',
  sizeClass = 'w-10 h-10',
  textSizeClass = 'text-xs',
  className = '',
}) => {
  const hasPhoto = Boolean(avatar && avatar.trim().length > 0);
  const initials = getUserInitials(name);
  const bgStyle = ROLE_BG[role] || 'bg-[#1F4B2C] text-[#F4FFFC]';

  if (hasPhoto) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${sizeClass} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      aria-label={name}
      className={`${sizeClass} ${bgStyle} rounded-full flex items-center justify-center font-black tracking-tight select-none shrink-0 ${textSizeClass} ${className}`}
    >
      {initials}
    </div>
  );
};
