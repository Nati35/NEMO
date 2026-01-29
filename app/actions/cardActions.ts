'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient()

// Input Schemas
const UpdateCardSchema = z.object({
    front: z.string().min(1, "Front is required").optional(),
    back: z.string().min(1, "Back is required").optional(),
    imageUrls: z.array(z.string().url()).optional(),
    audioUrl: z.string().url().optional().or(z.literal("")),
    isSuspended: z.boolean().optional()
});

// Helper: Verify User Ownership
async function verifyCardOwnership(cardId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        throw new Error('Unauthorized: Please log in.');
    }

    const card = await prisma.card.findUnique({
        where: { id: cardId },
        include: { deck: { select: { userId: true, user: { select: { email: true } } } } }
    });

    if (!card) {
        throw new Error('Card not found.');
    }

    // Ownership Check: Current user must match Deck owner's email
    // (We use email because session has email, but DB relates via ID. 
    // Ideally session.user.id populated via callback, let's use email lookup if needed, 
    // but deck.userId is distinct. 
    // Let's rely on the fact that we can match via email if we include user, 
    // OR look up the current user's ID first.)

    // Best practice: Get current user ID from DB
    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    if (!currentUser || card.deck.userId !== currentUser.id) {
        throw new Error('Forbidden: You do not own this card.');
    }

    return card;
}

async function verifyDeckOwnership(deckId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        throw new Error('Unauthorized');
    }

    const deck = await prisma.deck.findUnique({
        where: { id: deckId },
        select: { userId: true }
    });

    if (!deck) throw new Error('Deck not found');

    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    if (!currentUser || deck.userId !== currentUser.id) {
        throw new Error('Forbidden');
    }
}

export async function updateCard(
    cardId: string,
    data: {
        front?: string,
        back?: string,
        imageUrls?: string[],
        audioUrl?: string,
        isSuspended?: boolean
    }
) {
    // 1. Validate Input
    const parsed = UpdateCardSchema.parse(data);

    // 2. Validate Ownership
    await verifyCardOwnership(cardId);

    // 3. Execution
    await prisma.$transaction(async (tx) => {
        // Update basic fields
        await tx.card.update({
            where: { id: cardId },
            data: {
                front: parsed.front,
                back: parsed.back,
                audioUrl: parsed.audioUrl,
                isSuspended: parsed.isSuspended,
            }
        })

        // Images: If array provided, sync it.
        if (parsed.imageUrls) {
            await tx.cardImage.deleteMany({ where: { cardId } })
            if (parsed.imageUrls.length > 0) {
                await tx.cardImage.createMany({
                    data: parsed.imageUrls.map(url => ({
                        cardId,
                        url
                    }))
                })
            }
        }
    })

    revalidatePath('/')
    revalidatePath('/decks')
}

export async function toggleCardSuspension(cardId: string, currentStatus: boolean) {
    await verifyCardOwnership(cardId);

    await prisma.card.update({
        where: { id: cardId },
        data: { isSuspended: !currentStatus }
    })
    revalidatePath('/')
}

export async function deleteCard(cardId: string) {
    await verifyCardOwnership(cardId);

    await prisma.card.delete({
        where: { id: cardId }
    })
    revalidatePath('/')
}

export async function resetDeckProgress(deckId: string) {
    await verifyDeckOwnership(deckId);

    console.log(`[resetDeckProgress] called for deck ${deckId}`);
    try {
        const result = await prisma.card.updateMany({
            where: { deckId },
            data: {
                interval: 0,
                repetition: 0,
                efactor: 2.5,
                nextReview: new Date(),
                isSuspended: false
            }
        });
        console.log(`[resetDeckProgress] success. Updated ${result.count} cards.`);
    } catch (error) {
        console.error(`[resetDeckProgress] error:`, error);
        throw error;
    }

    revalidatePath('/')
    revalidatePath(`/decks/${deckId}`)
}
