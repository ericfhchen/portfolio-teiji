'use client';

import { useState } from 'react';
import { PortableText } from 'next-sanity';

interface ExpandableDescriptionProps {
  description: any[];
}

const descriptionComponents = {
  marks: {
    link: ({ children, value }: any) => {
      const href = value?.href || '';
      const isExternal = href.startsWith('http') || href.startsWith('mailto');
      return (
        <a
          href={href}
          className="underline hover:text-muted transition-colors"
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      );
    },
  },
  block: {
    normal: ({ children }: any) => <p className="my-1">{children}</p>,
  },
};

export default function ExpandableDescription({ description }: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description || description.length === 0) return null;

  // Estimate text length from portable text blocks
  const plainText = description
    .filter((block: any) => block._type === 'block')
    .map((block: any) => block.children?.map((child: any) => child.text).join('') || '')
    .join(' ');
  const isLongText = plainText.length > 150;

  return (
    <div className="text-var">
      <div
        className={!isExpanded && isLongText ? 'overflow-hidden line-clamp-6 md:line-clamp-2' : ''}
      >
        <PortableText value={description} components={descriptionComponents} />
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
