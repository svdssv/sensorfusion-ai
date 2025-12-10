
import React, { useState } from 'react';
import { SensorType } from './types';
import { SensorCard } from './components/SensorCard';
import { MotionPanel } from './components/MotionPanel';
import { VisionPanel } from './components/VisionPanel';
import { AudioPanel } from './components/AudioPanel';
import { GeoPanel } from './components/GeoPanel';
import { GamePanel } from './components/GamePanel';
import { LanguageProvider, useLanguage } from './LanguageContext';

// Icons
const MotionIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>;
const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>;
const MicIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>;
const MapIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>;
const GameIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 11h4"/><path d="M8 9v4"/><path d="M15 12h.01"/><path d="M18 10h.01"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>;
const GlobeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;

const MainLayout: React.FC = () => {
  const [activeSensor, setActiveSensor] = useState<SensorType>(SensorType.MOTION);
  const { t, language, setLanguage } = useLanguage();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSensorChange = (sensor: SensorType) => {
    if (sensor === activeSensor) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSensor(sensor);
      setIsTransitioning(false);
    }, 200); // Wait for fade out
  };

  const renderActiveSensor = () => {
    switch (activeSensor) {
      case SensorType.MOTION: return <MotionPanel />;
      case SensorType.VISION: return <VisionPanel />;
      case SensorType.AUDIO: return <AudioPanel />;
      case SensorType.LOCATION: return <GeoPanel />;
      case SensorType.GAME: return <GamePanel />;
      default: return <MotionPanel />;
    }
  };

  const getSensorTitle = () => {
    switch (activeSensor) {
      case SensorType.MOTION: return t.motion.title;
      case SensorType.VISION: return t.vision.title;
      case SensorType.AUDIO: return t.audio.title;
      case SensorType.LOCATION: return t.location.title;
      case SensorType.GAME: return t.game.title;
      default: return "";
    }
  };

  const getIcon = (type: SensorType) => {
    switch (type) {
        case SensorType.MOTION: return <MotionIcon />;
        case SensorType.VISION: return <CameraIcon />;
        case SensorType.AUDIO: return <MicIcon />;
        case SensorType.LOCATION: return <MapIcon />;
        case SensorType.GAME: return <GameIcon />;
    }
  }

  return (
    <div className="flex flex-col h-screen bg-cyber-900 text-gray-200 font-sans selection:bg-cyber-accent selection:text-white overflow-hidden">
      {/* Header */}
      <header className="flex-none bg-cyber-900/90 backdrop-blur-md border-b border-cyber-700 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-cyber-500 to-cyber-accent rounded-xl flex items-center justify-center shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight leading-none">
                {t.appTitle}
              </h1>
              <p className="text-[10px] text-cyber-400 font-mono tracking-wider hidden sm:block">FUSION.AI.SENSORS</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
              className="flex items-center gap-1 bg-cyber-800 hover:bg-cyber-700 border border-cyber-700 rounded-full px-3 py-2 transition-colors min-w-[3rem] justify-center"
            >
              <GlobeIcon />
              <span className="text-xs font-semibold">{language === 'en' ? 'EN' : '中'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
        
        {/* Navigation Sidebar (Serving as main nav) */}
        <nav className="flex flex-col gap-2 w-full lg:w-64 p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-cyber-700 bg-cyber-900/50">
           <div className="text-xs font-mono text-gray-500 mb-2 lg:mb-4 px-2 uppercase tracking-widest hidden lg:block">Modules</div>
           <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
             {[
                { id: SensorType.MOTION, label: t.nav.motion },
                { id: SensorType.VISION, label: t.nav.vision },
                { id: SensorType.AUDIO, label: t.nav.audio },
                { id: SensorType.LOCATION, label: t.nav.location },
                { id: SensorType.GAME, label: t.nav.game },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSensorChange(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 text-sm font-medium whitespace-nowrap ${
                    activeSensor === item.id
                      ? 'bg-cyber-800 border-cyber-accent text-white shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)] lg:translate-x-1'
                      : 'bg-transparent border-transparent text-gray-400 hover:bg-cyber-800 hover:text-gray-200'
                  }`}
                >
                  <div className={`${activeSensor === item.id ? 'text-cyber-accent' : ''}`}>{getIcon(item.id)}</div>
                  <span>{item.label}</span>
                </button>
              ))}
           </div>
        </nav>

        {/* Content Panel */}
        <section className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-hide relative">
          <div 
            className={`h-full flex flex-col transition-all duration-300 ease-out transform ${
              isTransitioning ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
            }`}
          >
            <SensorCard 
              title={getSensorTitle()} 
              icon={getIcon(activeSensor)}
              isActive={true}
              className="flex-1 min-h-[400px]"
            >
              {renderActiveSensor()}
            </SensorCard>
          </div>
        </section>

      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <MainLayout />
    </LanguageProvider>
  );
}

export default App;
