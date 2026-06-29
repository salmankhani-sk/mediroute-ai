'use client';

import { useState, useEffect, useRef } from 'react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '@/app/actions/notifications';
import { FaBell, FaCalendarDays, FaClock, FaTriangleExclamation, FaCircleInfo } from 'react-icons/fa6';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUnread();
    const i = setInterval(loadUnread, 30000); // poll every 30s
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function loadUnread() { const c = await getUnreadCount(); setUnread(c); }
  async function loadNotifs() { const n = await getNotifications(); setNotifs(n); setOpen(!open); }
  async function handleRead(id: string) { await markAsRead(id); loadUnread(); loadNotifs(); }
  async function handleReadAll() { await markAllAsRead(); loadUnread(); setNotifs(prev => prev.map(n => ({ ...n, isRead: true }))); }

  const typeIcons: Record<string, React.ReactNode> = { APPOINTMENT: <FaCalendarDays className="text-blue-500" />, REMINDER: <FaClock className="text-orange-500" />, ALERT: <FaTriangleExclamation className="text-red-500" />, INFO: <FaCircleInfo className="text-gray-500" /> };

  return (
    <div ref={ref} className="relative">
      <button onClick={loadNotifs} className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
        <FaBell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            {unread > 0 && <button onClick={handleReadAll} className="text-xs text-primary-600 hover:underline">Mark all read</button>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">No notifications yet.</div>
            ) : (
              notifs.map(n => (
                <button key={n.id} onClick={() => handleRead(n.id)}
                  className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
                  <div className="flex gap-2">
                    <span className="text-lg">{typeIcons[n.type] || <FaCircleInfo className="text-gray-500" />}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"/>}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
