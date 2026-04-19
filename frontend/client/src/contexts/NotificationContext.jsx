/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../config/api';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchNotifications();
      
      const channel = supabase
        .channel('custom-insert-channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const newNotif = payload.new;
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show simple toast
            const toast = document.createElement('div');
            toast.className = 'toast show';
            toast.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#0F766E; color:white; padding:15px; border-radius:8px; z-index:9999; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); font-family: Outfit; font-size: 0.9rem; max-width:300px; animation: slideInX 0.3s ease-out;';
            toast.innerHTML = `<strong style="display:block; margin-bottom:4px; font-size: 0.95rem;">${newNotif.title}</strong>${newNotif.message}`;
            document.body.appendChild(toast);
            
            setTimeout(() => {
              toast.style.opacity = '0';
              toast.style.transition = 'opacity 0.3s';
              setTimeout(() => toast.remove(), 300);
            }, 6000);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
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
