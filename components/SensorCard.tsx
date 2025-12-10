import React from 'react';

interface SensorCardProps {
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const SensorCard: React.FC<SensorCardProps> = ({ title, icon, isActive, children, className = '' }) => {
  return (
    <div className={`bg-cyber-800 border border-cyber-700 rounded-xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col ${isActive ? 'ring-2 ring-cyber-accent shadow-cyan-500/20' : ''} ${className}`}>
      <div className="bg-cyber-900/50 p-4 border-b border-cyber-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isActive ? 'bg-cyber-accent/20 text-cyber-accent' : 'bg-cyber-700 text-gray-400'}`}>
            {icon}
          </div>
          <h3 className="font-semibold text-lg tracking-wide">{title}</h3>
        </div>
        {isActive && (
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col h-full">
        {children}
      </div>
    </div>
  );
};