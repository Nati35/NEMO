'use client';

import { resetDeckProgress } from "@/app/actions/cardActions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function ResetDeckButton({ deckId }: { deckId: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleReset = async () => {
        if (!confirm("פעולה זו תאפס את כל התקדמות הלמידה בחפיסה זו. האם אתה בטוח?")) {
            return;
        }

        try {
            setIsLoading(true);
            await resetDeckProgress(deckId);
            router.refresh(); // Explicitly refresh client cache
        } catch (error) {
            alert("אירעה שגיאה באיפוס החפיסה.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleReset}
            disabled={isLoading}
            className="bg-white border border-rose-200 text-rose-600 px-4 py-3 rounded-xl font-bold hover:bg-rose-50 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : '🔄'}
            אפס התקדמות
        </button>
    );
}
