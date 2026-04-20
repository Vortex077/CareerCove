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

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch (err) {
      if (!silent) console.error('Failed fetching notifications', err);
    }
  }, [user]);

  const showPremiumToast = useCallback((notif) => {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; 
      background: white; border-left: 5px solid #0d9488;
      padding: 18px 24px; border-radius: 16px; 
      z-index: 10000; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); 
      font-family: 'Outfit', sans-serif; min-width: 320px; max-width: 420px;
      display: flex; flex-direction: column; gap: 4px;
      line-height: 1.4;
      animation: slideInX 0.4s ease-out;
      transition: all 0.4s ease;
    `;
    toast.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2px;">
        <span style="font-size: 10px; font-weight: 800; color: #0d9488; text-transform: uppercase; letter-spacing: 0.1em;">Notification</span>
        <span style="font-size: 10px; color: #94a3b8;">Just now</span>
      </div>
      <strong style="color: #0f172a; font-size: 16px; font-weight: 800; margin-bottom: 2px;">${notif.title}</strong>
      <p style="color: #475569; font-size: 13px; margin: 0; font-weight: 500;">${notif.message}</p>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(16px)';
      setTimeout(() => toast.remove(), 400);
    }, 6500);
  }, []);

  useEffect(() => {
    if (!user) return;

    // 1. Initial Fetch
    fetchNotifications();

    // 2. Real-time Subscription
    const channelId = `user-notifs-${user.id}-${Math.floor(Date.now() / 1000)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications', 
          filter: `user_id=eq.${user.id}` 
        },
        (payload) => {
          const raw = payload.new;
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
          showPremiumToast(newNotif);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Real-time notifications connected');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.warn('Real-time connection lost, falling back to polling');
        }
      });

    // 3. Fail-safe Polling (every 45 seconds)
    const pollInterval = setInterval(() => fetchNotifications(true), 45000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [user, fetchNotifications, showPremiumToast]);

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
