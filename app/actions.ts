'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'


const prisma = new PrismaClient()

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ... (prisma init) ...

import { z } from 'zod';

const CreateDeckSchema = z.object({
    title: z.string().min(1, "Title is required").max(100),
    description: z.string().max(500).optional(),
    category: z.string().optional(),
    isPublic: z.boolean().optional()
});

export async function createDeck(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        throw new Error('Unauthorized');
    }

    const rawData = {
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category') || "כללי",
        isPublic: formData.get('isPublic') === 'on'
    };

    // 1. Validate Input
    const parsed = CreateDeckSchema.parse(rawData);

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
                title: parsed.title,
                description: parsed.description || "",
                category: parsed.category,
                userId: user.id,
                isPublic: parsed.isPublic
            } as any
        })
    } catch (e) {
        console.warn("Schema mismatch detected, falling back to legacy create", e);
        // Fallback logic could be kept or removed if we are sure schema is updated.
        // For safety, I'll keep a simplified version or just throw since validation passed.
        // Actually, if Schema mismatch is DB side (missing columns), this Zod parse won't help that.
        // But Zod ensures we don't send garbage. 
        // Let's rely on standard create.
        throw e; // Standardizing behavior: fail if DB fails.
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
