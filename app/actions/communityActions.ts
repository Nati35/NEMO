'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export async function cloneDeck(deckId: string) {
    // 1. Fetch original deck with cards
    const originalDeck = await prisma.deck.findUnique({
        where: { id: deckId },
        include: { cards: { include: { images: true } } }
    });

    if (!originalDeck) throw new Error("Deck not found");

    // 2. Identify current user (Mock)
    const currentUser = await prisma.user.findFirst();
    if (!currentUser) throw new Error("No user found");

    // 3. Create Copy
    const newDeck = await prisma.deck.create({
        data: {
            title: `${originalDeck.title} (הועתק)`,
            description: originalDeck.description,
            category: originalDeck.category,
            userId: currentUser.id,
            cards: {
                create: originalDeck.cards.map(card => ({
                    front: card.front,
                    back: card.back,
                    imageUrl: card.imageUrl,
                    images: {
                        create: card.images.map(img => ({ url: img.url }))
                    }
                }))
            }
        }
    });

    // 4. Update stats (Skipped due to schema sync issues)
    /*
    await prisma.deck.update({
        where: { id: deckId },
        data: { downloads: { increment: 1 } }
    });
    */

    revalidatePath('/library');
    redirect('/library');
}
