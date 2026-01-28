import { PrismaClient } from '@prisma/client';
import Link from "next/link";
import DeckCardList from '@/components/DeckCardList';
import { notFound } from 'next/navigation';
import { resetDeckProgress } from '@/app/actions/cardActions';
import ResetDeckButton from '@/components/ResetDeckButton';
import ShareDeckButton from '@/components/ShareDeckButton';

const prisma = new PrismaClient();

async function getDeck(id: string) {
    const deck = await prisma.deck.findUnique({
        where: { id },
        include: {
            cards: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });
    return deck;
}

export default async function DeckPage({ params }: { params: Promise<{ deckId: string }> }) {
    const { deckId } = await params;
    const deck = await getDeck(deckId);

    if (!deck) {
        notFound();
    }

    // Stats (Simulated for now, can be computed later)
    const dueCards = 0;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/" className="text-gray-400 hover:text-blue-600 transition-colors">חפיסות</Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">PUBLIC</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                        {deck.title}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {deck.description || "אין תיאור לחפיסה זו."}
                    </p>
                </div>

                <div className="flex gap-3">
                    <Link
                        href={`/study/${deckId}`}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-transform active:scale-95 shadow-lg shadow-blue-500/30"
                    >
                        <span className="text-xl">▶</span> התחל ללמוד ({dueCards})
                    </Link>
                    <ResetDeckButton deckId={deckId} />
                    <ShareDeckButton deckTitle={deck.title} />
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main List - Client Component */}
                <DeckCardList deckId={deck.id} initialCards={(deck as any).cards} />

                {/* Sidebar Stats - Static for now */}
                <div className="space-y-6">
                    <div className="bg-indigo-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold opacity-80 mb-1">ציון אשף 🧙‍♂️</h3>
                            <div className="text-4xl font-black mb-4">Level 1</div>
                            <div className="w-full bg-indigo-800 rounded-full h-2 mb-2">
                                <div className="bg-indigo-400 h-2 rounded-full w-[10%]" />
                            </div>
                            <div className="text-xs opacity-60">התחל ללמוד כדי לעלות רמה</div>
                        </div>

                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500 opacity-20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
                    </div>

                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">נתונים</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">נוצרה בתאריך</span>
                                <span className="font-medium">
                                    {new Date(deck.createdAt).toLocaleDateString('he-IL')}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">מספר כרטיסים</span>
                                <span className="font-medium text-blue-600">{(deck as any).cards.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
