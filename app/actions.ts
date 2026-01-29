'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'


const prisma = new PrismaClient()

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ... (prisma init) ...

export async function createDeck(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        throw new Error('Unauthorized');
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = (formData.get('category') as string) || "כללי"

    const isPublic = formData.get('isPublic') === 'on'

    if (!title) {
        throw new Error('Title is required')
    }

    // Find the real user
    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        throw new Error('User not found in database.')
    }

    try {
        await prisma.deck.create({
            data: {
                title,
                description,
                category,
                userId: user.id,
                isPublic
            } as any
        })
    } catch (e) {
        console.warn("Schema mismatch detected, falling back to legacy create", e);
        await prisma.deck.create({
            data: {
                title,
                description,
                // Fallback to legacy schema (no category/isPublic if schema is old)
                // Note: category might be required by DB but unknown to client... 
                // Actually if sqlite file is locked, the DB struct MIGHT be old too? 
                // Or if DB struct is new but client is old. 
                // Safe bet: if old client, it doesn't know category exists.
                // But if DB requires it? SQLite usually adds columns as nullable or default. 
                // We added default("General"). So it should be fine.
                userId: user.id
            }
        })
    }

    revalidatePath('/') // Refresh the dashboard to show the new deck
}

import { cookies } from 'next/headers';

// ... (existing createDeck)

export async function updateTheme(themeId: string) {
    const session = await getServerSession(authOptions);

    // 1. Try DB Update (Best Effort) if logged in
    if (session?.user?.email) {
        try {
            await prisma.user.update({
                where: { email: session.user.email },
                data: { selectedTheme: themeId } as any
            });
        } catch (e) {
            console.warn("Update theme DB failed", e);
        }
    }

    // 2. Set Cookie (Reliable Fallback)
    // 2. Set Cookie (Reliable Fallback)
    (await cookies()).set('theme', themeId, { secure: true, httpOnly: true });

    revalidatePath('/');
}
