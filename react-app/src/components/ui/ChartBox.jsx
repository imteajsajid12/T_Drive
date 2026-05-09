import React from 'react';

export const ChartBox = ({ label, isDark, children }) => (
  <div className={`p-4 rounded-3xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} shadow-sm flex flex-col h-full`}>
    <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>{label}</h3>
    <div className="flex-1 w-full h-full relative min-h-[200px]">
      {children}
    </div>
  </div>
);
