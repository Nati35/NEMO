'use server';

import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const prisma = new PrismaClient();

export type NotificationDTO = {
    id: string;
    type: 'STUDY_REMINDER' | 'SYSTEM_ALERT' | 'ACHIEVEMENT' | 'COMMUNITY';
    title: string;
    message: string;
    link?: string | null;
    isRead: boolean;
    createdAt: Date;
};

export async function getNotifications(): Promise<NotificationDTO[]> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return [];

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    if (!user) return [];

    // @ts-ignore - Prisma client might be outdated until restart
    const notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 20
    });

    return notifications.map((n: any) => ({
        ...n,
        type: n.type as any
    }));
}

export async function markAsRead(notificationId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return;

    // Verify ownership
    // @ts-ignore
    const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
        include: { user: true }
    });

    if (!notification || notification.user.email !== session.user.email) {
        return;
    }

    // @ts-ignore
    await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
    });

    revalidatePath('/');
}

export async function markAllAsRead() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) return;

    // @ts-ignore
    await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true }
    });

    revalidatePath('/');
}

// Internal function to create notifications
export async function createSystemNotification(userId: string, title: string, message: string, link?: string) {
    // @ts-ignore
    await prisma.notification.create({
        data: {
            userId,
            type: 'SYSTEM_ALERT',
            title,
            message,
            link
        }
    });
}

// Check for cards due now
export async function getDueCardCount(): Promise<number> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return 0;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    if (!user) return 0;

    const now = new Date();
    const count = await prisma.card.count({
        where: {
            deck: { userId: user.id },
            nextReview: { lte: now },
            isSuspended: false
        }
    });

    return count;
}
