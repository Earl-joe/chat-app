import { useNotifications } from '../context/NotificationContext';
import { MessageIcon } from './Icons';

export default function ToastContainer() {
  const { toasts } = useNotifications();

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type} animate-slide-in`}>
          {t.type === 'message' && <MessageIcon size={18} className="toast-icon" />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
