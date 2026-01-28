'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function createCard(deckId: string, front: string, back: string, imageUrls?: string[], audioUrl?: string) {
    if (!deckId || !front || !back) {
        throw new Error('All fields are required')
    }

    // Handle backward compatibility or single image
    // If imageUrls is provided, use it.

    await prisma.card.create({
        data: {
            front,
            back,
            deckId,
            imageUrl: imageUrls && imageUrls.length > 0 ? imageUrls[0] : undefined, // Keep existing field populated with first image for now
            audioUrl,
            images: imageUrls && imageUrls.length > 0 ? {
                create: imageUrls.map(url => ({ url }))
            } : undefined
        }
    })

    revalidatePath(`/decks/${deckId}`)
}
