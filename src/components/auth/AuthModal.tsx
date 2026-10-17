import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, Mail, User as UserIcon, AlertCircle, Check, Headphones, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    authModalOpen, 
    setAuthModalOpen, 
    authModalMode, 
    setAuthModalMode, 
    login, 
    register, 
    switchUserRole 
  } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (authModalMode === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.message || 'Login failed. Please check credentials.');
        }
      } else if (authModalMode === 'register') {
        if (!name.trim()) {
          setError('Please provide your name.');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setIsLoading(false);
          return;
        }
        const res = await register(name, email, password);
        if (!res.success) {
          setError(res.message || 'Registration failed.');
        }
      } else if (authModalMode === 'forgot') {
        if (!email.trim()) {
          setError('Please enter your account email.');
          setIsLoading(false);
          return;
        }
        // Simulated password reset
        setSuccessMsg(`A password reset link has been dispatched to ${email}. Check your inbox!`);
        setTimeout(() => {
          setAuthModalMode('login');
          setSuccessMsg(null);
        }, 3000);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickDemo = (role: 'admin' | 'listener') => {
    if (role === 'admin') {
      setEmail('admin@dkfm.com');
      setPassword('admin123');
    } else {
      setEmail('aarav@listener.com');
      setPassword('listener123');
    }
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Lockup */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-slate-950 font-bold">
            <Headphones className="w-4 h-4" />
          </div>
          <span className="font-display font-extrabold text-lg text-white">DK <span className="text-orange-500">Fm</span></span>
        </div>

        {/* Modal Titles */}
        <div className="mb-6">
          <h2 className="text-xl font-bold font-display text-white">
            {authModalMode === 'login' && 'Sign In to DK Fm'}
            {authModalMode === 'register' && 'Create Free Listener Account'}
            {authModalMode === 'forgot' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {authModalMode === 'login' && 'Access your streaming history, saved favorites, and creator tools.'}
            {authModalMode === 'register' && 'Join thousands of listeners streaming episodic audio stories.'}
            {authModalMode === 'forgot' && 'Enter your registered email and we will help recover your access.'}
          </p>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="mb-4 p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/70 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {authModalMode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Elena Rostova"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          {authModalMode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                {authModalMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setAuthModalMode('forgot');
                    }}
                    className="text-[11px] text-orange-400 hover:text-orange-300 font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
            </div>
          )}

          {authModalMode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/20 active:scale-[0.99] transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Processing...' : (
              authModalMode === 'login' ? 'Sign In' :
              authModalMode === 'register' ? 'Create Free Account' : 'Send Recovery Instructions'
            )}
          </button>
        </form>

        {/* Quick Demo Pre-fill helpers */}
        {authModalMode === 'login' && (
          <div className="mt-5 pt-4 border-t border-slate-800">
            <p className="text-[11px] text-slate-400 mb-2 text-center">Quick Demo Accounts (1-Click Fill):</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillQuickDemo('admin')}
                className="py-1.5 px-2 bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/80 rounded-lg text-purple-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Demo</span>
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('listener')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-orange-400" />
                <span>Listener Demo</span>
              </button>
            </div>
          </div>
        )}

        {/* Toggle Mode footer */}
        <div className="mt-6 text-center text-xs text-slate-400">
          {authModalMode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setAuthModalMode('register');
                }}
                className="text-orange-400 hover:text-orange-300 font-bold"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setAuthModalMode('login');
                }}
                className="text-orange-400 hover:text-orange-300 font-bold"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
