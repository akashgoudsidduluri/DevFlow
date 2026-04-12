import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';
import GlassPanel from '../shared/GlassPanel';
import Button from '../shared/Button';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  const { register, error, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Smart redirect: Go back to the invite link if that's where we came from
  // But force dashboard if it's a project path to avoid 'not found' errors after DB purge
  const from = (location.state?.from?.pathname?.includes('/project/')) 
    ? '/dashboard' 
    : (location.state?.from?.pathname || '/dashboard');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (password !== confirmPassword) {
      return setFormError('Passwords do not match');
    }

    try {
      await register(name, email, password);
      navigate(from, { replace: true });
    } catch (err) {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />

        <GlassPanel className="max-w-md w-full p-10 space-y-8 relative z-10">
            <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-4">
                    <UserPlus className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase">Identity Setup</h1>
                <p className="text-muted text-sm">Create your digital persona for the DevFlow workspace.</p>
            </div>

            {(error || formError) && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold animate-shake">
                    {error || formError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted px-1">Display Name</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-3 bg-white/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted px-1">Email Address</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-primary transition-colors" />
                        <input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-3 bg-white/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted px-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted px-1">Confirm</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                <ShieldCheck className="h-4 w-4 text-muted group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                            />
                        </div>
                    </div>
                </div>

                <Button 
                    type="submit" 
                    isLoading={loading}
                    className="w-full h-14 text-sm font-bold group mt-4"
                >
                    Initialize Account
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
            </form>

            <div className="pt-6 border-t border-border/50 text-center">
                <p className="text-sm text-muted">
                    Already a member? <Link to="/login" state={{ from: location.state?.from }} className="text-primary font-bold hover:underline">Log In</Link>
                </p>
            </div>
        </GlassPanel>
    </div>
  );
};

export default RegisterForm;