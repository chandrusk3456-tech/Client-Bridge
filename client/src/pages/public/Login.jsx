import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, isAdminEmail } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';
import Button from '../../components/common/Button';

export const Login = () => {
  const { loginWithEmail, loginWithGoogle, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // If already logged in, redirect immediately based on role
  useEffect(() => {
    if (user) {
      if (isAdminEmail(user.email)) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Please enter both email and password', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithEmail(email, password);
      if (res.success) {
        toast('Logged in successfully!', 'success');
        // Redirection is handled by the useEffect watching user state, 
        // but as a fallback, we route immediately
        if (isAdminEmail(res.user.email)) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        // Translate common Firebase Auth errors to user-friendly messages
        let errMsg = res.message;
        if (res.message.includes('auth/invalid-credential')) {
          errMsg = 'Invalid email or password. Please try again.';
        } else if (res.message.includes('auth/user-not-found')) {
          errMsg = 'No account associated with this email.';
        } else if (res.message.includes('auth/wrong-password')) {
          errMsg = 'Incorrect password.';
        }
        toast(errMsg, 'error');
      }
    } catch (err) {
      toast('An unexpected login error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        toast(`Welcome back, ${res.user.displayName || 'Client'}!`, 'success');
        if (isAdminEmail(res.user.email)) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        toast(res.message || 'Google Authentication failed', 'error');
      }
    } catch (err) {
      toast('Google login failed', 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden select-none">
      
      {/* Subtle Background Mesh/Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl -z-10" />

      {/* Top Logo */}
      <div className="flex items-center gap-2 mb-8 group cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-secondary to-accent flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-primary">Client<span className="text-secondary">Bridge</span></span>
          <p className="text-[9px] uppercase tracking-widest text-slate-400 -mt-1 font-semibold">Bridging Ideas</p>
        </div>
      </div>

      {/* Card Wrapper */}
      <div className="max-w-md w-full bg-white border border-slate-200/50 shadow-2xl rounded-2xl p-8 flex flex-col">
        
        {/* Card Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-slate-800 leading-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Sign in to access your project dashboard and manage your account.
          </p>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          
          {/* Email field */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-sm"
            />
          </div>

          {/* Password field with Eye Toggle */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Password
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password links */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-secondary border-slate-300 focus:ring-secondary/25"
              />
              <span>Remember Me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-secondary font-semibold hover:underline"
              onClick={(e) => {
                // If forgot password page doesn't exist, we notify with a toast
                e.preventDefault();
                toast("Password reset link will be sent. Firebase configuration pending.", "info");
              }}
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit/Login button */}
          <Button
            type="submit"
            loading={loading}
            className="w-full py-2.5 bg-secondary hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-500/10"
          >
            Login
          </Button>

        </form>

        {/* Divider OR */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-250/70"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 font-semibold text-slate-400">
              OR
            </span>
          </div>
        </div>

        {/* Google Authentication */}
        <Button
          onClick={handleGoogleLogin}
          loading={googleLoading}
          variant="outline"
          className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-sm text-sm"
        >
          {!googleLoading && (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.716 5.716 0 0 1-2.48 3.75v3.12h4.02c2.35-2.17 3.71-5.38 3.71-9.22z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.02-3.12c-1.12.75-2.55 1.19-3.91 1.19-3.02 0-5.58-2.04-6.49-4.79H1.38v3.22C3.36 21.65 7.42 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.51 14.37c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.59H1.38A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.38 5.41l4.13-3.04z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.42 0 3.36 2.35 1.38 6.59l4.13 3.04c.91-2.75 3.47-4.75 6.49-4.75z"
              />
            </svg>
          )}
          Sign in with Google
        </Button>

        {/* Signup Section */}
        <p className="text-xs text-slate-500 text-center mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-secondary font-semibold hover:underline hover:text-blue-700 transition-colors">
            Sign Up
          </Link>
        </p>
      </div>

      {/* Footer Branding Info */}
      <p className="text-[10px] text-slate-400 mt-6 font-semibold uppercase tracking-wider">
        Powered by ClientBridge Security
      </p>

    </div>
  );
};

export default Login;
