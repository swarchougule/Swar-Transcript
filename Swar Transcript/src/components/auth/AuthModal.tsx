import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Sparkles, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import type { AuthMode } from '../../types/transcript';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Synchronize mode when initialMode changes or modal opens
  useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [initialMode, isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, submitting]);

  if (!isOpen) return null;

  const handleTabSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    // Basic validation
    if (!email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            setErrorMessage('Invalid email or password. Please try again.');
          } else {
            setErrorMessage(error.message);
          }
        } else {
          onClose();
        }
      } else {
        // Sign Up - auto-confirms and signs in immediately
        const { error } = await signUpWithEmail(email, password, name);
        if (error) {
          if (error.message.toLowerCase().includes('already registered')) {
            setErrorMessage('An account with this email already exists. Try signing in instead.');
          } else {
            setErrorMessage(error.message);
          }
        } else {
          // Immediately enter application
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (submitting) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMessage(error.message);
        setSubmitting(false);
      }
      // Note: On success, browser will redirect to Google's consent screen.
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to initiate Google sign in.');
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => {
        if (!submitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Modal Content Box */}
      <div
        className="relative w-full max-w-md bg-white rounded-3xl border border-[#E8E1D5] shadow-warm-xl p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            if (!submitting) onClose();
          }}
          disabled={submitting}
          className="absolute top-5 right-5 p-2 text-[#767D6E] hover:text-[#1B1E19] hover:bg-[#F7F2EB] disabled:opacity-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B9A6E]"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#8B9A6E]/15 text-[#5D6B44] border border-[#8B9A6E]/30 mb-3">
            <Sparkles className="w-5 h-5 text-[#8B9A6E]" />
          </div>
          <h2
            id="auth-modal-title"
            className="text-2xl font-bold text-[#1B1E19] tracking-tight"
          >
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-[#595F52] mt-1">
            {mode === 'signin'
              ? 'Sign in to generate and save your transcripts'
              : 'Start converting YouTube videos into text in seconds'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-xl bg-[#F7F2EB] p-1 border border-[#E8E1D5] mb-5">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleTabSwitch('signin')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-60 ${
              mode === 'signin'
                ? 'bg-white text-[#1B1E19] shadow-warm-sm'
                : 'text-[#595F52] hover:text-[#1B1E19]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleTabSwitch('signup')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-60 ${
              mode === 'signup'
                ? 'bg-white text-[#1B1E19] shadow-warm-sm'
                : 'text-[#595F52] hover:text-[#1B1E19]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Alert / Feedback Banners */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{successMessage}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          disabled={submitting}
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#E8E1D5] rounded-xl bg-white hover:bg-[#FAF7F2] text-sm font-medium text-[#1B1E19] shadow-warm-sm transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 text-[#8B9A6E] animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E8E1D5]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-[#767D6E]">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label
                htmlFor="auth-name"
                className="block text-xs font-semibold text-[#282C24] mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#767D6E]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="auth-name"
                  type="text"
                  disabled={submitting}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivers"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#FDFBF7] text-[#1B1E19] placeholder:text-[#989F90] border border-[#E8E1D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B9A6E] focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="block text-xs font-semibold text-[#282C24] mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#767D6E]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="auth-email"
                type="email"
                required
                disabled={submitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#FDFBF7] text-[#1B1E19] placeholder:text-[#989F90] border border-[#E8E1D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B9A6E] focus:bg-white transition-all disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="auth-password"
                className="block text-xs font-semibold text-[#282C24]"
              >
                Password
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() =>
                    alert('Password reset link flow can be initiated with Supabase auth.resetPasswordForEmail.')
                  }
                  className="text-xs font-medium text-[#5D6B44] hover:text-[#8B9A6E] transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#767D6E]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="auth-password"
                type="password"
                required
                disabled={submitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#FDFBF7] text-[#1B1E19] placeholder:text-[#989F90] border border-[#E8E1D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B9A6E] focus:bg-white transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <p className="text-[11px] text-[#767D6E] leading-tight">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#8B9A6E] hover:bg-[#758458] active:scale-[0.99] rounded-xl shadow-warm-sm hover:shadow-warm-md transition-all duration-200 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{mode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
              </>
            ) : (
              <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* Footnote Switcher */}
        <div className="mt-5 text-center text-xs text-[#595F52]">
          {mode === 'signin' ? (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleTabSwitch('signup')}
                className="font-semibold text-[#5D6B44] hover:underline"
              >
                Sign up free
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleTabSwitch('signin')}
                className="font-semibold text-[#5D6B44] hover:underline"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
