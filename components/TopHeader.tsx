"use client";

import { Search, Bell } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { LevelBadge } from './LevelBadge';

export default function TopHeader({ userXp = 0 }: { userXp?: number }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = useCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }

        // Simple debounce using timeout
        const timeoutId = setTimeout(() => {
            replace(`${pathname}?${params.toString()}`);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchParams, pathname, replace]);

    return (
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
            {/* Search Bar Removed as per request */}
            <div className="flex-1"></div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-400 hover:text-slate-600 relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
                <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="text-left text-right">
                        <div className="flex items-center gap-2 justify-end">
                            <p className="text-xs font-bold text-slate-900">ד"ר יובל כהן</p>
                            <LevelBadge xp={userXp || 350} />
                        </div>
                        <p className="text-[10px] text-slate-400">סטודנט לרפואה, שנה ד'</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden border-2 border-transparent group-hover:border-blue-600 transition-colors">
                        {/* Using a reliable placeholder avatar */}
                        <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-teal-400" />
                    </div>
                </div>
            </div>
        </header>
    );
}
