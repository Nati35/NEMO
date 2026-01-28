'use client';

import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';

// Simple debounce hook implementation to avoid external dependency
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export default function LibrarySearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [text, setText] = useState(searchParams.get('q') || '');
    const query = useDebounce(text, 500);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const currentQuery = params.get('q') || '';

        if (query === currentQuery) return;

        if (query) {
            params.set('q', query);
        } else {
            params.delete('q');
        }

        startTransition(() => {
            router.replace(`/library?${params.toString()}`);
        });
    }, [query, router]);

    const CATEGORIES = ["כללי", "שפות", "מדעים", "היסטוריה", "תכנות", "אחר"];
    const currentCategory = searchParams.get('category');

    const handleCategoryClick = (cat: string) => {
        const params = new URLSearchParams(searchParams);
        if (currentCategory === cat) {
            params.delete('category');
        } else {
            params.set('category', cat);
        }
        router.replace(`/library?${params.toString()}`);
    };

    return (
        <div className="space-y-6">
            {/* Search Input */}
            <div className="relative max-w-2xl mx-auto">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="חפש חפיסות באוסף שלך..."
                    className="w-full pl-4 pr-12 py-4 rounded-2xl border border-slate-200 shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-lg"
                />
                {text && (
                    <button
                        onClick={() => setText('')}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Categories Pills */}
            <div className="flex flex-wrap justify-center gap-2">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-colors border
                            ${currentCategory === cat
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }
                        `}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
}
