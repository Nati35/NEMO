import { Trophy, Medal, Crown, Sparkles, Star } from 'lucide-react';

export const LEVEL_THRESHOLDS = [
    { level: 1, xp: 0, title: 'טירון', color: 'text-slate-500', bg: 'bg-slate-100', icon: Star },
    { level: 2, xp: 100, title: 'מתמיד', color: 'text-blue-500', bg: 'bg-blue-100', icon: Medal },
    { level: 3, xp: 500, title: 'מלומד', color: 'text-emerald-500', bg: 'bg-emerald-100', icon: Trophy },
    { level: 4, xp: 1500, title: 'מומחה', color: 'text-purple-500', bg: 'bg-purple-100', icon: Crown },
    { level: 5, xp: 5000, title: 'אגדה', color: 'text-amber-500', bg: 'bg-amber-100', icon: Sparkles },
];

export function getUserLevel(xp: number) {
    // Find highest threshold that xp is greater than or equal to
    return LEVEL_THRESHOLDS.slice().reverse().find(t => xp >= t.xp) || LEVEL_THRESHOLDS[0];
}

export function LevelBadge({ xp, showTitle = true }: { xp: number, showTitle?: boolean }) {
    const levelInfo = getUserLevel(xp);
    const Icon = levelInfo.icon;

    return (
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${levelInfo.bg} border border-white/50 shadow-sm`}>
            <Icon size={14} className={levelInfo.color} fill="currentColor" fillOpacity={0.2} />
            {showTitle && <span className={`text-xs font-bold ${levelInfo.color}`}>{levelInfo.title}</span>}
        </div>
    );
}
