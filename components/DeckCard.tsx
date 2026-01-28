"use client";

import { MoreVertical } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateDeck, deleteDeck } from "@/app/actions/deckActions";
import { resetDeckProgress } from "@/app/actions/cardActions";

interface DeckProps {
    deck: {
        id: string;
        title: string;
        description: string | null;
        category: string; // Added field
        _count: {
            cards: number;
        };
        stats?: {
            due: number;
            doneToday: number;
            total: number;
            upcoming: number; // Added field
        };
    };
}

export default function DeckCard({ deck }: DeckProps) {
    // Computed Progress (Simplistic: cards done / total)
    // Real "Strength" requires aggregating efactor/interval. For now, let's show "Due" status prominently.

    const dueCount = deck.stats?.due || 0;
    const upcomingCount = deck.stats?.upcoming || 0;
    const doneToday = deck.stats?.doneToday || 0;
    const totalCards = deck.stats?.total || deck._count.cards;

    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(deck.title);
    const [editDesc, setEditDesc] = useState(deck.description || '');
    const [editCategory, setEditCategory] = useState(deck.category || 'כללי'); // Added state

    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSave = async () => {
        await updateDeck(deck.id, editTitle, editDesc, editCategory); // Updated call
        setIsEditing(false);
        router.refresh();
    };

    const handleDelete = async () => {
        if (confirm("אתה בטוח שאתה רוצה למחוק את החפיסה? הפעולה לא הפיכה.")) {
            await deleteDeck(deck.id);
            router.refresh();
        }
    };

    const handleReset = async () => {
        if (confirm("זה יאפס את כל התקדמות הלמידה בחפיסה זו. להמשיך?")) {
            await resetDeckProgress(deck.id);
            router.refresh(); // Force update
        }
        setShowMenu(false);
    };

    if (isEditing) {
        return (
            <div className="bg-white border border-blue-200 rounded-[2rem] p-6 shadow-xl h-full flex flex-col justify-between relative">
                <div className="space-y-4">
                    <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-lg font-black border-b-2 border-blue-100 focus:border-blue-500 outline-none pb-1"
                        autoFocus
                        placeholder="שם החפיסה"
                    />
                    <input
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full text-xs font-bold text-slate-500 bg-slate-50 rounded-full px-3 py-1 outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="קטגוריה (לדוגמה: אנטומיה)"
                    />
                    <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full text-sm text-slate-500 border border-slate-100 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-100 resize-none h-20"
                        placeholder="תיאור החפיסה..."
                    />
                </div>
                <div className="flex gap-2 mt-4">
                    <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold text-sm">שמור</button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-xl font-bold text-sm">ביטול</button>
                </div>
            </div>
        )
    }

    return (
        <Link href={`/decks/${deck.id}`} className="block group relative">
            <div className="bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col justify-between relative overflow-visible">
                {/* Status Indicator Stripe */}
                <div className={`absolute top-0 right-0 w-2 h-[80%] top-[10%] rounded-l-full ${dueCount > 0 ? 'bg-orange-500' : 'bg-emerald-500'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

                <div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-2">
                            {/* Subject / Tag Placeholder */}
                            <div className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold">
                                {deck.category || 'כללי'}
                            </div>

                            {/* Done Today Badge */}
                            {doneToday > 0 && (
                                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold flex items-center gap-1">
                                    ✓ {doneToday} היום
                                </div>
                            )}
                        </div>

                        <div className="relative" ref={menuRef}>
                            <button
                                className="text-slate-300 hover:text-slate-900 p-1 rounded-full hover:bg-slate-100 transition-all"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                            >
                                <MoreVertical size={18} />
                            </button>

                            {/* Dropdown Menu */}
                            {showMenu && (
                                <div className="absolute top-8 left-0 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={(e) => { e.preventDefault(); setIsEditing(true); setShowMenu(false); }}
                                        className="w-full px-4 py-3 hover:bg-slate-50 text-slate-700 text-sm font-bold flex items-center gap-2"
                                    >
                                        ✏️ ערוך פרטים
                                    </button>
                                    <button
                                        onClick={(e) => { e.preventDefault(); handleReset(); }}
                                        className="w-full px-4 py-3 hover:bg-slate-50 text-slate-700 text-sm font-bold flex items-center gap-2"
                                    >
                                        🔄 אפס התקדמות
                                    </button>
                                    <div className="h-[1px] bg-slate-100 my-1"></div>
                                    <button
                                        onClick={(e) => { e.preventDefault(); handleDelete(); }}
                                        className="w-full px-4 py-3 hover:bg-rose-50 text-rose-600 text-sm font-bold flex items-center gap-2"
                                    >
                                        🗑️ מחק חפיסה
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <h4 className="text-lg font-black mb-1 group-hover:text-blue-600 transition-colors">
                        {deck.title}
                    </h4>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-1 h-5">
                        {deck.description}
                    </p>

                    <div className="flex items-center gap-2 mb-6">
                        <p className="text-xs text-slate-400">
                            {totalCards} כרטיסיות
                        </p>

                        {dueCount > 0 && (
                            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                                {dueCount} ללמוד
                            </span>
                        )}

                        {upcomingCount > 0 && (
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                ⏳ {upcomingCount} בקרוב
                            </span>
                        )}

                        {dueCount === 0 && upcomingCount === 0 && (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                הכל הושלם!
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="flex justify-between items-end text-xs font-bold">
                        <span className="text-slate-400 uppercase tracking-tighter">
                            סטטוס למידה
                        </span>
                        <span className="text-slate-900">
                            {dueCount === 0 ? '100%' : 'פעיל'}
                        </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${dueCount > 0 ? 'bg-orange-500 w-[20%]' : 'bg-emerald-500 w-[100%]'}`}
                        ></div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
