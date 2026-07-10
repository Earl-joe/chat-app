import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const notifyMessage = useCallback((senderName, text) => {
    const preview = text || 'Sent a photo';
    addToast(`${senderName}: ${preview}`, 'message');

    if (Notification.permission === 'granted') {
      new Notification(`${senderName}`, { body: preview, icon: '/favicon.ico' });
    }
  }, [addToast]);

  const requestPermission = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ toasts, addToast, notifyMessage, requestPermission }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
