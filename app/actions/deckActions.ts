'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function updateDeck(deckId: string, title: string, description: string | null | undefined, category: string = "כללי") {
    try {
        await prisma.deck.update({
            where: { id: deckId },
            data: {
                title,
                description: description ?? null,
                category
            } as any
        })
    } catch (e) {
        console.warn("Schema mismatch detected, falling back to legacy update", e);
        // Fallback: update without category
        await prisma.deck.update({
            where: { id: deckId },
            data: {
                title,
                description: description ?? null
            }
        })
    }
    revalidatePath('/')
}

export async function deleteDeck(deckId: string) {
    await prisma.deck.delete({
        where: { id: deckId }
    })
    revalidatePath('/')
}
