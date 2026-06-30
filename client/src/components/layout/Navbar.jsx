import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Bell, Menu, X, ArrowRight, Sparkles, User, Lock, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  const { user, logout, loading } = useAuth();
  const { notifications, markOneAsRead, markAllAsRead } = useSocket();
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const navLinks = [
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Services', path: '/services' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  const unreadCount = notifications ? notifications.filter((n) => !n.isRead).length : 0;
  const isActive = (path) => location.pathname === path;
  const firstName = user && user.name ? user.name.split(' ')[0] : 'User';

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Profile dropdown check
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      // Notifications dropdown check
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowProfileDropdown(false);
    const success = await logout();
    if (success) {
      navigate('/login');
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-nav">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-secondary to-accent flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-primary">Client<span className="text-secondary">Bridge</span></span>
            <p className="text-[9px] uppercase tracking-widest text-slate-400 -mt-1 font-semibold">Bridging Ideas</p>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-semibold tracking-wide transition-colors relative py-1 ${
                isActive(link.path) ? 'text-secondary font-bold' : 'text-slate-500 hover:text-primary'
              }`}
            >
              {link.name}
              {isActive(link.path) && (
                <motion.div
                  layoutId="activeNavLine"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full"
                />
              )}
            </Link>
          ))}
        </div>

        {/* Action Buttons & Session */}
        <div className="hidden md:flex items-center gap-4">
          {loading ? (
            <div className="w-28 h-9 bg-slate-100 animate-pulse rounded-full" />
          ) : user ? (
            <div className="flex items-center gap-4 relative">
              {/* Notification icon */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-primary transition-all relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 border border-white text-[9px] text-white font-bold flex items-center justify-center rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 overflow-hidden"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                        <span className="font-bold text-slate-800">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-secondary hover:underline font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto flex flex-col gap-2 py-1 pr-1 dark-scroll">
                        {notifications && notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                markOneAsRead(n._id);
                                setShowNotifications(false);
                              }}
                              className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                                n.isRead
                                  ? 'bg-slate-50/50 border-transparent text-slate-400'
                                  : 'bg-blue-50/30 border-blue-100/50 text-slate-700 hover:bg-blue-50/50'
                              }`}
                            >
                              <Link to={n.link || '/dashboard'}>
                                <p className="text-xs font-bold">{n.title}</p>
                                <p className="text-[11px] leading-relaxed mt-0.5">{n.message}</p>
                              </Link>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-xs text-slate-400 font-medium">
                            No notifications yet
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Avatar Dropdown Trigger */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 hover:bg-slate-50 rounded-full p-1 transition-all group outline-none select-none"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150'}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover bg-slate-200 shrink-0 border border-slate-200"
                  />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-secondary transition-colors">
                    {firstName}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-14 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 flex flex-col"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-secondary hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <User className="w-4.5 h-4.5" />
                        Profile
                      </Link>
                      
                      <Link
                        to="/change-password"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-secondary hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <Lock className="w-4.5 h-4.5" />
                        Change Password
                      </Link>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors w-full text-left"
                      >
                        <LogOut className="w-4.5 h-4.5" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          ) : (
            <Link to="/login">
              <Button size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                Client Portal
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-3">
          {loading ? (
            <div className="w-9 h-9 bg-slate-100 animate-pulse rounded-full shrink-0" />
          ) : user ? (
            <Link
              to="/profile"
              className="shrink-0"
            >
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150'}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover bg-slate-100 shrink-0 border border-slate-250"
              />
            </Link>
          ) : null}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-xl transition-colors shrink-0"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden w-full border-t border-slate-100 bg-white/95 backdrop-blur-md px-6 py-4 flex flex-col gap-3 shadow-lg"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`py-2 text-base font-semibold ${
                  isActive(link.path) ? 'text-secondary' : 'text-slate-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {user && (
              <>
                <div className="border-t border-slate-100 my-1"></div>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className={`py-2 text-base font-semibold ${
                    isActive('/profile') ? 'text-secondary' : 'text-slate-650'
                  }`}
                >
                  Profile
                </Link>
                <Link
                  to="/change-password"
                  onClick={() => setIsOpen(false)}
                  className={`py-2 text-base font-semibold ${
                    isActive('/change-password') ? 'text-secondary' : 'text-slate-650'
                  }`}
                >
                  Change Password
                </Link>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="py-2 text-left text-rose-500 font-semibold border-t border-slate-100 mt-1"
                >
                  Logout
                </button>
              </>
            )}
            
            {!loading && !user && (
              <Link to="/login" onClick={() => setIsOpen(false)} className="mt-2">
                <Button className="w-full" size="md">
                  Portal Login
                </Button>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
