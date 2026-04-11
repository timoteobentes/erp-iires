import React from 'react';

interface SocialLoginButtonProps {
  provider: 'Google' | 'Facebook';
  icon: React.ReactNode;
  onClick?: () => void;
}

export function SocialLoginButton({ provider, icon, onClick }: SocialLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[14px] font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-[#635BFF]/10 focus:border-[#635BFF] transition-all"
    >
      {icon}
      {provider}
    </button>
  );
}
