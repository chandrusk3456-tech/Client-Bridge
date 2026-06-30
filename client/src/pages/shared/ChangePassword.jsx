import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import { auth } from '../../firebase/config';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { ShieldCheck, Eye, EyeOff, Lock, Sparkles, AlertCircle } from 'lucide-react';

export const ChangePassword = () => {
  const { logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [updating, setUpdating] = useState(false);

  // Check if the current user is signed in using Google Authentication
  const isGoogleUser = auth.currentUser?.providerData.some(
    (provider) => provider.providerId === 'google.com'
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isGoogleUser) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast('Please fill in all fields', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      toast('New password must be at least 6 characters long', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast('New passwords do not match', 'warning');
      return;
    }

    if (currentPassword === newPassword) {
      toast('New password must be different from current password', 'warning');
      return;
    }

    setUpdating(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        toast('No active authentication session found', 'error');
        return;
      }

      // 1. Re-authenticate user with current password (required by Firebase)
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // 2. Update password in Firebase Auth
      await updatePassword(user, newPassword);

      toast('Password updated successfully! Please log in again.', 'success');
      
      // 3. Log out user and redirect to login page for session security
      setTimeout(async () => {
        await logout();
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Password change error:', error);
      let errMsg = 'Failed to update password. Please check your credentials.';
      if (error.code === 'auth/wrong-password') {
        errMsg = 'Current password is incorrect.';
      } else if (error.code === 'auth/requires-recent-login') {
        errMsg = 'Please log out and log back in to perform this operation.';
      }
      toast(errMsg, 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-secondary" /> Security Settings
        </h1>
        <p className="text-xs text-slate-450 mt-1">
          Maintain your account credentials securely.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
        
        {/* Google Authentication Guard Notice */}
        {isGoogleUser ? (
          <div className="flex gap-3.5 p-5 bg-blue-50/50 border border-blue-100 rounded-2xl items-start">
            <AlertCircle className="w-6 h-6 text-secondary shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-800">Managed via Google</h4>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Password changes are managed through your Google account. You can configure your security options under your Google Account Dashboard settings.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Change Account Password</h3>

            {/* Current Password */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Current Password
              </label>
              <div className="relative w-full">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-200 outline-none text-slate-800 placeholder-slate-450 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition-colors p-1"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                New Password
              </label>
              <div className="relative w-full">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-200 outline-none text-slate-800 placeholder-slate-450 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition-colors p-1"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-400">Password must be at least 6 characters long.</span>
            </div>

            {/* Confirm New Password */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Confirm New Password
              </label>
              <div className="relative w-full">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-200 outline-none text-slate-800 placeholder-slate-450 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition-colors p-1"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              loading={updating}
              className="w-full justify-center py-2.5 bg-secondary hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/10"
              icon={<Lock className="w-4.5 h-4.5" />}
            >
              Update Password
            </Button>
          </form>
        )}

      </div>

    </div>
  );
};

export default ChangePassword;
