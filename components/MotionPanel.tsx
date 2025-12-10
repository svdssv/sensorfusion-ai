
import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { analyzeMotionData } from '../services/geminiService';
import { AnalysisResult } from '../types';
import { useLanguage } from '../LanguageContext';
import { AIResponseDisplay } from './AIResponseDisplay';

export const MotionPanel: React.FC = () => {
  const [data, setData] = useState<{timestamp: number, x: number, y: number, z: number}[]>([]);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisResult>({ isLoading: false, text: '' });
  
  // Use refs for smoothing algorithms
  const lastValues = useRef({ x: 0, y: 0, z: 0 });
  const bufferRef = useRef<{x: number, y: number, z: number, timestamp: number}[]>([]);
  
  const { t, language } = useLanguage();

  useEffect(() => {
    if (typeof DeviceMotionEvent === 'undefined') {
      setIsSupported(false);
      return;
    }
  }, []);

  const handleMotion = (event: DeviceMotionEvent) => {
    const now = Date.now();
    // Raw values
    const rawX = event.accelerationIncludingGravity?.x || 0;
    const rawY = event.accelerationIncludingGravity?.y || 0;
    const rawZ = event.accelerationIncludingGravity?.z || 0;

    // Low Pass Filter (Smoothing)
    // alpha determines how much of the new value we accept. 0.1 means 10% new, 90% old.
    const alpha = 0.2; 
    
    lastValues.current.x = lastValues.current.x * (1 - alpha) + rawX * alpha;
    lastValues.current.y = lastValues.current.y * (1 - alpha) + rawY * alpha;
    lastValues.current.z = lastValues.current.z * (1 - alpha) + rawZ * alpha;

    const smoothItem = {
      timestamp: now,
      x: Number(lastValues.current.x.toFixed(2)),
      y: Number(lastValues.current.y.toFixed(2)),
      z: Number(lastValues.current.z.toFixed(2))
    };

    // Keep raw buffer for AI (AI might prefer raw spikes) - but we send smoothed for better description consistency
    bufferRef.current.push(smoothItem);
    if (bufferRef.current.length > 50) bufferRef.current.shift();

    // Update state for chart
    if (now % 60 < 20) { // ~16fps update rate for UI
      setData(prev => {
        const newData = [...prev, smoothItem];
        if (newData.length > 40) newData.shift();
        return newData;
      });
    }
  };

  const requestPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('devicemotion', handleMotion);
        } else {
          alert('Permission denied');
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setPermissionGranted(true);
      window.addEventListener('devicemotion', handleMotion);
    }
  };

  const analyze = async () => {
    if (bufferRef.current.length === 0) return;
    setAnalysis({ isLoading: true, text: '' });
    const result = await analyzeMotionData(bufferRef.current.slice(-15), language);
    setAnalysis({ isLoading: false, text: result, timestamp: Date.now() });
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, []);

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-cyber-900/30 rounded-lg border border-cyber-700 border-dashed animate-fade-in">
        <div className="mb-4 text-cyber-600 p-4 bg-cyber-800 rounded-full">
           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <p className="text-gray-400 mb-2 font-medium">{t.motion.notSupported}</p>
        <div className="text-xs text-gray-500 font-mono">{t.motion.mobileHint}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {!permissionGranted ? (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in">
           <div className="w-20 h-20 bg-cyber-800/80 rounded-full flex items-center justify-center mb-6 animate-pulse-slow shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.09a2 2 0 0 0-2 0l-.43.25a2 2 0 0 1-2 0l-.15-.09a2 2 0 0 0-2 0l-.43.25a2 2 0 0 1-2 0l-.15-.09a2 2 0 0 0-2 0l-.43.25a2 2 0 0 1-2 0L2 12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2l-2.09-3.48a2 2 0 0 0-2-1H12.22z"/></svg>
           </div>
           <p className="text-gray-300 mb-8 text-center max-w-xs leading-relaxed">{t.motion.permissionPrompt}</p>
           <button 
            onClick={requestPermission}
            className="bg-gradient-to-r from-cyber-500 to-cyber-400 hover:from-cyber-400 hover:to-cyber-300 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] transition-all transform hover:scale-105 active:scale-95"
           >
             {t.motion.startBtn}
           </button>
        </div>
      ) : (
        <>
          <div className="flex-1 w-full bg-cyber-900/50 rounded-xl border border-cyber-700 p-1 relative overflow-hidden min-h-[200px] shadow-inner">
             <div className="absolute top-3 right-4 flex items-center gap-2 z-10 bg-cyber-900/80 px-2 py-1 rounded border border-cyber-700/50 backdrop-blur">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{t.motion.liveFeed}</span>
             </div>
             
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="timestamp" hide />
                <YAxis domain={[-12, 12]} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 600 }}
                  labelStyle={{ display: 'none' }}
                />
                <Line type="monotone" dataKey="x" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="y" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="z" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-cyber-800/50 rounded-lg p-3 text-center border border-cyber-700/50 backdrop-blur-sm">
              <div className="text-[10px] text-gray-500 mb-1 font-bold">ACCEL X</div>
              <div className="text-base font-mono text-red-400 font-bold">{data[data.length - 1]?.x.toFixed(1) || '0.0'}</div>
            </div>
            <div className="bg-cyber-800/50 rounded-lg p-3 text-center border border-cyber-700/50 backdrop-blur-sm">
              <div className="text-[10px] text-gray-500 mb-1 font-bold">ACCEL Y</div>
              <div className="text-base font-mono text-green-400 font-bold">{data[data.length - 1]?.y.toFixed(1) || '0.0'}</div>
            </div>
            <div className="bg-cyber-800/50 rounded-lg p-3 text-center border border-cyber-700/50 backdrop-blur-sm">
              <div className="text-[10px] text-gray-500 mb-1 font-bold">ACCEL Z</div>
              <div className="text-base font-mono text-blue-400 font-bold">{data[data.length - 1]?.z.toFixed(1) || '0.0'}</div>
            </div>
          </div>

          <div className="bg-cyber-900/80 rounded-xl p-4 border border-cyber-700 flex flex-col gap-3 shadow-inner">
             <div className="flex justify-between items-center">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-cyber-accent rounded-full animate-pulse"></div>
                 <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wide">{t.motion.aiTitle}</h4>
               </div>
               <button 
                onClick={analyze}
                disabled={analysis.isLoading}
                className="bg-cyber-accent/10 hover:bg-cyber-accent/20 border border-cyber-accent/30 text-cyber-accent text-xs px-4 py-1.5 rounded-full transition-all disabled:opacity-50 hover:shadow-[0_0_10px_-2px_rgba(6,182,212,0.3)]"
               >
                 {analysis.isLoading ? t.motion.analyzing : t.motion.analyzeBtn}
               </button>
             </div>
             
             {/* Use New AI Display Component */}
             <div className="min-h-[3rem]">
               {!analysis.text && !analysis.isLoading ? (
                  <p className="text-sm text-gray-500 italic p-2">{t.motion.placeholder}</p>
               ) : (
                  <AIResponseDisplay text={analysis.text} isLoading={analysis.isLoading} />
               )}
             </div>
          </div>
        </>
      )}
    </div>
  );
};
