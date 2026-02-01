'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function cloneDeck(deckId: string) {
    // 1. Validate Session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        console.error("No active session found during cloneDeck");
        // In server actions, sometimes redirecting to login is better, or throwing error
        throw new Error("Must be logged in to import a deck");
    }

    const userId = session.user.id;

    // 2. Fetch original deck with cards
    const originalDeck = await prisma.deck.findUnique({
        where: { id: deckId },
        include: { cards: { include: { images: true } } }
    });

    if (!originalDeck) throw new Error("Deck not found");

    // 3. Create Copy for the CURRENT user
    const newDeck = await prisma.deck.create({
        data: {
            title: `${originalDeck.title} (הועתק)`,
            description: originalDeck.description,
            category: originalDeck.category,
            userId: userId, // Correctly linked to logged-in user!
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

    // 4. Update stats
    /*
    await prisma.deck.update({
        where: { id: deckId },
        data: { downloads: { increment: 1 } }
    });
    */

    revalidatePath('/library');
    redirect('/library');
}
