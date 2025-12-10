
import React, { useEffect, useState, useRef } from 'react';

interface AIResponseDisplayProps {
  text: string;
  isLoading: boolean;
  className?: string;
}

export const AIResponseDisplay: React.FC<AIResponseDisplayProps> = ({ text, isLoading, className = '' }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) {
      setDisplayedText('');
      return;
    }

    if (!text) return;

    setIsTyping(true);
    let index = 0;
    setDisplayedText('');

    const intervalId = setInterval(() => {
      setDisplayedText((prev) => {
        if (index >= text.length) {
          clearInterval(intervalId);
          setIsTyping(false);
          return text;
        }
        return text.substring(0, index + 1);
      });
      index++;
      
      // Auto scroll to bottom
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 20); // Typing speed

    return () => clearInterval(intervalId);
  }, [text, isLoading]);

  // Simple formatter for bold text (**text**) and lists
  const formatText = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Bold parsing
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={i} className={`min-h-[1.5em] ${line.trim().startsWith('-') || line.trim().startsWith('*') ? 'pl-4 relative' : ''}`}>
          {(line.trim().startsWith('-') || line.trim().startsWith('*')) && (
             <span className="absolute left-0 text-cyber-accent">►</span>
          )}
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="text-cyber-400 font-bold">{part.slice(2, -2)}</strong>;
            }
            return <span key={j}>{part}</span>;
          })}
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className={`font-mono text-sm p-4 rounded-lg bg-black/40 border border-cyber-700/50 ${className}`}>
        <div className="flex items-center gap-2 text-cyber-accent animate-pulse">
           <span className="inline-block w-2 h-4 bg-cyber-accent"></span>
           <span>INITIALIZING NEURAL LINK...</span>
        </div>
        <div className="mt-2 text-xs text-gray-500 font-mono">
           <p className="animate-[fade-in_0.5s_ease-in-out_infinite_alternate]">Processing sensor data stream...</p>
        </div>
      </div>
    );
  }

  if (!text) {
    return null;
  }

  return (
    <div 
      ref={scrollRef}
      className={`font-mono text-sm p-4 rounded-lg bg-black/40 border border-cyber-accent/30 shadow-[0_0_15px_-5px_rgba(6,182,212,0.1)] overflow-y-auto max-h-[200px] scrollbar-hide relative group ${className}`}
    >
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyber-accent/50"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyber-accent/50"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyber-accent/50"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyber-accent/50"></div>

      <div className="text-gray-300 leading-relaxed relative z-10">
        {formatText(displayedText)}
        {isTyping && (
          <span className="inline-block w-2 h-4 bg-cyber-accent animate-pulse ml-1 align-middle"></span>
        )}
      </div>
    </div>
  );
};
