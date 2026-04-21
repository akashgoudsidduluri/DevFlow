import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';
import GlassPanel from '../shared/GlassPanel';
import Button from '../shared/Button';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, loading } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  // Smart redirect: Go back to the invite link if that's where we came from
  // But force dashboard if it's a project path to avoid 'not found' errors after DB purge
  const from = (location.state?.from?.pathname?.includes('/project/')) 
    ? '/dashboard' 
    : (location.state?.from?.pathname || '/dashboard');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      // Auth errors are surfaced through context state.
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-10 space-y-8">
            <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-slate-100 rounded-xl mb-2">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to DevFlow</h1>
                <p className="text-slate-500 text-sm">Enter your credentials to access your workspaces.</p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 px-1">Email Address</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 px-1">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-sm"
                        />
                    </div>
                </div>

                <Button 
                    type="submit" 
                    isLoading={loading}
                    className="w-full h-11 text-sm font-bold shadow-sm"
                >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </form>

            <div className="pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                    New to DevFlow? <Link to="/register" state={{ from: location.state?.from }} className="text-primary font-semibold hover:underline">Create account</Link>
                </p>
            </div>
        </div>
    </div>
  );
};

export default LoginForm;
