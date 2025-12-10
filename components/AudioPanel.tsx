
import React, { useRef, useEffect, useState } from 'react';
import { useLanguage } from '../LanguageContext';

export const AudioPanel: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number>(0);
  const [isListening, setIsListening] = useState(false);
  
  const { t } = useLanguage();

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 128; // Lower FFT size for chunkier bars
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      
      setIsListening(true);
      draw();
    } catch (err) {
      console.error("Audio init error:", err);
      alert("Could not access microphone.");
    }
  };

  const stopListening = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsListening(false);
  };

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to match container
    if (containerRef.current) {
       canvas.width = containerRef.current.clientWidth;
       canvas.height = containerRef.current.clientHeight;
    }

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const render = () => {
      if (!analyserRef.current) return;
      
      animationRef.current = requestAnimationFrame(render);
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        // Cyberpunk Gradient
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, '#3b82f6'); // blue-500
        gradient.addColorStop(0.5, '#06b6d4'); // cyan-500
        gradient.addColorStop(1, '#a855f7'); // purple-500

        ctx.fillStyle = gradient;
        // Rounded tops for bars
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        x += barWidth;
      }
    };

    render();
  };

  useEffect(() => {
    return () => stopListening();
  }, []);

  return (
    <div className="flex flex-col h-full gap-4">
      <div ref={containerRef} className="flex-1 bg-cyber-900/50 rounded-xl border border-cyber-700 relative overflow-hidden flex items-center justify-center min-h-[300px]">
         {/* Background Grid */}
         <div className="absolute inset-0 opacity-20" 
              style={{ backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
         </div>

         {!isListening ? (
             <div className="z-10 text-center animate-fade-in">
                 <div className="w-16 h-16 mx-auto bg-cyber-800 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                 </div>
                 <button 
                  onClick={startListening}
                  className="bg-cyber-500 hover:bg-cyber-400 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_15px_-3px_rgba(168,85,247,0.5)] transition-all transform hover:scale-105"
                 >
                   {t.audio.startBtn}
                 </button>
             </div>
         ) : (
             <canvas 
               ref={canvasRef} 
               className="w-full h-full absolute inset-0"
             />
         )}
         
         {isListening && (
           <button 
             onClick={stopListening}
             className="absolute top-3 right-3 p-3 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-400 transition-colors z-20"
             title="Stop"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
           </button>
         )}
      </div>
      
      <div className="bg-cyber-900/80 rounded-xl p-4 border border-cyber-700 shadow-inner">
         <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-cyber-accent rounded-full"></div>
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wide">{t.audio.aiTitle}</h4>
         </div>
         <p className="text-xs text-gray-400 leading-relaxed">
           {t.audio.description}
         </p>
      </div>
    </div>
  );
};
