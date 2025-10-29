// src/hooks/useTaskNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import useAuthStore from '../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../types';

export function useTaskNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async (isInitialFetch = false) => {
    if (!token) {
        setNotifications([]);
        setUnreadCount(0);
        return;
    }
    try {
      const res = await fetch('/api/tasks/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data: Notification[] = await res.json();
        setNotifications(data);
        // ------------------------------------------
        if (isInitialFetch || data.length !== unreadCount) {
             setUnreadCount(data.length);
        }
      } else {
         setNotifications([]);
         setUnreadCount(0);
         console.error('Failed to fetch notifications:', res.statusText);
      }
    } catch (error) {
      setNotifications([]);
      setUnreadCount(0);
      console.error('Failed to fetch notifications:', error);
    }
  }, [token, unreadCount]);

  useEffect(() => {
    fetchNotifications(true);
    const interval = setInterval(() => fetchNotifications(false), 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    const currentNotifications = [...notifications];
    const currentCount = unreadCount;

    setNotifications(prev => prev.filter(n => !(n._id === notification._id && n.type === notification.type))); // Lọc chính xác hơn
    setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));

    let apiUrl = '';
    const taskId = notification._id;

    switch(notification.type) {
      case 'newTask': apiUrl = `/api/tasks/${taskId}/mark-read`; break;
      case 'taskCompleted': apiUrl = `/api/tasks/${taskId}/mark-completion-notified`; break;
      case 'deadlineUpcoming': apiUrl = `/api/tasks/${taskId}/mark-deadline-reminder-sent`; break;
      default:
        console.error('Unknown notification type:', notification);
        navigate('/dashboard/tasks');
        return;
    }

    try {
      const res = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        console.error(`Failed to mark notification ${taskId} (${notification.type})`);
        setNotifications(currentNotifications);
        setUnreadCount(currentCount);
      }
      navigate('/dashboard/tasks', { replace: true });
    } catch (error) {
      console.error(`Failed to handle notification ${taskId}:`, error);
      setNotifications(currentNotifications);
      setUnreadCount(currentCount);
      navigate('/dashboard/tasks', { replace: true });
    }
  };

  return { notifications, unreadCount, handleNotificationClick, refresh: fetchNotifications };
}