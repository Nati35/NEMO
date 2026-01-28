'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

// 1. Export Data
export async function exportUserData() {
    const user = await prisma.user.findFirst({
        include: {
            decks: {
                include: {
                    cards: true
                }
            },
            studySessions: true
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Sanitize or structure as needed
    const backupData = {
        exportedAt: new Date().toISOString(),
        user: {
            name: user.name,
            email: user.email,
            points: user.points,
            streak: user.streakDays
        },
        decks: user.decks,
        history: user.studySessions
    };

    return JSON.stringify(backupData, null, 2);
}

// 2. Reset Progress
export async function resetUserProgress() {
    const user = await prisma.user.findFirst();
    if (!user) return;

    // Delete all study sessions
    await prisma.studySession.deleteMany({
        where: { userId: user.id }
    });

    // Reset all cards to initial state
    // We need to find all cards belonging to user's decks
    const userDecks = await prisma.deck.findMany({
        where: { userId: user.id },
        select: { id: true }
    });

    const deckIds = userDecks.map(d => d.id);

    await prisma.card.updateMany({
        where: { deckId: { in: deckIds } },
        data: {
            interval: 0,
            repetition: 0,
            efactor: 2.5,
            nextReview: new Date() // Due immediately (or just reset to 'now')
        }
    });

    // Reset User Stats
    await prisma.user.update({
        where: { id: user.id },
        data: {
            points: 0,
            streakDays: 0,
            lastStudyDate: null
        }
    });

    revalidatePath('/');
}

import { cookies } from 'next/headers';

// 3. Update Preferences
export async function updatePreferences(dailyGoal: number, textSize: number) {
    const cookieStore = await cookies();
    cookieStore.set('dailyGoal', dailyGoal.toString(), { secure: true, httpOnly: true });
    cookieStore.set('textSize', textSize.toString(), { secure: true, httpOnly: true });
    revalidatePath('/');
}
