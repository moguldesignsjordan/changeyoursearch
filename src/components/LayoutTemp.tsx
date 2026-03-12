// Layout.tsx - Main layout wrapper with brown theme
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <main className="min-h-screen bg-[#643d2c] text-stone-200 font-['Inter',_sans-serif] p-4 sm:p-8 relative overflow-hidden flex items-center justify-center">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`
        }} />
      </div>
      
      {/* Content */}
      <div className="relative z-0 w-full">
        {children}
      </div>
    </main>
  );
};

export default Layout;