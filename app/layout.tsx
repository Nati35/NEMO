import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import MobileNav from "@/components/MobileNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "NEMO - Learning, Simply.",
    description: "A minimalist Spaced Repetition System.",
};

import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

const THEME_STYLES: Record<string, string> = {
    light: 'bg-[#F8FAFC] text-slate-900',
    dark: 'bg-slate-950 text-slate-100',
    gold: 'bg-amber-50 text-amber-900',
    sea: 'bg-cyan-50 text-cyan-900',
};

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await getServerSession(authOptions);
    let user = null;

    if (session?.user?.email) {
        user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });
    }

    const cookieStore = await cookies();

    // Prioritize Cookie (fastest/resilient), then DB, then default
    const theme = cookieStore.get('theme')?.value || (user as any)?.selectedTheme || 'light';
    const themeClass = THEME_STYLES[theme] || THEME_STYLES.light;

    return (
        <html lang="he" dir="rtl">
            <body className={`${inter.className} ${themeClass} antialiased min-h-screen flex overflow-hidden transition-colors duration-500`}>
                <Sidebar />
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <TopHeader user={user} />

                    <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
                        {children}
                    </main>
                    <MobileNav />
                </div>
            </body>
        </html>
    );
}
