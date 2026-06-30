import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Save, Camera, Loader2, Sparkles, Building2, PhoneCall, Send, Share2 } from 'lucide-react';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    phone: user?.phone || '',
    whatsapp: user?.whatsapp || '',
    telegram: user?.telegram || '',
    company: user?.company || '',
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic file type validation
    if (!file.type.startsWith('image/')) {
      toast('Please select an image file', 'warning');
      return;
    }

    // Limit to 5MB on client side
    if (file.size > 5 * 1024 * 1024) {
      toast('Image file size should be less than 5MB', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('/api/auth/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setForm((prev) => ({ ...prev, avatar: data.fileUrl }));
        toast('Profile picture uploaded successfully!', 'success');
      } else {
        toast(data.message || 'File upload failed', 'error');
      }
    } catch (err) {
      console.error('File upload error:', err);
      toast('Failed to upload file to server', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast('Display name is required', 'warning');
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile({
        name: form.name,
        avatar: form.avatar,
        phone: form.phone,
        whatsapp: form.whatsapp,
        telegram: form.telegram,
        company: form.company,
      });

      if (res.success) {
        toast('Profile updated successfully!', 'success');
      } else {
        toast(res.message || 'Profile update failed', 'error');
      }
    } catch (err) {
      toast('Profile update encountered an error', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 select-none">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-secondary" /> Account Settings
        </h1>
        <p className="text-xs text-slate-450 mt-1">
          Manage your personal details, profile picture, and direct communication settings.
        </p>
      </div>

      {/* Profile Form Card */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
        
        {/* Left Side: Avatar Upload Frame */}
        <div className="w-full md:w-1/3 flex flex-col items-center gap-4 shrink-0">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-md relative bg-slate-50 transition-all duration-300 group-hover:border-secondary/20">
              <img
                src={form.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150'}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center rounded-full">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            
            {/* Camera Badge icon */}
            <div className="absolute bottom-1 right-1 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white pointer-events-none">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="text-center">
            <h4 className="text-sm font-bold text-slate-800">{form.name || 'User Name'}</h4>
            <span className="text-[10px] uppercase font-bold tracking-widest text-secondary bg-blue-50 px-2 py-0.5 rounded-full mt-1.5 inline-block">
              {user?.role} Account
            </span>
          </div>
        </div>

        {/* Right Side: Form Inputs */}
        <form onSubmit={handleSubmit} className="flex-1 w-full space-y-6">
          
          {/* Identity details */}
          <div className="border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Jenkins partners"
                required
              />
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-sm font-semibold cursor-not-allowed outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5">Email cannot be modified.</span>
              </div>
            </div>
          </div>

          {/* SaaS Business Contact Details */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Communication Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. +1 555-0199"
                icon={<PhoneCall className="w-4.5 h-4.5 text-slate-400" />}
              />
              <Input
                label="Company Name"
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="e.g. Jenkins Partners"
                icon={<Building2 className="w-4.5 h-4.5 text-slate-400" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Input
                label="WhatsApp Number Link"
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                placeholder="e.g. https://wa.me/..."
                icon={<Share2 className="w-4.5 h-4.5 text-slate-400" />}
              />
              <Input
                label="Telegram Username"
                name="telegram"
                value={form.telegram}
                onChange={handleChange}
                placeholder="e.g. username"
                icon={<Send className="w-4.5 h-4.5 text-slate-400" />}
              />
            </div>
          </div>

          {/* Submit Action */}
          <Button
            type="submit"
            loading={saving}
            className="w-full justify-center py-2.5 bg-secondary hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/10"
            icon={<Save className="w-4.5 h-4.5" />}
          >
            Save Changes
          </Button>

        </form>

      </div>

    </div>
  );
};

export default Profile;
