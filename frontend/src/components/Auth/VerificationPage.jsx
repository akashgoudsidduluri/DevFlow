import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { CheckCircle2, XCircle, Loader2, Rocket, ArrowRight } from 'lucide-react';
import GlassPanel from '../shared/GlassPanel';
import Button from '../shared/Button';

const VerificationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { verifyInvitation, loading } = useProject();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const hasCalled = React.useRef(false);

  useEffect(() => {
    const handleVerify = async () => {
      if (hasCalled.current) return;
      hasCalled.current = true;
      
      try {
        await verifyInvitation(token);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.response?.data?.message || 'The invitation link is invalid or has expired.');
      }
    };

    if (token) {
        handleVerify();
    }
  }, [token, verifyInvitation]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse delay-700" />

      <GlassPanel className="max-w-md w-full p-10 text-center space-y-8 relative z-10">
        <div className="flex justify-center">
            <div className="p-4 bg-primary rounded-3xl shadow-xl shadow-primary/20 rotate-3">
                <Rocket className="h-8 w-8 text-white" />
            </div>
        </div>

        {status === 'verifying' && (
          <div className="space-y-4">
            <div className="flex justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Verifying Credentials</h2>
            <p className="text-muted text-sm px-4">Establishing a secure connection to the DevFlow protocol...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 animate-faded-in-up">
            <div className="flex justify-center">
                <div className="p-3 bg-green-500/10 rounded-full">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tighter text-foreground">ACCESS GRANTED</h2>
                <p className="text-muted text-sm px-6">Your identity has been verified. You are now a recognized member of the workspace.</p>
            </div>
            <Button 
                onClick={() => navigate('/dashboard')}
                className="w-full h-14 text-md font-bold group"
            >
                Enter Dashboard
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 animate-faded-in-up">
            <div className="flex justify-center">
                <div className="p-3 bg-red-500/10 rounded-full">
                    <XCircle className="h-16 w-16 text-red-500" />
                </div>
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Verification Failed</h2>
                <p className="text-red-500/80 text-sm font-medium px-4">{errorMessage}</p>
            </div>
            <div className="pt-4 flex flex-col gap-3">
                <Button 
                    onClick={() => navigate('/dashboard')}
                    variant="secondary"
                    className="w-full"
                >
                    Return to Dashboard
                </Button>
                <Link to="/login" className="text-xs font-bold text-muted hover:text-primary transition-colors">
                    Switch Account?
                </Link>
            </div>
          </div>
        )}

        <div className="pt-8 border-t border-border/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted/40 italic">
                Secure Invitation Layer v1.0
            </p>
        </div>
      </GlassPanel>
    </div>
  );
};

export default VerificationPage;
