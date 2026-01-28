import { PrismaClient } from '@prisma/client';
import { Palette, Check, Lock } from 'lucide-react';
import { getUserLevel, LEVEL_THRESHOLDS } from '@/components/LevelBadge';
import { updateTheme } from '@/app/actions';
import SettingsControls from '@/components/SettingsControls'; // New Component
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

const THEMES = [
    { id: 'light', name: 'בהיר (רגיל)', color: 'bg-white border-gray-200', minLevel: 1 },
    { id: 'dark', name: 'מצב לילה', color: 'bg-slate-900 border-slate-700 text-white', minLevel: 2 },
    { id: 'gold', name: 'זהב', color: 'bg-gradient-to-br from-amber-100 to-amber-200 border-amber-300', minLevel: 5 },
    { id: 'sea', name: 'ים', color: 'bg-cyan-50 border-cyan-200', minLevel: 3 },
];

export default async function SettingsPage() {
    const user = await prisma.user.findFirst();
    const cookieStore = await cookies();
    if (!user) return <div>User not found</div>;

    const currentLevel = getUserLevel(user.points).level;
    const initialDailyGoal = Number(cookieStore.get('dailyGoal')?.value || 20);
    const initialTextSize = Number(cookieStore.get('textSize')?.value || 1);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-black text-slate-900 mb-8">הגדרות משתמש ⚙️</h1>

            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <Palette className="text-blue-500" />
                    ערכת נושא
                </h2>

                <p className="text-slate-500 mb-8">בחר את המראה של האפליקציה. ערכות נושא מיוחדות נפתחות ככל שעולים ברמה!</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {THEMES.map(theme => {
                        const isLocked = currentLevel < theme.minLevel;
                        const isSelected = (user as any).selectedTheme === theme.id;

                        return (
                            <form key={theme.id} action={async () => {
                                'use server';
                                if (!isLocked) {
                                    await updateTheme(theme.id);
                                }
                            }}>
                                <button
                                    disabled={isLocked}
                                    className={`w-full relative h-32 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2
                                        ${isSelected ? 'border-blue-600 ring-4 ring-blue-50' : 'border-transparent hover:border-slate-200'}
                                        ${theme.color}
                                        ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    {isLocked ? (
                                        <div className="flex flex-col items-center gap-1 text-slate-500">
                                            <Lock size={24} />
                                            <span className="text-xs font-bold bg-white/50 px-2 py-1 rounded">רמה {theme.minLevel}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="font-bold text-lg">{theme.name}</span>
                                            {isSelected && <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full"><Check size={12} /></div>}
                                        </>
                                    )}
                                </button>
                            </form>
                        )
                    })}
                </div>
            </section>

            {/* Advanced Settings Section */}
            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mt-8">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <span className="text-2xl">⚡</span>
                    מתקדם
                </h2>

                <div className="space-y-6">
                    {/* Interactive Controls */}
                    <SettingsControls
                        initialDailyGoal={initialDailyGoal}
                        initialTextSize={initialTextSize}
                    />

                    <div className="h-px bg-slate-100 my-4"></div>

                    {/* Danger Zone */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-red-500 mb-2">אזור הזמנית (Danger Zone)</h3>

                        <div className="flex flex-col md:flex-row gap-4">
                            <form action={async () => {
                                'use server';
                                const { resetUserProgress } = await import('@/app/actions/settingsActions');
                                await resetUserProgress();
                            }}>
                                <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-colors text-sm font-bold flex items-center gap-2">
                                    🗑️ איפוס התקדמות מלא
                                </button>
                            </form>

                            <form action={async () => {
                                'use server';
                                const { exportUserData } = await import('@/app/actions/settingsActions');
                                const json = await exportUserData();
                                console.log("Exported Data:", json.length);
                            }}>
                                <button className="px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-sm font-bold flex items-center gap-2">
                                    💾 גיבוי נתונים (Export)
                                </button>
                            </form>
                        </div>
                        <p className="text-[10px] text-slate-400">
                            * איפוס התקדמות ימחק את כל ההיסטוריה והנקודות שלך, אך ישאיר את החפיסות.
                            <br />
                            * גיבוי יוריד קובץ JSON עם כל המידע שלך.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
