'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

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
    // If imageUrls is provided, we might want to interact with CardImage table.
    // For simplicity: If imageUrls is passed, we wipe existing and re-add? 
    // Or just append?
    // Let's assume the editor passes the COMPLETE list of URLs currently valid.

    // 1. Transaction to handle images if needed
    await prisma.$transaction(async (tx) => {
        // Update basic fields
        await tx.card.update({
            where: { id: cardId },
            data: {
                front: data.front,
                back: data.back,
                audioUrl: data.audioUrl, // Optional update
                isSuspended: data.isSuspended,
                // Handle legacy imageUrl if needed or ignore
                // imageUrl: data.imageUrls?.[0]
            }
        })

        // Images: If array provided, sync it.
        if (data.imageUrls) {
            // Delete old
            await tx.cardImage.deleteMany({ where: { cardId } })

            // Create new
            if (data.imageUrls.length > 0) {
                await tx.cardImage.createMany({
                    data: data.imageUrls.map(url => ({
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
    await prisma.card.update({
        where: { id: cardId },
        data: { isSuspended: !currentStatus }
    })
    revalidatePath('/')
}

export async function deleteCard(cardId: string) {
    await prisma.card.delete({
        where: { id: cardId }
    })
    revalidatePath('/')
}

export async function resetDeckProgress(deckId: string) {
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
