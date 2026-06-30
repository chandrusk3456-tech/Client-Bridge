import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [activeChatLogs, setActiveChatLogs] = useState([]);

  // Fetch initial notifications when user changes
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const res = await fetch('/api/admin/notifications');
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect socket to endpoint (with proxy support)
    const socketUrl = window.location.origin; // Vite proxy routes everything appropriately
    const socketInstance = io(socketUrl, {
      withCredentials: true,
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('Socket.io connected on frontend:', socketInstance.id);
      socketInstance.emit('join_user', user._id);
    });

    socketInstance.on('receive_message', (msg) => {
      // Trigger update of active logs
      setActiveChatLogs((prev) => [...prev, msg]);
      
      // If client is not currently viewing the chat page, show a Toast notification
      if (!window.location.pathname.includes('/chat')) {
        toast(`New message from ${msg.sender.name}: "${msg.content || 'Attachment'}"`, 'info');
      }
    });

    socketInstance.on('receive_notification', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      toast(`${notif.title}: ${notif.message}`, 'success');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/admin/notifications/read-all', { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Error marking notifications read:', err);
    }
  };

  const markOneAsRead = async (id) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}/read`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        setNotifications,
        activeChatLogs,
        setActiveChatLogs,
        markAllAsRead,
        markOneAsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export default SocketContext;
