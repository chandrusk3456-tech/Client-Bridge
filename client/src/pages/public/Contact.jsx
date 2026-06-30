import React, { useState } from 'react';
import { Mail, Phone, Send, ArrowRight, MessageSquareCode } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate contact submission API
    setTimeout(() => {
      setSending(false);
      toast('Message sent successfully! We will get back to you shortly.', 'success');
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs uppercase tracking-widest text-secondary font-bold mb-2 block">Connect With Us</span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-primary">Get in Touch</h1>
        <p className="text-slate-500 text-sm md:text-base mt-4 leading-relaxed">
          Have an upcoming project or want to inspect a workflow case? Drop us a message below or contact us directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Info panel */}
        <div className="lg:col-span-5 space-y-8">
          <div className="glass-card rounded-2xl p-6 border-slate-200/50 space-y-6">
            <h3 className="text-xl font-bold text-slate-800">Direct Contact</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We respond promptly to queries and keep communication lines active during milestones.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Email Address</p>
                  <a href="mailto:charlie@clientbridge.co" className="text-sm font-bold text-slate-700 hover:underline">
                    Clientbridge123@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <MessageSquareCode className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">WhatsApp & Telegram</p>
                  <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="text-sm font-bold text-emerald-600 hover:underline">
                    +91 6382371831(Direct)
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* SLA banner */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6">
            <h4 className="text-sm font-bold text-accent">Client Service Commitment</h4>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              For active clients, response latency on Slack, WhatsApp, and the built-in Chat is guaranteed to be under 2 hours during active business cycles.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Send an Inquiry</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Your Name"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Enter name"
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </div>
            <Input
              label="Subject"
              name="subject"
              required
              value={form.subject}
              onChange={handleChange}
              placeholder="How can we help?"
            />
            <Input
              label="Message Content"
              name="message"
              textarea
              required
              value={form.message}
              onChange={handleChange}
              placeholder="Describe your project goals or inquiries..."
            />
            <Button
              type="submit"
              loading={sending}
              className="w-full justify-center"
              icon={<Send className="w-4 h-4" />}
            >
              Submit Inquiry
            </Button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Contact;
