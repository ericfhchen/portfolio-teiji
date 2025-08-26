import Link from 'next/link';

interface HeaderProps {
  currentSection: string;
}

export default function Header({ currentSection }: HeaderProps) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      {/* Section Switcher — centered */}
      <nav
        className="h-16 pointer-events-auto flex items-center absolute left-1/2 -translate-x-1/2"
        style={{ left: '50%' }}
      >
        {/* Art */}
        <Link
          href="/art"
          className={`w-24 text-center text-sm font-medium transition-colors ${
            currentSection === 'art' ? 'text-var' : 'text-muted hover:text-var'
          }`}
        >
          Art
        </Link>

        {/* Design */}
        <Link
          href="/design"
          className={`w-24 text-center text-sm font-medium transition-colors ${
            currentSection === 'design' ? 'text-var' : 'text-muted hover:text-var'
          }`}
        >
          Design
        </Link>
      </nav>

      {/* Primary Nav (Work / Index / About) */}
      <nav
        className={`h-16 pointer-events-auto flex items-center gap-12 px-4 absolute top-0 ${
          currentSection === 'art' ? 'left-0 justify-start' : 'right-0 justify-end'
        }`}
      >
        <Link href={`/${currentSection}/work`} className="text-sm text-muted font-medium transition-colors hover:text-var">
          Work
        </Link>
        <Link href={`/${currentSection}/index`} className="text-sm text-muted font-medium transition-colors hover:text-var">
          Index
        </Link>
        <Link href="/about" className="text-sm text-muted font-medium transition-colors hover:text-var">
          About
        </Link>
      </nav>
    </header>
  );
}