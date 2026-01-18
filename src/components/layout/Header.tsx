import { Link, useNavigate } from 'react-router-dom';
import { Disc3, Menu, X, LogOut, User, History } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200/60 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Disc3 className="w-8 h-8 text-primary-600 group-hover:rotate-180 transition-transform duration-500" />
              <div className="absolute inset-0 w-8 h-8 bg-secondary-400/20 rounded-full blur-md group-hover:bg-secondary-400/40 transition-colors" />
            </div>
            <span className="font-display font-bold text-xl text-neutral-900">
              Mixtape Memory
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link
                  to="/history"
                  className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  <History className="w-4 h-4" />
                  My Mixtapes
                </Link>
                <Link
                  to="/scan"
                  className="text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Scan New
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline">{user.email}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Sign In
                </Link>
                <Button onClick={() => navigate('/signup')} size="sm">
                  Get Started
                </Button>
              </>
            )}
          </nav>

          <button
            className="md:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 animate-fade-in">
            {user ? (
              <div className="flex flex-col gap-2">
                <Link
                  to="/history"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <History className="w-4 h-4" />
                  My Mixtapes
                </Link>
                <Link
                  to="/scan"
                  className="px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Scan New
                </Link>
                <div className="pt-2 mt-2 border-t border-neutral-200">
                  <div className="px-3 py-2 text-sm text-neutral-500">{user.email}</div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-2 rounded-lg bg-primary-600 text-white text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
