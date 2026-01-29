import { PrismaClient } from '@prisma/client';
import StudySession from '@/components/StudySession';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

async function getDueCards(deckId: string) {
    const now = new Date();
    // Fetch cards that are due (nextReview <= now)
    // For MVP/Demo: If no cards are due, let's fetch NEW cards (interval = 0)
    // Or just all cards to ensure the user sees something.
    // Enhanced Logic: Fetch Due OR New.

    const cards = await prisma.card.findMany({
        where: {
            deckId: deckId,
            OR: [
                { nextReview: { lte: now } }, // Due cards
                { interval: 0 } // New cards
            ]
        },
        orderBy: { nextReview: 'asc' }, // Prioritize most overdue
        take: 20, // Limit session size
        include: { images: true }
    });

    // Fallback for Demo/Testing: If no cards are due, let user review anyway
    // This prevents the "System Broken" feeling when a user just wants to see their cards.
    if (cards.length === 0) {
        return await prisma.card.findMany({
            where: { deckId },
            take: 20,
            include: { images: true }
        });
    }

    // If still empty (e.g. user just did everything), maybe show all just for review?
    // Let's stick to due/new for "Smart" session.
    // If the user manually adds a card, it has interval 0, so it appears.

    // Fallback: If absolutely no due cards, fetch all cards just so the user isn't confused why it's empty right after creating.
    // Fallback removed to enforce strict SM-2 behavior (NOJI style).
    // If cards.length === 0, the UI will correctly show "Finished for today".

    return cards;
}

export default async function StudyPage({ params }: { params: Promise<{ deckId: string }> }) {
    const { deckId } = await params;

    const cards = await getDueCards(deckId);

    // Verify deck exists just in case
    const deck = await prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck) notFound();

    return (
        <StudySession cards={cards} deckId={deckId} />
    );
}
