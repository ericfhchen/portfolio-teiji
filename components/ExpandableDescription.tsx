'use client';

import { useState } from 'react';

interface ExpandableDescriptionProps {
  description: string;
}

export default function ExpandableDescription({ description }: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!description) return null;
  
  // Check if text is likely to be longer than 2 lines
  // On mobile, allow more text before truncating (roughly 3-4 lines)
  const isLongText = description.length > 150; // Rough estimate for 2 lines on desktop
  
  return (
    <div className="text-var">
      <div 
        className={!isExpanded && isLongText ? 'overflow-hidden line-clamp-6 md:line-clamp-2' : ''}
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