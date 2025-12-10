
import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext';

export const GamePanel: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  
  // Game Refs to avoid re-renders during loop
  const playerRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, radius: 10 });
  const targetRef = useRef({ x: 0, y: 0, radius: 15 });
  const obstaclesRef = useRef<{x: number, y: number, w: number, h: number}[]>([]);
  const animationRef = useRef<number>(0);
  const motionRef = useRef({ ax: 0, ay: 0 });

  const { t } = useLanguage();

  // Initialize Game Logic
  const initGame = (width: number, height: number) => {
    playerRef.current = { x: width / 2, y: height / 2, vx: 0, vy: 0, radius: 8 };
    spawnTarget(width, height);
    spawnObstacles(width, height);
  };

  const spawnTarget = (w: number, h: number) => {
    targetRef.current = {
      x: Math.random() * (w - 60) + 30,
      y: Math.random() * (h - 60) + 30,
      radius: 12
    };
  };

  const spawnObstacles = (w: number, h: number) => {
    const obs = [];
    for (let i = 0; i < 5; i++) {
      obs.push({
        x: Math.random() * (w - 50),
        y: Math.random() * (h - 50),
        w: Math.random() * 40 + 20,
        h: Math.random() * 40 + 20
      });
    }
    obstaclesRef.current = obs;
  };

  const handleMotion = (event: DeviceMotionEvent) => {
    // Landscape/Portrait handling is tricky, simplified here assuming portrait lock or simple X/Y mapping
    let ax = event.accelerationIncludingGravity?.x || 0;
    let ay = event.accelerationIncludingGravity?.y || 0;
    
    // Invert based on common screen orientation logic
    motionRef.current.ax = -ax; 
    motionRef.current.ay = ay; 
  };

  const requestPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          startGame();
        }
      } catch (e) { console.error(e); }
    } else {
      setPermissionGranted(true);
      startGame();
    }
  };

  const startGame = () => {
    setScore(0);
    setGameState('PLAYING');
    if (canvasRef.current) {
        initGame(canvasRef.current.width, canvasRef.current.height);
    }
    window.addEventListener('devicemotion', handleMotion);
    loop();
  };

  const loop = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    // Physics
    const p = playerRef.current;
    
    // Apply Acceleration
    p.vx += motionRef.current.ax * 0.5;
    p.vy += motionRef.current.ay * 0.5;
    
    // Friction
    p.vx *= 0.95;
    p.vy *= 0.95;

    // Move
    p.x += p.vx;
    p.y += p.vy;

    // Boundaries
    if (p.x < p.radius) { p.x = p.radius; p.vx *= -0.5; }
    if (p.x > width - p.radius) { p.x = width - p.radius; p.vx *= -0.5; }
    if (p.y < p.radius) { p.y = p.radius; p.vy *= -0.5; }
    if (p.y > height - p.radius) { p.y = height - p.radius; p.vy *= -0.5; }

    // Check Obstacles Collision (Game Over)
    for (const obs of obstaclesRef.current) {
        if (p.x + p.radius > obs.x && p.x - p.radius < obs.x + obs.w &&
            p.y + p.radius > obs.y && p.y - p.radius < obs.y + obs.h) {
            setGameState('GAMEOVER');
            window.removeEventListener('devicemotion', handleMotion);
            return;
        }
    }

    // Check Target Collision (Score)
    const t = targetRef.current;
    const dist = Math.sqrt(Math.pow(p.x - t.x, 2) + Math.pow(p.y - t.y, 2));
    if (dist < p.radius + t.radius) {
        setScore(s => s + 1);
        spawnTarget(width, height);
        // Slightly increase difficulty?
    }

    // Render
    ctx.clearRect(0, 0, width, height);

    // Grid Background
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = 0; x < width; x += 30) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
    for (let y = 0; y < height; y += 30) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
    ctx.stroke();

    // Calculate proximity for glow effect
    // Max proximity factor when distance is 0, fading out at 250px
    const proximity = Math.max(0, 1 - dist / 250); 
    
    // Target
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e'; // Green
    
    // Pulse calculation: base 15 + oscillating 5 + proximity boost 20
    const pulseIntensity = 15 + (5 * Math.sin(Date.now() / 200)) + (proximity * 20);
    
    ctx.shadowBlur = pulseIntensity;
    ctx.shadowColor = '#22c55e';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Obstacles
    ctx.fillStyle = '#ef4444'; // Red
    for (const obs of obstaclesRef.current) {
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ef4444';
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
    }
    ctx.shadowBlur = 0;

    // Player
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#06b6d4'; // Cyan
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#06b6d4';
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Trail effect (optional visual polish)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
    ctx.stroke();

    animationRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    // Resize observer to handle responsive canvas
    const resize = () => {
        if (canvasRef.current && canvasRef.current.parentElement) {
            canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
            canvasRef.current.height = canvasRef.current.parentElement.clientHeight;
        }
    };
    window.addEventListener('resize', resize);
    resize();
    
    return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('devicemotion', handleMotion);
        cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col h-full gap-4 relative">
       <div className="flex-1 bg-cyber-900/50 rounded-xl border border-cyber-700 relative overflow-hidden shadow-inner">
         <canvas ref={canvasRef} className="block w-full h-full" />
         
         {/* UI Overlays */}
         <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
             <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">{t.game.score}</div>
             <div className="text-3xl font-mono text-white font-bold text-shadow-glow">{score}</div>
         </div>

         {gameState === 'START' && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10 animate-fade-in text-center p-6">
                 <h2 className="text-3xl font-bold text-white mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyber-400 to-cyber-accent">CYBER CORE</h2>
                 <p className="text-gray-300 mb-8 max-w-xs leading-relaxed">{t.game.instructions}</p>
                 <button 
                   onClick={requestPermission}
                   className="bg-cyber-accent hover:bg-cyber-400 text-cyber-900 font-bold py-3 px-10 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all transform hover:scale-105 active:scale-95"
                 >
                   {t.game.startBtn}
                 </button>
             </div>
         )}

        {gameState === 'GAMEOVER' && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/40 backdrop-blur-sm z-10 animate-fade-in text-center">
                 <h2 className="text-4xl font-bold text-red-500 mb-4 tracking-widest">CRITICAL FAILURE</h2>
                 <div className="text-xl text-white mb-8 font-mono">SCORE: {score}</div>
                 <button 
                   onClick={() => startGame()}
                   className="bg-white hover:bg-gray-200 text-red-600 font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105"
                 >
                   {t.game.retryBtn}
                 </button>
             </div>
         )}
       </div>

       <div className="bg-cyber-900/80 rounded-xl p-4 border border-cyber-700 shadow-inner">
         <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wide">{t.game.sensorInfo}</h4>
         </div>
         <p className="text-xs text-gray-400 leading-relaxed font-mono">
            AX: {motionRef.current.ax.toFixed(2)} | AY: {motionRef.current.ay.toFixed(2)}
            <br/>
            <span className="text-cyber-600">{t.game.description}</span>
         </p>
       </div>
    </div>
  );
};
