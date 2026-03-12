import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <main className="min-h-screen bg-[#643d2c] text-stone-200 font-['Inter',_sans-serif] p-4 sm:p-8 relative overflow-hidden flex items-center justify-center">
      {children}
    </main>
  );
};