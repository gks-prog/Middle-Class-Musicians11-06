import React, { useEffect, useState } from 'react';

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
  const [scrollY, setScrollY] = useState(0);
  const [notes, setNotes] = useState<{id: number, left: number, size: number, opacity: number, speed: number, symbol: string, baseY: number}[]>([]);

  useEffect(() => {
    setNotes(generateNotes(20));

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: -5,
        overflow: 'hidden'
      }}
      aria-hidden="true"
    >
      {notes.map((note) => {
        const yPos = note.baseY - (scrollY * note.speed);

        return (
          <span
            key={note.id}
            style={{
              position: 'absolute',
              left: `${note.left}%`,
              top: `${note.baseY}%`,
              fontSize: `${note.size}rem`,
              color: '#ffffff',
              opacity: note.opacity,
              transform: `translate3d(0, ${yPos}px, 0)`,
              willChange: 'transform',
              transition: 'transform 0.1s linear', 
            }}
          >
            {note.symbol}
          </span>
        );
      })}
    </div>
  );
}
