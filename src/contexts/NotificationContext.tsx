import React, { createContext, useContext, useState, useCallback } from 'react';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  type: 'ish' | 'request';
  route: string;
  createdAt: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: crypto.randomUUID(),
      title: 'Янги ish: Plitka yotqizish',
      description: 'Tower Block A — 2-qavat',
      type: 'ish',
      route: '/ishlar-doskasi',
      createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
      read: false,
    },
    {
      id: crypto.randomUUID(),
      title: 'Янги сўров: Cement Portland',
      description: '100 bags — Driveway Construction',
      type: 'request',
      route: '/requests',
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      read: false,
    },
    {
      id: crypto.randomUUID(),
      title: 'Янги ish: Elektr simlarini tortish',
      description: 'Phase 2 Wiring — 3-qavat',
      type: 'ish',
      route: '/ishlar-doskasi',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      read: true,
    },
    {
      id: crypto.randomUUID(),
      title: 'Янги сўров: Steel Rebar 12mm',
      description: '200 pieces — Tower Block A',
      type: 'request',
      route: '/requests',
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      read: false,
    },
    {
      id: crypto.randomUUID(),
      title: 'Янги ish: Devor surish',
      description: 'Site Preparation — 1-qavat',
      type: 'ish',
      route: '/ishlar-doskasi',
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: AppNotification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}
