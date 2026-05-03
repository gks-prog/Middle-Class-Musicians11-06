import React, { useEffect, useState } from 'react';

// Generates stable random values to avoid React hydration mismatches
const generateNotes = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100, // random horizontal position 0-100%
    size: Math.random() * 2 + 1, // random rem size between 1 and 3
    opacity: Math.random() * 0.15 + 0.05, // subtle opacity
    speed: Math.random() * 0.5 + 0.2, // scroll speed multiplier
    symbol: ['♪', '♫', '♩', '♬', '♭', '♮'][Math.floor(Math.random() * 6)],
    baseY: Math.random() * 100 // Starting vertical offset
  }));
};

export default function BackgroundNotes() {
  const [scrollY, setScrollY] = useState(0);
  const [notes, setNotes] = useState<{id: number, left: number, size: number, opacity: number, speed: number, symbol: string, baseY: number}[]>([]);

  useEffect(() => {
    // Initialize notes purely on the client to avoid server-side mismatches
    setNotes(generateNotes(15));

    // High performance scroll listener using RequestAnimationFrame
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
        zIndex: -5, // Stays behind all content
        overflow: 'hidden'
      }}
      aria-hidden="true"
    >
      {notes.map((note) => {
        // Calculate the Y transform based on scroll speed
        // The notes move up relative to the scroll down
        const yPos = note.baseY - (scrollY * note.speed);

        return (
          <span
            key={note.id}
            style={{
              position: 'absolute',
              left: `${note.left}%`,
              top: `${note.baseY}%`, // Start position relative to viewport
              fontSize: `${note.size}rem`,
              color: '#ffffff',
              opacity: note.opacity,
              // GPU accelerated transform
              transform: `translate3d(0, ${yPos}px, 0)`,
              willChange: 'transform',
              transition: 'transform 0.1s linear', // smooth micro-stutters
            }}
          >
            {note.symbol}
          </span>
        );
      })}
    </div>
  );
}
