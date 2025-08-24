"use client"
import React from 'react';
import { InlineMath } from 'react-katex';

interface MathRendererProps {
  text: string;
}

// This regex finds text enclosed in single dollar signs ($...$)
const mathRegex = /\$(.*?)\$/g;

export function MathRenderer({ text }: MathRendererProps) {
  const parts = text.split(mathRegex);

  return (
    <span className="inline-block text-gray-800">
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          // This part is the math content inside the dollar signs
          try {
            return <InlineMath key={index} math={part} />;
          } catch(e) {
            console.error("Katex parsing error for:", part, e)
            return <span key={index} className='text-red-600 font-mono'>${part}$</span>
          }
        } else {
          // This part is the regular text
          return <span key={index} className="text-gray-800">{part}</span>;
        }
      })}
    </span>
  );
}
