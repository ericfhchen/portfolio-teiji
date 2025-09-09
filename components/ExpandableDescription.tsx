'use client';

import { useState } from 'react';

interface ExpandableDescriptionProps {
  description: string;
}

export default function ExpandableDescription({ description }: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!description) return null;
  
  // Check if text is likely to be longer than 2 lines
  const isLongText = description.length > 150; // Rough estimate for 2 lines
  
  return (
    <div className="text-var">
      <div 
        className={!isExpanded && isLongText ? 'overflow-hidden' : ''}
        style={!isExpanded && isLongText ? {
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as const,
        } : undefined}
      >
        {description}
      </div>
      {isLongText && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted hover:text-var transition-colors text-sm mt-1"
        >
          {isExpanded ? 'See Less' : 'See More'}
        </button>
      )}
    </div>
  );
}