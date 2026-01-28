'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function deleteCard(cardId: string, deckId: string) {
    if (!cardId) {
        throw new Error('Card ID is required')
    }

    await prisma.card.delete({
        where: { id: cardId }
    })

    revalidatePath(`/decks/${deckId}`)
}
