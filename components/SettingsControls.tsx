'use client';

import { useState, useTransition } from 'react';
import { updatePreferences } from '@/app/actions/settingsActions';
import { Loader2 } from 'lucide-react';

interface SettingsControlsProps {
    initialDailyGoal: number;
    initialTextSize: number;
}

export default function SettingsControls({ initialDailyGoal, initialTextSize }: SettingsControlsProps) {
    const [goal, setGoal] = useState(initialDailyGoal);
    const [textSize, setTextSize] = useState(initialTextSize);
    const [isPending, startTransition] = useTransition();

    const handleSave = () => {
        startTransition(async () => {
            await updatePreferences(goal, textSize);
        });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-2">🎯 יעד יומי</h3>
                    <p className="text-xs text-slate-500 mb-4">כמה קלפים חדשים תרצה ללמוד ביום?</p>
                    <div className="flex items-center gap-2">
                        <span className="font-mono bg-white px-2 py-1 rounded border min-w-[3ch] text-center">{goal}</span>
                        <input
                            type="range"
                            min="0"
                            max="300"
                            step="5"
                            value={goal}
                            onChange={(e) => setGoal(Number(e.target.value))}
                            className="w-full accent-blue-600 cursor-pointer"
                        />
                    </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-2">👁️ גודל טקסט</h3>
                    <p className="text-xs text-slate-500 mb-4">התאם את הגודל לקריאה נוחה.</p>
                    <div className="flex items-center gap-4">
                        <span className="text-xs">A</span>
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.5"
                            value={textSize}
                            onChange={(e) => setTextSize(Number(e.target.value))}
                            className="w-full accent-blue-600 cursor-pointer"
                        />
                        <span className="text-xl">A</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {isPending && <Loader2 className="animate-spin" size={16} />}
                    {isPending ? 'שומר...' : 'שמור העדפות'}
                </button>
            </div>
        </div>
    );
}
