
import React, { useState } from 'react';
import { analyzeLocationContext } from '../services/geminiService';
import { AnalysisResult, GeoLocationData } from '../types';
import { useLanguage } from '../LanguageContext';
import { AIResponseDisplay } from './AIResponseDisplay';

export const GeoPanel: React.FC = () => {
  const [geoData, setGeoData] = useState<GeoLocationData | null>(null);
  const [error, setError] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult>({ isLoading: false, text: '' });
  
  const { t, language } = useLanguage();

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError(t.location.error);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setGeoData({
          latitude,
          longitude,
          accuracy,
          timestamp: position.timestamp
        });
        setError('');
        
        // Auto analyze context
        setAnalysis({ isLoading: true, text: '' });
        const context = await analyzeLocationContext(latitude, longitude, language);
        setAnalysis({ isLoading: false, text: context });
      },
      (err) => {
        setError(`Error: ${err.message}`);
      }
    );
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 bg-cyber-900/50 rounded-xl border border-cyber-700 p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
        {/* Radar Background Animation */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
           <div className="w-[150%] h-[150%] border border-cyber-500/30 rounded-full absolute animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
           <div className="w-[100%] h-[100%] border border-cyber-500/30 rounded-full absolute animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite_1s]"></div>
           <div className="w-[50%] h-[50%] border border-cyber-500/30 rounded-full absolute animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite_2s]"></div>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.1),_transparent_70%)]"></div>
        </div>

        {/* Crosshairs */}
        <div className="absolute w-full h-[1px] bg-cyber-700/50 top-1/2 left-0 transform -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute h-full w-[1px] bg-cyber-700/50 left-1/2 top-0 transform -translate-x-1/2 pointer-events-none"></div>
        
        {!geoData ? (
           <div className="z-10 text-center animate-fade-in relative">
             <div className="w-20 h-20 mx-auto bg-cyber-800/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-8 ring-1 ring-cyber-600 shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
             </div>
             <button 
               onClick={getLocation}
               className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_-5px_rgba(34,197,94,0.6)] z-10 transition-all transform hover:scale-105 active:scale-95"
             >
               {t.location.getBtn}
             </button>
           </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 w-full text-center z-10 animate-fade-in max-w-sm">
             <div className="col-span-2 mb-4">
                <div className="inline-block px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-mono mb-2 animate-pulse">
                  GPS SIGNAL ACQUIRED
                </div>
             </div>
             <div className="p-4 bg-cyber-800/80 backdrop-blur-md rounded-xl border border-cyber-600 shadow-lg group hover:border-cyber-accent transition-colors">
               <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 group-hover:text-cyber-accent transition-colors">{t.location.lat}</div>
               <div className="text-xl sm:text-2xl font-mono text-white font-bold tracking-tight">{geoData.latitude?.toFixed(5)}</div>
             </div>
             <div className="p-4 bg-cyber-800/80 backdrop-blur-md rounded-xl border border-cyber-600 shadow-lg group hover:border-cyber-accent transition-colors">
               <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 group-hover:text-cyber-accent transition-colors">{t.location.lon}</div>
               <div className="text-xl sm:text-2xl font-mono text-white font-bold tracking-tight">{geoData.longitude?.toFixed(5)}</div>
             </div>
             <div className="col-span-2 p-3 bg-cyber-800/50 rounded-lg text-xs text-gray-400 font-mono border border-cyber-700/50 flex justify-between items-center px-6">
               <span>{t.location.accuracy}</span>
               <span className="text-green-400 font-bold">±{geoData.accuracy?.toFixed(1)} m</span>
             </div>
          </div>
        )}
        
        {error && <p className="text-red-400 text-sm mt-4 z-10 bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/30 backdrop-blur-md">{error}</p>}
      </div>

      <div className="bg-cyber-900/80 rounded-xl p-4 border border-cyber-700 shadow-inner min-h-[100px] flex flex-col justify-center">
         <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-cyber-accent rounded-full animate-pulse"></div>
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wide">{t.location.aiTitle}</h4>
         </div>
         {/* Use New AI Display Component */}
         <div className="min-h-[3rem]">
           {!analysis.text && !analysis.isLoading ? (
              <span className="text-gray-600 italic">{t.location.placeholder}</span>
           ) : (
              <AIResponseDisplay text={analysis.text} isLoading={analysis.isLoading} />
           )}
         </div>
      </div>
    </div>
  );
};
