import { Bell } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

export default function NotificationsPage() {
  const { notifications, markAsRead } = useNotification();

  return (
    <div className="container mt-6 mb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-primary mb-1 flex items-center gap-2"><Bell size={24}/> Activity Log</h1>
          <p className="text-secondary text-sm">All historical system alerts and application updates.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-secondary">
             <Bell size={48} className="mx-auto mb-4 opacity-50" />
             <p>No notifications generated yet.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map(n => (
               <div key={n.id} className="flex justify-between p-4" style={{ 
                  borderBottom: '1px solid var(--color-border)',
                  backgroundColor: n.isRead ? 'transparent' : 'var(--color-bg-secondary)'
               }}>
                  <div>
                    <h3 className="text-md mb-1 font-semibold" style={{ color: n.isRead ? 'inherit' : 'var(--color-primary-dark)'}}>{n.title}</h3>
                    <p className="text-sm text-secondary mb-1">{n.message}</p>
                    <span className="text-xs text-secondary opacity-75">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  {!n.isRead && (
                    <div>
                      <button className="btn btn-sm btn-outline text-xs" onClick={() => markAsRead(n.id)}>
                        Mark Read
                      </button>
                    </div>
                  )}
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
