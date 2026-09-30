import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles, LogOut, Loader2 } from 'lucide-react';
import type { AuthMode } from '../../types/transcript';
import { useAuth } from '../../hooks/useAuth';

interface NavbarProps {
  onOpenAuth: (mode: AuthMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { user, signOut, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut();
      setMobileMenuOpen(false);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  // Determine user display label
  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'User';

  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#F7F2EB]/85 backdrop-blur-md border-b border-[#E8E1D5] shadow-warm-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <a
            href="#"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B9A6E] rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-[#8B9A6E] flex items-center justify-center text-white shadow-warm-sm group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex items-center tracking-tight">
              <span className="text-xl font-bold text-[#1B1E19]">
                SwarTranscript
              </span>
              <span className="ml-1.5 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-[#8B9A6E]/15 text-[#5D6B44] border border-[#8B9A6E]/30 rounded-md">
                AI
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('generator-section')}
              className="text-sm font-medium text-[#595F52] hover:text-[#1B1E19] transition-colors"
            >
              Generator
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-sm font-medium text-[#595F52] hover:text-[#1B1E19] transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-sm font-medium text-[#595F52] hover:text-[#1B1E19] transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-sm font-medium text-[#595F52] hover:text-[#1B1E19] transition-colors"
            >
              FAQ
            </button>
          </nav>

          {/* Desktop Auth State / CTA buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {loading ? (
              <div className="w-24 h-9 bg-[#E8E1D5]/40 rounded-xl animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                {/* User Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E8E1D5] shadow-warm-sm text-xs font-medium text-[#1B1E19]">
                  <div className="w-6 h-6 rounded-lg bg-[#8B9A6E]/20 text-[#5D6B44] font-bold flex items-center justify-center text-xs">
                    {userInitial}
                  </div>
                  <span className="max-w-[140px] truncate" title={user.email || displayName}>
                    {displayName}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#595F52] hover:text-[#1B1E19] hover:bg-[#EAE3D6]/60 rounded-xl transition-all disabled:opacity-50"
                  title="Sign out of your account"
                >
                  {loggingOut ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5" />
                  )}
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="px-4 py-2 text-sm font-medium text-[#282C24] hover:text-[#1B1E19] hover:bg-[#EAE3D6]/60 rounded-xl transition-all duration-150 inline-flex items-center justify-center whitespace-nowrap"
                >
                  Log in
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#8B9A6E] hover:bg-[#758458] active:scale-[0.98] rounded-xl shadow-warm-sm hover:shadow-warm-md transition-all duration-200 inline-flex items-center justify-center whitespace-nowrap leading-none"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {!loading && !user && (
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#8B9A6E] hover:bg-[#758458] rounded-lg shadow-sm"
              >
                Sign Up
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#282C24] hover:bg-[#EAE3D6]/60 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B9A6E]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E8E1D5] bg-[#F7F2EB] px-6 py-5 shadow-warm-md animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-4">
            <button
              onClick={() => scrollToSection('generator-section')}
              className="text-left text-base font-medium text-[#282C24] hover:text-[#8B9A6E] transition-colors"
            >
              Generator
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-left text-base font-medium text-[#282C24] hover:text-[#8B9A6E] transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-left text-base font-medium text-[#282C24] hover:text-[#8B9A6E] transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-left text-base font-medium text-[#282C24] hover:text-[#8B9A6E] transition-colors"
            >
              FAQ
            </button>

            <div className="pt-4 border-t border-[#E8E1D5]">
              {user ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-[#E8E1D5]">
                    <div className="w-7 h-7 rounded-lg bg-[#8B9A6E]/20 text-[#5D6B44] font-bold flex items-center justify-center text-xs">
                      {userInitial}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-[#1B1E19] truncate">
                        {displayName}
                      </div>
                      <div className="text-[11px] text-[#767D6E] truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full py-2.5 text-center text-sm font-semibold text-[#595F52] hover:text-[#1B1E19] bg-white border border-[#E8E1D5] rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loggingOut ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    <span>Log out</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('signin');
                    }}
                    className="w-full py-2.5 text-center text-sm font-medium text-[#282C24] bg-white border border-[#E8E1D5] rounded-xl hover:bg-[#FAF7F2]"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('signup');
                    }}
                    className="w-full py-2.5 text-center text-sm font-semibold text-white bg-[#8B9A6E] hover:bg-[#758458] rounded-xl shadow-warm-sm"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
