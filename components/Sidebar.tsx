"use client";

import {
    LayoutDashboard,
    Library,
    BarChart3,
    Users2,
    Settings,
    Fish,
    Zap,
    BookOpen,
    Lock,
    PenTool
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

    return (
        <aside className="w-64 bg-white border-l border-slate-200 flex flex-col hidden md:flex h-screen sticky top-0">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <Fish size={22} />
                    </div>
                    <span className="font-black text-2xl tracking-tight text-slate-900 uppercase">Nemo</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium pr-1">שלא יהיה לכם זיכרון של דג</p>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4">
                <NavItem
                    href="/"
                    icon={<LayoutDashboard size={20} />}
                    label="דאשבורד"
                    active={pathname === '/'}
                />
                <NavItem
                    href="/library"
                    icon={<Library size={20} />}
                    label="הספרייה שלי"
                    active={isActive('/library') || isActive('/decks') || isActive('/study')}
                />
                <NavItem
                    href="/stats"
                    icon={<BarChart3 size={20} />}
                    label="אנליטיקה"
                    active={isActive('/stats')}
                />
                <NavItem
                    href="/community"
                    icon={<Users2 size={20} />}
                    label="קהילה"
                    active={isActive('/community')}
                />

                {/* Locked Feature: Exam Analyst */}
                <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-400/60 cursor-not-allowed group relative">
                    <span><PenTool size={20} /></span>
                    <span className="text-sm">תחקור מבחנים</span>
                    <Lock size={14} className="mr-auto opacity-50" />

                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 w-max px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        בקרוב (למנהלים בלבד)
                    </div>
                </div>
            </nav>

            <div className="p-4 border-t border-slate-100">
                <NavItem href="/guides" icon={<BookOpen size={20} />} label="מרכז הדרכה" active={isActive('/guides')} />
                <NavItem href="/settings" icon={<Settings size={20} />} label="הגדרות" active={isActive('/settings')} />
                <div className="mt-6 p-4 bg-slate-900 rounded-2xl text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-xs text-slate-400 mb-1">תכנית נוכחית</p>
                        <p className="font-bold text-sm mb-3 text-blue-400">NEMO PRO+</p>
                        <button className="w-full py-2 bg-blue-600 rounded-lg text-xs font-bold hover:bg-blue-500 transition-colors">
                            שדרג חבילה
                        </button>
                    </div>
                    <Zap className="absolute -bottom-2 -left-2 text-white/5 group-hover:text-white/10 transition-colors" size={80} />
                </div>
            </div>
        </aside>
    );
}

const NavItem = ({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) => (
    <Link
        href={href}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
            ? 'bg-blue-50 text-blue-600 font-bold shadow-sm shadow-blue-100'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
    >
        <span className={`${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
            {icon}
        </span>
        <span className="text-sm">{label}</span>
        {active && <div className="mr-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>}
    </Link>
);
