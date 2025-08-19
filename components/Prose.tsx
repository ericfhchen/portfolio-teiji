import { ReactNode } from 'react';

interface ProseProps {
  children: ReactNode;
  className?: string;
}

export default function Prose({ children, className = '' }: ProseProps) {
  return (
    <div
      className={`prose prose-lg max-w-none prose-headings:text-var prose-p:text-var prose-strong:text-var prose-blockquote:text-muted prose-blockquote:border-l-var ${className}`}
    >
      {children}
    </div>
  );
}