"use client";

import { useState } from "react";

interface StudyCardProps {
    front: string;
    back: string;
    onRate: (rating: number) => void;
}

export default function StudyCard({ front, back, onRate }: StudyCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showRatings, setShowRatings] = useState(false);

    const handleFlip = () => {
        if (!isFlipped) {
            setIsFlipped(true);
            setTimeout(() => setShowRatings(true), 150); // Slight delay for smoothness
        }
    };

    const handleRating = (rating: number) => {
        setShowRatings(false);
        setIsFlipped(false);
        onRate(rating); // Parent handles loading next card
        // Reset state after animation (could improve this with exit animations)
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto min-h-[60vh]">

            {/* Card Container */}
            <div
                onClick={handleFlip}
                className="relative w-full aspect-[4/3] md:aspect-[16/10] perspective-1000 cursor-pointer group"
            >
                <div className={`relative w-full h-full transition-transform duration-500 preserve-3d shadow-2xl rounded-3xl ${isFlipped ? "rotate-y-180" : ""}`}>

                    {/* Front */}
                    <div className="absolute inset-0 bg-white rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center backface-hidden border border-gray-100">
                        <span className="absolute top-6 right-6 text-xs font-bold text-gray-400 uppercase tracking-widest">שאלה</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                            {front}
                        </h2>
                        <div className="absolute bottom-6 text-sm font-medium text-gray-400 animate-pulse">
                            לחץ כדי להפוך
                        </div>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 bg-slate-900 rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 text-white">
                        <span className="absolute top-6 right-6 text-xs font-bold text-slate-500 uppercase tracking-widest">תשובה</span>
                        <p className="text-xl md:text-3xl font-medium leading-relaxed">
                            {back}
                        </p>
                    </div>
                </div>
            </div>

            {/* Ratings Bar */}
            <div className={`mt-8 grid grid-cols-4 gap-3 w-full max-w-lg transition-all duration-300 transform ${showRatings ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
                {[
                    { label: "שכחתי", color: "bg-rose-100 text-rose-600 hover:bg-rose-200", rating: 1 },
                    { label: "קשה", color: "bg-orange-100 text-orange-600 hover:bg-orange-200", rating: 2 },
                    { label: "טוב", color: "bg-blue-100 text-blue-600 hover:bg-blue-200", rating: 3 },
                    { label: "קל", color: "bg-emerald-100 text-emerald-600 hover:bg-emerald-200", rating: 4 },
                ].map((btn) => (
                    <button
                        key={btn.rating}
                        onClick={() => handleRating(btn.rating)}
                        className={`py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 ${btn.color}`}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>

        </div>
    );
}
