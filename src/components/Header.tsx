import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="flex justify-center items-center px-5 py-4 bg-navy/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple to-pink flex items-center justify-center">
          <span className="text-sm">✨</span>
        </div>
        <span className="text-[15px] font-bold text-white tracking-tight">
          Tarot Reveal
        </span>
      </div>
    </div>
  );
};

export default Header;
