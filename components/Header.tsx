import Link from 'next/link';

interface HeaderProps {
  currentSection: string;
}

export default function Header({ currentSection }: HeaderProps) {
  return (
    <header className="border-b border-var">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link
              href="/art"
              className={`text-sm font-medium transition-colors ${
                currentSection === 'art'
                  ? 'text-var'
                  : 'text-muted hover:text-var'
              }`}
            >
              Art
            </Link>
            <Link
              href="/design"
              className={`text-sm font-medium transition-colors ${
                currentSection === 'design'
                  ? 'text-var'
                  : 'text-muted hover:text-var'
              }`}
            >
              Design
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}