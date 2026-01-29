"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Library, BarChart3, Users2, Settings, Menu } from 'lucide-react';

export default function MobileNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(path));

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 block md:hidden z-50 px-4 pb-safe pt-2 h-16 safe-area-bottom">
            <nav className="flex justify-around items-center h-full pb-2">
                <MobileNavItem
                    href="/"
                    icon={<LayoutDashboard size={24} />}
                    label="בית"
                    active={pathname === '/'}
                />
                <MobileNavItem
                    href="/library"
                    icon={<Library size={24} />}
                    label="ספרייה"
                    active={isActive('/library')}
                />
                <MobileNavItem
                    href="/community"
                    icon={<Users2 size={24} />}
                    label="קהילה"
                    active={isActive('/community')}
                />
                <MobileNavItem
                    href="/stats"
                    icon={<BarChart3 size={24} />}
                    label="אנליטיקה"
                    active={isActive('/stats')}
                />
                <MobileNavItem
                    href="/settings"
                    icon={<Settings size={24} />}
                    label="הגדרות"
                    active={isActive('/settings')}
                />
            </nav>
        </div>
    );
}

function MobileNavItem({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active: boolean }) {
    return (
        <Link
            href={href}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
        >
            <div className={`p-1 rounded-xl ${active ? 'bg-blue-50' : ''}`}>
                {icon}
            </div>
            <span className="text-[10px] font-medium mt-0.5">{label}</span>
        </Link>
    );
}
