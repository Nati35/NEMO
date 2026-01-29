"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, BookOpen, Info, Trophy, Users } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, getDueCardCount, type NotificationDTO } from '@/app/actions/notificationActions';
import Link from 'next/link';

export function NotificationBell() {
    const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
    const [dueCards, setDueCards] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchData = async () => {
        const [notifs, dueCount] = await Promise.all([
            getNotifications(),
            getDueCardCount()
        ]);
        setNotifications(notifs);
        setDueCards(dueCount);

        // Calc unread: DB unread + 1 if due cards exist
        const dbUnread = notifs.filter(n => !n.isRead).length;
        setUnreadCount(dbUnread + (dueCount > 0 ? 1 : 0));
    };

    useEffect(() => {
        fetchData();
        // Poll every 60s
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const handleMarkRead = async (id: string) => {
        await markAsRead(id);
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(dueCards > 0 ? 1 : 0); // Due cards always count as 'active' logic
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-400 hover:text-slate-600 relative transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 transform -translate-x-1/2 md:-translate-x-2/3">
                    <div className="p-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-sm text-slate-700">התראות</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-[10px] text-blue-600 font-medium hover:underline">
                                סמן הכל כנקרא
                            </button>
                        )}
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                        {dueCards > 0 && (
                            <div className="p-4 border-b border-slate-50 bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer group">
                                <Link href="/" onClick={() => setIsOpen(false)}>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                            <BookOpen size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">זמן ללמוד!</p>
                                            <p className="text-xs text-slate-500 mt-0.5">יש לך {dueCards} כרטיסים שצריכים חזרה היום.</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )}

                        {notifications.length === 0 && dueCards === 0 && (
                            <div className="p-8 text-center text-slate-400">
                                <Bell size={24} className="mx-auto mb-2 opacity-20" />
                                <p className="text-xs">אין התראות חדשות</p>
                            </div>
                        )}

                        {notifications.map(notif => (
                            <div
                                key={notif.id}
                                className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors relative group ${notif.isRead ? 'opacity-60' : 'bg-white'}`}
                            >
                                <div className="flex gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                                        ${notif.type === 'SYSTEM_ALERT' ? 'bg-red-100 text-red-600' :
                                            notif.type === 'ACHIEVEMENT' ? 'bg-yellow-100 text-yellow-600' :
                                                'bg-slate-100 text-slate-600'}`}
                                    >
                                        {notif.type === 'SYSTEM_ALERT' ? <Info size={14} /> :
                                            notif.type === 'ACHIEVEMENT' ? <Trophy size={14} /> :
                                                <Users size={14} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-800">{notif.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                                    </div>
                                    {!notif.isRead && (
                                        <button
                                            onClick={() => handleMarkRead(notif.id)}
                                            className="absolute top-4 left-4 text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"
                                            title="סמן כנקרא"
                                        >
                                            <Check size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
