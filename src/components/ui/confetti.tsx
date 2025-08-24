"use client"

import React, { useState, useEffect } from 'react';

interface ConfettiPieceProps {
  id: number;
  x: number;
  y: number;
  angle: number;
  color: string;
}

const Piece = ({ color, angle, x, y }: Omit<ConfettiPieceProps, 'id'>) => (
  <div
    className="absolute w-2 h-4"
    style={{
      backgroundColor: color,
      transform: `rotate(${angle}deg)`,
      left: `${x}px`,
      top: `${y}px`,
      animation: `fall 5s linear forwards`,
    }}
  />
);

export function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPieceProps[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const newPieces = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * window.innerHeight,
      angle: Math.random() * 360,
      color: ['#66b3ff', '#ffa07a', '#ffcd56', '#4bc0c0', '#9966ff'][Math.floor(Math.random() * 5)],
    }));
    setPieces(newPieces);

    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes fall {
        to {
          transform: translateY(${window.innerHeight + 100}px) rotate(720deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, [isClient]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <Piece key={p.id} {...p} />
      ))}
    </div>
  );
}
