import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../config/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext({});

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch (err) {
      console.error('Failed fetching notifications', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      fetchNotifications();
      const interval = setInterval(() => {
        fetchNotifications();
      }, 20000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
