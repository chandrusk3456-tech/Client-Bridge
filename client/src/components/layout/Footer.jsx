import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, ShieldAlert, Laptop, PlaySquare } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-primary text-slate-400 border-t border-slate-900 py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand Column */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-secondary to-accent flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Client<span className="text-secondary">Bridge</span></span>
          </Link>
          <p className="text-xs leading-relaxed max-w-xs">
            A premium full-stack portfolio & personal client cockpit for professional web engineering and cinematic video editing.
          </p>
        </div>

        {/* Services column */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-widest text-white font-bold">Services</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Laptop className="w-3.5 h-3.5 text-accent" />
              <span>Full-Stack Web Dev</span>
            </li>
            <li className="flex items-center gap-1.5 hover:text-white transition-colors">
              <PlaySquare className="w-3.5 h-3.5 text-highlight" />
              <span>Video Editing & Motion Graphics</span>
            </li>
          </ul>
        </div>

        {/* Links column */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-widest text-white font-bold">Explore</h4>
          <ul className="space-y-2 text-xs flex flex-col">
            <Link to="/portfolio" className="hover:text-white transition-colors">Case Studies</Link>
            <Link to="/services" className="hover:text-white transition-colors">Pricing & Features</Link>
            <Link to="/blog" className="hover:text-white transition-colors">Read Blog</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Get in Touch</Link>
          </ul>
        </div>

        {/* Contact info column */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-widest text-white font-bold">Contact</h4>
          <ul className="space-y-2 text-xs flex flex-col">
            <li className="flex items-center gap-1.5 text-slate-300">
              <Mail className="w-3.5 h-3.5 text-secondary" />
              <a href="mailto:charlie@clientbridge.co" className="hover:underline">charlie@clientbridge.co</a>
            </li>
            <li className="text-[11px] text-slate-500 leading-relaxed pt-1.5">
              Available worldwide. Accepting project bids for Q3/Q4 2026.
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-900 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-600">
        <p>© {new Date().getFullYear()} ClientBridge. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
