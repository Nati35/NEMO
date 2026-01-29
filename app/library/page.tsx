import { PrismaClient } from '@prisma/client';
import DeckCard from '@/components/DeckCard';
import LibrarySearch from '@/components/LibrarySearch';
import { Plus } from 'lucide-react';
import Link from 'next/link';

const prisma = new PrismaClient();

interface PageProps {
    searchParams: {
        q?: string;
        category?: string;
    }
}

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function LibraryPage({ searchParams }: PageProps) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) return <div>User not found</div>;

    const query = searchParams.q || '';
    const category = searchParams.category;

    const decks = await prisma.deck.findMany({
        where: {
            userId: user.id,
            title: {
                contains: query
            },
            ...(category && { category })
        },
        include: {
            _count: {
                select: { cards: true }
            },
            // Needed to calculate stats for DeckCard
            // In a real app we'd join with study sessions, but for now DeckCard might need stats passed differently or calculated here.
            // Actually DeckCard takes `deck` which includes `stats` (optional).
            // Let's see if we can attach basic counts.
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // We need to fetch study data to populate the "Due/Done" numbers for each deck
    // Or we can just show card counts for now to keep it fast.
    // The Dashboard does a heavy query. Let's start simple.

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-black text-slate-900 mb-4">הספרייה שלי 📚</h1>
                <p className="text-slate-500 text-lg mb-8">כל החפיסות, המילים והידע שלך במקום אחד.</p>

                <LibrarySearch />
            </header>

            {decks.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">לא נמצאו חפיסות</h3>
                    <p className="text-slate-500 mb-6">נסה לשנות את הסינון או צור חפיסה חדשה.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Create New Card (Always first) */}
                    {/* We can rely on the FAB or Header button, but having it in grid is nice too */}

                    {decks.map((deck) => (
                        <div key={deck.id} className="relative group">
                            <DeckCard
                                deck={{
                                    ...deck,
                                    category: (deck as any).category || "כללי",
                                    stats: { due: 0, doneToday: 0, total: deck._count.cards, upcoming: 0 } // Placeholder stats for Library view
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
