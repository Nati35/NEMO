'use client';

import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { createDeck } from '@/app/actions';

export default function NewDeckDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            >
                <Plus size={20} /> חפיסה חדשה
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 left-6 text-slate-400 hover:text-slate-900 p-2 bg-slate-50 rounded-full"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-2xl font-black text-slate-900 mb-2">חפיסה חדשה</h3>
                        <p className="text-sm text-slate-500 mb-8">צור חפיסה חדשה כדי לארגן את הכרטיסיות שלך.</p>

                        <form
                            action={async (formData) => {
                                setIsLoading(true);
                                await createDeck(formData);
                                setIsOpen(false);
                                setIsLoading(false);
                            }}
                            className="space-y-6"
                        >
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">שם החפיסה</label>
                                <input
                                    name="title"
                                    type="text"
                                    required
                                    placeholder="למשל: אוצר מילים באנגלית"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">קטגוריה</label>
                                <input
                                    name="category"
                                    type="text"
                                    placeholder="למשל: אנטומיה, היסטוריה"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">תיאור (אופציונלי)</label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    placeholder="מה לומדים בחפיסה הזו?"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <input
                                    type="checkbox"
                                    name="isPublic"
                                    id="isPublic"
                                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="isPublic" className="flex flex-col cursor-pointer">
                                    <span className="font-bold text-slate-900 text-sm">שתף עם הקהילה</span>
                                    <span className="text-xs text-slate-400">חפיסה ציבורית תהיה זמינה להורדה לכולם.</span>
                                </label>
                            </div>

                            <button
                                disabled={isLoading}
                                type="submit"
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        יוצר חפיסה...
                                    </>
                                ) : (
                                    'צור חפיסה'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
