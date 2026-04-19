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
            const raw = payload.new;
            // Normalize snake_case from Postgres to camelCase for React
            const newNotif = {
              id: raw.id,
              userId: raw.user_id,
              notificationType: raw.notification_type,
              title: raw.title,
              message: raw.message,
              isRead: raw.is_read,
              createdAt: raw.created_at
            };

            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show Premium Toast
            const toast = document.createElement('div');
            toast.style.cssText = `
              position: fixed; bottom: 24px; right: 24px; 
              background: white; border-left: 5px solid #0F766E;
              padding: 16px 20px; border-radius: 12px; z-index: 9999;
              box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
              font-family: Outfit, sans-serif; min-width: 320px; max-width: 400px;
              display: flex; flex-direction: column; gap: 4px;
              animation: slideInX 0.4s cubic-bezier(0.16, 1, 0.3, 1);
              transition: all 0.4s ease;
            `;
            toast.innerHTML = `
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size: 0.75rem; font-weight: 700; color: #0F766E; text-transform: uppercase; letter-spacing: 0.05em;">New Notification</span>
                <span style="font-size: 0.7rem; color: #94A3B8;">Just now</span>
              </div>
              <strong style="color: #0F172A; font-size: 1rem; line-height: 1.4;">${newNotif.title}</strong>
              <p style="color: #64748B; font-size: 0.875rem; margin: 0; line-height: 1.5;">${newNotif.message}</p>
            `;
            document.body.appendChild(toast);
            
            setTimeout(() => {
              toast.style.opacity = '0';
              toast.style.transform = 'translateY(10px)';
              setTimeout(() => toast.remove(), 400);
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
