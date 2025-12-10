
import React, { useRef, useState, useEffect } from 'react';
import { analyzeImage } from '../services/geminiService';
import { AnalysisResult } from '../types';
import { useLanguage } from '../LanguageContext';
import { AIResponseDisplay } from './AIResponseDisplay';

export const VisionPanel: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult>({ isLoading: false, text: '' });
  
  const { t, language } = useLanguage();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err) {
      setError(t.vision.error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    const dataUrl = canvasRef.current.toDataURL('image/png');
    setCapturedImage(dataUrl);
    
    stopCamera();

    setAnalysis({ isLoading: true, text: '' });
    const result = await analyzeImage(dataUrl, language);
    setAnalysis({ isLoading: false, text: result });
  };

  const reset = () => {
    setCapturedImage(null);
    setAnalysis({ isLoading: false, text: '' });
    startCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="relative flex-1 bg-black rounded-xl overflow-hidden border border-cyber-700 flex items-center justify-center min-h-[300px] shadow-lg">
        {!stream && !capturedImage && !error && (
          <div className="text-center z-10 animate-fade-in">
             <div className="w-16 h-16 mx-auto bg-cyber-800 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
             </div>
             <button 
              onClick={startCamera}
              className="bg-cyber-500 hover:bg-cyber-400 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105"
            >
              {t.vision.openCamera}
            </button>
          </div>
        )}
        
        {error && <div className="p-6 text-center text-red-400 max-w-xs">{error}</div>}

        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className={`absolute inset-0 w-full h-full object-cover ${capturedImage ? 'hidden' : 'block'}`}
        />
        
        {capturedImage && (
          <img src={capturedImage} alt="Captured" className="absolute inset-0 w-full h-full object-contain bg-black" />
        )}

        <canvas ref={canvasRef} className="hidden" />
        
        {/* Camera Overlay UI */}
        {stream && !capturedImage && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
             <button 
              onClick={captureAndAnalyze}
              className="h-16 w-16 rounded-full border-4 border-white bg-red-500/90 hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] transform active:scale-95"
              aria-label={t.vision.capture}
             />
          </div>
        )}
      </div>

      <div className="bg-cyber-900/80 rounded-xl p-4 border border-cyber-700 shadow-inner">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-cyber-accent rounded-full"></div>
             <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wide">{t.vision.aiTitle}</h4>
          </div>
          {capturedImage && (
             <button 
              onClick={reset}
              className="text-xs text-cyber-accent hover:text-white transition-colors flex items-center gap-1 font-medium bg-cyber-800 px-2 py-1 rounded"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
               {t.vision.takeAnother}
             </button>
          )}
        </div>
        
        {/* Use New AI Display Component */}
        <div className="min-h-[3rem]">
          {!analysis.text && !analysis.isLoading ? (
             <span className="text-gray-500 italic">{t.vision.placeholder}</span>
          ) : (
             <AIResponseDisplay text={analysis.text} isLoading={analysis.isLoading} />
          )}
        </div>
      </div>
    </div>
  );
};
