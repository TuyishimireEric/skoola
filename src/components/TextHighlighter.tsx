import React from 'react';
import { WordPerformance } from '../types';

interface TextHighlighterProps {
  text: string;
  performance: WordPerformance[];
}

export const TextHighlighter: React.FC<TextHighlighterProps> = ({ text, performance }) => {
  const words = text.split(/\s+/);

  return (
    <div className="text-2xl">
      {words.map((word, index) => {
        const wordPerf = performance[index] || { correct: false, similarity: 0 };
        
        return (
          <span
            key={index}
            className={`
              inline-block mr-2 px-1 
              ${wordPerf.correct ? 'bg-green-200' : 'bg-red-200'}
            `}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
