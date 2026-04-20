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
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button 
        className="group relative flex items-center justify-center p-2.5 rounded-xl transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          backgroundColor: isOpen ? 'rgba(15, 118, 110, 0.1)' : 'transparent',
          border: '1px solid',
          borderColor: isOpen ? 'rgba(15, 118, 110, 0.2)' : 'transparent'
        }}
      >
        <Bell 
          size={22} 
          className={`transition-transform duration-500 ${isOpen ? 'rotate-12 scale-110' : 'group-hover:rotate-12'}`}
          style={{ color: '#0F172A' }} 
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-4 w-96 max-h-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4"
          style={{ zIndex: 100 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <div>
              <h3 className="font-outfit text-base font-bold text-slate-900">Notifications</h3>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                {unreadCount > 0 ? `You have ${unreadCount} unread` : 'No new notifications'}
              </p>
            </div>
            {unreadCount > 0 && (
              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-bold text-teal-700">
                LATEST
              </span>
            )}
          </div>

          {/* List */}
          <div className="custom-scrollbar overflow-y-auto" style={{ maxHeight: '380px' }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                  <Inbox size={32} className="text-slate-300" />
                </div>
                <h4 className="font-outfit text-sm font-semibold text-slate-900">All caught up!</h4>
                <p className="mt-1 text-xs text-slate-500">We'll let you know when something important happens.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`group relative flex gap-4 p-5 transition-colors hover:bg-slate-50 ${!n.isRead ? 'bg-teal-50/30' : ''}`}
                  >
                    {/* Status Indicator */}
                    {!n.isRead && (
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-teal-600" />
                    )}

                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-outfit text-sm font-bold leading-tight ${!n.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                          {n.title}
                        </p>
                        <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-slate-400">
                          <Clock size={10} />
                          {formatTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-500 line-clamp-2">
                        {n.message}
                      </p>
                      
                      {/* Action Row */}
                      <div className="mt-2 flex items-center justify-between">
                         <div className="flex gap-2">
                            {!n.isRead && (
                              <button 
                                onClick={(e) => handleRead(e, n.id)}
                                className="flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-[10px] font-bold text-teal-700 shadow-sm ring-1 ring-teal-600/10 hover:bg-teal-50 transition-colors"
                              >
                                <CheckSquare size={12} />
                                MARK READ
                              </button>
                            )}
                         </div>
                         {n.actionUrl && (
                            <a href={n.actionUrl} className="text-slate-400 hover:text-teal-600 transition-colors">
                              <ExternalLink size={12} />
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
          <div className="border-t border-slate-100 bg-slate-50/30 p-3 text-center">
            <button className="font-outfit text-xs font-bold tracking-wide text-teal-700 hover:text-teal-800 transition-colors">
              VIEW ALL ACTIVITY
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
