import React from 'react';

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-var(--header-height))] bg-[#f4eed9] reading-theme text-[#26231f] transition-colors">
      {children}
    </div>
  );
}
