import React, { useEffect, useState, useRef, useMemo } from 'react';

// Bypassing React render cycles for scroll events is crucial for 60fps
const generateNotes = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100, 
    size: Math.random() * 2 + 1, 
    opacity: Math.random() * 0.15 + 0.05, 
    speed: Math.random() * 0.5 + 0.2, 
    symbol: ['♪', '♫', '♩', '♬', '♭', '♮'][Math.floor(Math.random() * 6)],
    baseY: Math.random() * 100 
  }));
};

export default function BackgroundNotes() {
  const notes = useMemo(() => generateNotes(20), []);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) return;
          const scrollY = window.scrollY;
          
          // Direct DOM mutation bypassing React diffing overhead
          const spans = containerRef.current.children;
          for (let i = 0; i < spans.length; i++) {
            const span = spans[i] as HTMLElement;
            const speed = notes[i].speed;
            const yPos = -(scrollY * speed); // Note: Removed baseY calculation here, CSS handles base position via 'top'
            span.style.transform = `translate3d(0, ${yPos}px, 0)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [notes]);

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: -5,
        overflow: 'hidden'
      }}
      aria-hidden="true"
    >
      {notes.map((note) => (
        <span
          key={note.id}
          style={{
            position: 'absolute',
            left: `${note.left}%`,
            top: `${note.baseY}%`, // Anchor point handled in pure CSS
            fontSize: `${note.size}rem`,
            color: '#ffffff',
            opacity: note.opacity,
            willChange: 'transform' // Let browser know this element moves constantly
            // Removed transition: 'transform 0.1s linear' -> Transition interpolates between rAF frames, causing jitter.
          }}
        >
          {note.symbol}
        </span>
      ))}
    </div>
  );
}
