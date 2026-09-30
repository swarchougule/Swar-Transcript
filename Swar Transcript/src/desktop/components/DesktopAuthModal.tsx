import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, Loader2, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface DesktopAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const DesktopAuthModal: React.FC<DesktopAuthModalProps> = ({
  isOpen,
  onClose,
  isDark,
}) => {
  const { user, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setErrorMsg(error.message || 'Failed to sign in. Please check your credentials.');
        } else {
          setSuccessMsg('Successfully signed in!');
          setTimeout(() => {
            onClose();
          }, 800);
        }
      } else {
        const { error } = await signUpWithEmail(email, password, fullName);
        if (error) {
          setErrorMsg(error.message || 'Failed to create account.');
        } else {
          setSuccessMsg('Account created! Welcome to SwarTranscript AI.');
          setTimeout(() => {
            onClose();
          }, 400);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-sm rounded-2xl border shadow-warm-xl overflow-hidden animate-in zoom-in-95 duration-150 ${
          isDark
            ? 'bg-[#181D17] border-[#293225] text-[#E5EADF]'
            : 'bg-white border-[#E8E1D5] text-[#1B1E19]'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isDark ? 'bg-[#141813] border-[#252C22]' : 'bg-[#FAF7F2] border-[#EAE3D6]'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#8B9A6E]/15 border border-[#8B9A6E]/30 flex items-center justify-center text-[#5D6B44] dark:text-[#A6B595]">
              <Lock className="w-3.5 h-3.5 text-[#8B9A6E]" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                {user ? 'Account Profile' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </h3>
              <p className="text-[10px] text-[#767D6E] dark:text-[#889380]">
                {user ? 'Manage your active desktop session' : 'Required to access Supabase Edge Functions'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#767D6E] hover:text-[#1B1E19] dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-xs">
          {user ? (
            /* User already signed in */
            <div className="space-y-4">
              <div
                className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                  isDark ? 'bg-[#141813] border-[#252C22]' : 'bg-[#FAF7F2] border-[#EAE3D6]'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#8B9A6E] flex items-center justify-center text-white font-bold text-sm uppercase">
                  {user.email?.[0] || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{user.email}</div>
                  <div className="text-[10px] text-emerald-600 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active Supabase Session</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 font-semibold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Desktop</span>
              </button>
            </div>
          ) : (
            /* Sign in / Sign up form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Tab Switcher */}
              <div className="flex rounded-xl bg-[#EFE9DE] dark:bg-[#1E241C] p-1 border border-[#E3DBD0] dark:border-[#2B3327]">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    mode === 'signin'
                      ? 'bg-white dark:bg-[#2C3428] text-[#1B1E19] dark:text-white shadow-xs'
                      : 'text-[#767D6E] dark:text-[#889380]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    mode === 'signup'
                      ? 'bg-white dark:bg-[#2C3428] text-[#1B1E19] dark:text-white shadow-xs'
                      : 'text-[#767D6E] dark:text-[#889380]'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-medium text-[#595F52] dark:text-[#9AA392] mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#767D6E]" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      className={`w-full pl-8 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#8B9A6E] ${
                        isDark
                          ? 'bg-[#121611] border-[#293225] text-white'
                          : 'bg-[#FDFBF7] border-[#E8E1D5] text-[#1B1E19]'
                      }`}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-[#595F52] dark:text-[#9AA392] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#767D6E]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className={`w-full pl-8 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#8B9A6E] ${
                      isDark
                        ? 'bg-[#121611] border-[#293225] text-white'
                        : 'bg-[#FDFBF7] border-[#E8E1D5] text-[#1B1E19]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#595F52] dark:text-[#9AA392] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#767D6E]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className={`w-full pl-8 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#8B9A6E] ${
                      isDark
                        ? 'bg-[#121611] border-[#293225] text-white'
                        : 'bg-[#FDFBF7] border-[#E8E1D5] text-[#1B1E19]'
                    }`}
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-[11px] flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-[#8B9A6E] hover:bg-[#758458] active:scale-[0.98] transition-all shadow-warm-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
