import { PrismaClient } from '@prisma/client';
import { Download, Globe, Heart, Search } from 'lucide-react';
import Link from 'next/link';
import { cloneDeck } from '@/app/actions/communityActions'; // We need to create this

const prisma = new PrismaClient();

async function getCommunityDecks() {
    // In a real app, this would filter by isPublic: true
    // For local dev, let's just show all decks except the current user's? 
    // Or just show ALL decks for demo purposes even if they are mine.
    // Let's filter `isPublic: true`.

    // NOTE: Since we probably have 0 public decks, I'll fetch ALL for now
    // and pretend they are community decks, OR I'll rely on the user manually setting one to public.
    // Let's just fetch everything to populate the UI.
    const decks = await prisma.deck.findMany({
        where: { isPublic: true },
        orderBy: { updatedAt: 'desc' },
        include: {
            user: { select: { name: true, image: true } },
            _count: { select: { cards: true } }
        },
        take: 12
    });

    return decks;
}

export default async function CommunityPage() {
    const decks = await getCommunityDecks();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">קהילה והשראה 🌍</h1>
                <p className="text-gray-500 text-lg">גלה חפיסות שנוצרו על ידי סטודנטים אחרים, הורד אותן והתחיל ללמוד מיד.</p>

                <div className="mt-8 relative max-w-md mx-auto">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        placeholder="חפש נושאים (למשל: אנטומיה)..."
                        className="w-full bg-white border border-gray-200 rounded-full py-4 pr-12 pl-6 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                    />
                </div>
            </div>

            {/* Featured Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {decks.map(deck => (
                    <CommunityDeckCard key={deck.id} deck={deck} />
                ))}
            </div>

            {decks.length === 0 && (
                <div className="text-center py-20 opacity-50">
                    <Globe size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>עדיין אין חפיסות בקהילה. היה הראשון לשתף!</p>
                </div>
            )}
        </div>
    );
}

function CommunityDeckCard({ deck }: any) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col gap-4 group">
            <div className="flex justify-between items-start">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl group-hover:bg-blue-100 transition-colors">
                    <Globe size={24} />
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Download size={14} />
                    <span>{(deck as any).downloads || 0}</span>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">{deck.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">{deck.description || "אין תיאור לחפיסה זו."}</p>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400"></div>
                    <span className="text-xs font-medium text-gray-600">{deck.user?.name || "משתמש אנונימי"}</span>
                </div>
                <div className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-md">
                    {deck._count.cards} כרטיסים
                </div>
            </div>

            <form action={async () => {
                'use server';
                await cloneDeck(deck.id);
            }}>
                <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold mt-2 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                    <Download size={18} />
                    הוסף לספרייה שלי
                </button>
            </form>
        </div>
    )
}
