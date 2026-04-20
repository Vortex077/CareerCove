import { useState, useRef, useEffect } from 'react';
import { Bell, CheckSquare, Inbox, ExternalLink, Clock } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <button 
        className="notification-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '10px', borderRadius: '12px', transition: 'all 0.3s ease',
          backgroundColor: isOpen ? '#f1f5f9' : 'transparent',
          border: isOpen ? '1px solid #e2e8f0' : '1px solid transparent',
          cursor: 'pointer', outline: 'none', position: 'relative'
        }}
      >
        <Bell 
          size={22} 
          style={{ 
            color: '#1e293b', 
            transform: isOpen ? 'rotate(12deg) scale(1.1)' : 'none',
            transition: 'transform 0.3s ease'
          }} 
        />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '4px', right: '4px',
            backgroundColor: '#0d9488', color: 'white',
            borderRadius: '50%', width: '18px', height: '18px',
            fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '900', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="notification-menu"
          style={{ 
            position: 'absolute', top: 'calc(100% + 12px)', right: '0',
            width: '380px', maxHeight: '500px', overflow: 'hidden',
            borderRadius: '20px', border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff', // Explicit Opaque White
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000, display: 'flex', flexDirection: 'column',
            animation: 'slideDown 0.3s ease-out'
          }}
        >
          {/* Header */}
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
            backgroundColor: '#f8fafc'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>Notifications</h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                {unreadCount > 0 ? `${unreadCount} Unread Alerts` : 'No New Updates'}
              </p>
            </div>
            {unreadCount > 0 && (
              <span style={{ 
                backgroundColor: '#f0fdfa', color: '#0f766e', 
                fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px'
              }}>LATEST</span>
            )}
          </div>

          {/* List Content */}
          <div style={{ overflowY: 'auto', flex: 1, backgroundColor: '#ffffff' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                <div style={{ 
                  width: '64px', height: '64px', backgroundColor: '#f8fafc',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Inbox size={32} style={{ color: '#cbd5e1' }} />
                </div>
                <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>All clear!</h4>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>Check back later for updates.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    style={{ 
                      padding: '16px 20px', display: 'flex', gap: '16px',
                      borderBottom: '1px solid #f1f5f9', position: 'relative',
                      backgroundColor: n.isRead ? 'transparent' : '#f0fdfa44',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {!n.isRead && (
                      <div style={{ 
                        position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                        height: '70%', width: '4px', backgroundColor: '#0d9488', borderRadius: '0 4px 4px 0'
                      }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <p style={{ 
                          margin: 0, fontSize: '14px', lineHeight: '1.2',
                          fontWeight: n.isRead ? '600' : '800', 
                          color: n.isRead ? '#475569' : '#0f172a' 
                        }}>{n.title}</p>
                        <span style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                          <Clock size={10} /> {formatTime(n.createdAt)}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>{n.message}</p>
                      
                      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {!n.isRead && (
                          <button 
                            onClick={(e) => handleRead(e, n.id)}
                            style={{ 
                              display: 'flex', alignItems: 'center', gap: '6px',
                              backgroundColor: '#ffffff', border: '1px solid #0d9488',
                              color: '#0d9488', fontSize: '10px', fontWeight: '800',
                              padding: '4px 10px', borderRadius: '6px', cursor: 'pointer'
                            }}
                          >
                            <CheckSquare size={12} /> MARK READ
                          </button>
                        )}
                        {n.actionUrl && (
                          <a href={n.actionUrl} style={{ color: '#94a3b8' }}>
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ 
            padding: '12px', textAlign: 'center', borderTop: '1px solid #f1f5f9',
            backgroundColor: '#f8fafc'
          }}>
            <button style={{ 
              background: 'none', border: 'none', 
              fontSize: '11px', fontWeight: '800', color: '#0d9488',
              letterSpacing: '0.05em', cursor: 'pointer'
            }}>VIEW ALL ACTIVITY</button>
          </div>
        </div>
      )}
    </div>
  );
}
