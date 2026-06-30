import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  FilePlus2,
  FileText,
  Briefcase,
  Star,
  Users,
  CreditCard,
  UserCheck
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const { notifications } = useSocket();
  const location = useLocation();

  if (!user) return null;

  // Define admin menu items
  const adminMenu = [
    { name: 'Overview', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Projects Control', path: '/admin/projects', icon: <FolderKanban className="w-5 h-5" /> },
    { name: 'Project Requests', path: '/admin/requests', icon: <FilePlus2 className="w-5 h-5" /> },
    { name: 'Portfolio CMS', path: '/admin/portfolio', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Blog CMS', path: '/admin/blogs', icon: <FileText className="w-5 h-5" /> },
    { name: 'Review Moderation', path: '/admin/reviews', icon: <Star className="w-5 h-5" /> },
  ];

  const menuItems = adminMenu;

  const isCurrent = (path) => {
    if (path === '/dashboard' || path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getUnreadMessagesCount = () => {
    if (!notifications) return 0;
    return notifications.filter((n) => !n.isRead && n.type === 'message').length;
  };

  return (
    <aside className="w-64 border-r border-slate-200/50 bg-white/70 backdrop-blur-md min-h-[calc(100vh-80px)] p-6 shrink-0 hidden md:block">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-4 block px-3">
          Admin Console
        </span>
        {menuItems.map((item) => {
          const active = isCurrent(item.path);
          const unreadMsg = item.badge && getUnreadMessagesCount() > 0;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${
                active
                  ? 'bg-secondary/10 text-secondary'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.name}</span>
              </div>
              {unreadMsg && (
                <span className="w-5 h-5 bg-rose-500 text-white font-bold text-[10px] rounded-lg flex items-center justify-center shadow-sm">
                  {getUnreadMessagesCount()}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
