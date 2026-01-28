'use client';

import { Search, Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

interface LibraryControlsProps {
    categories: string[];
}

export default function LibraryControls({ categories }: LibraryControlsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const currentQuery = searchParams.get('q') || '';
    const currentCategory = searchParams.get('cat') || 'all';

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        startTransition(() => {
            router.replace(`/library?${params.toString()}`);
        });
    };

    const handleCategoryChange = (category: string) => {
        const params = new URLSearchParams(searchParams);
        if (category && category !== 'all') {
            params.set('cat', category);
        } else {
            params.delete('cat');
        }
        startTransition(() => {
            router.replace(`/library?${params.toString()}`);
        });
    };

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 w-full relative group">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                    defaultValue={currentQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="חפש חפיסה..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-12 pl-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
            </div>

            {/* Filter */}
            <div className="relative min-w-[200px]">
                <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                <select
                    value={currentCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl py-3 pr-12 pl-4 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-gray-700 font-medium"
                >
                    <option value="all">כל הקטגוריות</option>
                    {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
