import { useState, useRef, useEffect } from 'react';
import { Bell, CheckSquare } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleRead = (e, id) => {
    e.stopPropagation();
    markAsRead(id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors relative"
        onClick={() => setIsOpen(!isOpen)}
        style={{ color: 'var(--color-primary-dark)', backgroundColor: 'var(--color-bg-tertiary)', border: 'none', cursor: 'pointer' }}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-2px', right: '-2px',
            backgroundColor: 'var(--color-error)', color: 'white',
            borderRadius: '50%', width: '18px', height: '18px',
            fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          width: '320px', maxHeight: '400px', backgroundColor: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)', zIndex: 50, display: 'flex', flexDirection: 'column'
        }}>
           <div className="flex justify-between items-center" style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="text-sm font-semibold m-0">Notifications</h3>
              <span className="text-xs text-primary">{unreadCount} Unread</span>
           </div>
           
           <div style={{ overflowY: 'auto', flex: 1 }}>
             {notifications.length === 0 ? (
                <div className="p-6 text-center text-secondary text-sm">
                   <Bell size={24} className="mx-auto mb-2 opacity-50" />
                   You're all caught up!
                </div>
             ) : (
                notifications.map(n => (
                   <div key={n.id} style={{ 
                      padding: 'var(--space-3)', 
                      borderBottom: '1px solid var(--color-border)', 
                      backgroundColor: n.isRead ? 'transparent' : 'var(--color-bg-secondary)',
                      display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start'
                   }}>
                      <div style={{ flex: 1 }}>
                         <p className="text-sm font-semibold mb-1" style={{ color: n.isRead ? 'var(--color-text-primary)' : 'var(--color-primary-darker)'}}>{n.title}</p>
                         <p className="text-xs text-secondary">{n.message}</p>
                         <span className="text-xs text-secondary opacity-75 mt-1 block">
                            {new Date(n.createdAt).toLocaleDateString()}
                         </span>
                      </div>
                      {!n.isRead && (
                         <button 
                            title="Mark as read"
                            onClick={(e) => handleRead(e, n.id)} 
                            style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer', padding: '2px' }}
                         >
                            <CheckSquare size={16} />
                         </button>
                      )}
                   </div>
                ))
             )}
           </div>

           <div style={{ padding: 'var(--space-3)', textAlign: 'center', borderTop: '1px solid var(--color-border)', fontSize: '12px', cursor: 'pointer', color: 'var(--color-primary)' }}>
              View all notifications
           </div>
        </div>
      )}
    </div>
  );
}
