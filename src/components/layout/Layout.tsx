import { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function Layout({ children, showHeader = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
      <footer className="py-6 border-t border-neutral-200/60 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
            <p>Transform your handwritten mixtapes into digital playlists</p>
            <p className="flex items-center gap-1">
              Made with <span className="text-secondary-500">nostalgia</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
