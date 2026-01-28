'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { calculateSM2, mapRatingToQuality } from '@/lib/sm2'

const prisma = new PrismaClient()

export async function saveCardReview(cardId: string, rating: number) {
    const XP_PER_PARTICIPATION = 10;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Fetch current card state AND Deck/User info
    const card = await prisma.card.findUnique({
        where: { id: cardId },
        include: {
            deck: {
                include: { user: true }
            }
        }
    })

    if (!card) throw new Error('Card not found')

    const user = card.deck.user;
    let newStreak = user.streakDays;
    let points = user.points + XP_PER_PARTICIPATION;

    // 2. Streak Logic
    if (user.lastStudyDate) {
        const lastDate = new Date(user.lastStudyDate);
        const lastStudyDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());

        const diffTime = Math.abs(today.getTime() - lastStudyDay.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Consecutive day
            newStreak += 1;
        } else if (diffDays > 1) {
            // Missed a day (or more)
            newStreak = 1;
        }
        // If diffDays === 0 (same day), do not increment, keep same.
    } else {
        // First time ever
        newStreak = 1;
    }

    // 3. Calculate new SM-2 values
    const { interval, repetition, efactor, nextReviewDate } = calculateSM2({
        quality: mapRatingToQuality(rating),
        lastRepetition: card.repetition,
        lastEfactor: card.efactor,
        lastInterval: card.interval
    })

    // 4. Update Transactions (User + Card + Log)
    await prisma.$transaction([
        prisma.card.update({
            where: { id: cardId },
            data: {
                interval,
                repetition,
                efactor,
                nextReview: nextReviewDate,
            }
        }),
        prisma.user.update({
            where: { id: user.id },
            data: {
                streakDays: newStreak,
                points: points,
                lastStudyDate: now
            }
        }),
        prisma.studySession.create({
            data: {
                userId: user.id,
                cardId: card.id,
                rating: rating,
                scheduledDate: card.nextReview, // Old review date strictly speaking, but close enough
                actualDate: now
            }
        })
    ]);

    // 5. Revalidate Paths
    revalidatePath('/')
    revalidatePath('/study')
    revalidatePath(`/decks/${card.deckId}`)

    return {
        pointsGained: XP_PER_PARTICIPATION,
        totalPoints: points,
        streak: newStreak
    };
}
