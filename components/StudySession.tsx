'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { saveCardReview } from "@/app/actions/saveReview";
import { calculateSM2, mapRatingToQuality } from "@/lib/sm2";

interface Card {
    id: string;
    front: string;
    back: string;
    imageUrl?: string | null;
    audioUrl?: string | null;
    images?: { url: string }[];
    // Algorithm fields
    interval: number;
    repetition: number;
    efactor: number;
}

// Helper to format interval
function formatInterval(minutes: number, days: number): string {
    if (days === 0) {
        if (minutes < 60) return `${Math.round(minutes)} דק'`;
        return `${Math.round(minutes / 60)} ש'`;
    }
    return `${days} ימ'`;
}

export default function StudySession({ cards, deckId }: { cards: Card[], deckId: string }) {
    // Initialize session cards from props. 
    // We use a local state to allow re-queueing (adding "Again" cards to the end).
    const [sessionCards, setSessionCards] = useState(cards);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showRatings, setShowRatings] = useState(false);

    // State for tracking stats
    const [sessionResults, setSessionResults] = useState<{ rating: number; nextIntervalLabel: string }[]>([]);

    // Current Card
    const currentCard = sessionCards[currentIndex];

    const getIntervalLabel = (rating: number) => {
        if (!currentCard) return '';
        const quality = mapRatingToQuality(rating);
        const result = calculateSM2({
            quality,
            lastInterval: currentCard.interval || 0,
            lastRepetition: currentCard.repetition || 0,
            lastEfactor: currentCard.efactor || 2.5
        });

        const now = new Date();
        const diffMs = result.nextReviewDate.getTime() - now.getTime();
        const diffMins = Math.max(1, diffMs / 60000);
        const diffDays = result.interval;

        // Using helper logic visually
        if (diffMins < 60) return `${Math.round(diffMins)} דק'`;
        if (diffMins < 24 * 60) return `${Math.round(diffMins / 60)} ש'`;
        return `${Math.round(diffDays)} ימ'`;
    };

    const handleFlip = () => {
        if (!isFlipped) {
            setIsFlipped(true);
            setTimeout(() => setShowRatings(true), 150);
        } else {
            setIsFlipped(false);
            setShowRatings(false);
        }
    };

    const [xpGained, setXpGained] = useState(0);
    const [showXpAnim, setShowXpAnim] = useState(false);

    const handleRate = async (rating: number) => {
        const intervalLabel = getIntervalLabel(rating);
        const cardToSave = sessionCards[currentIndex];

        setIsFlipped(false);
        setShowRatings(false);

        // Optimistic UI updates / Animations
        setShowXpAnim(true);
        setTimeout(() => setShowXpAnim(false), 1000);

        // Track result locally
        setSessionResults(prev => [...prev, { rating, nextIntervalLabel: intervalLabel }]);

        // 1. Save Review to DB & Get Gamification Stats
        try {
            const stats = await saveCardReview(cardToSave.id, rating);
            if (stats) setXpGained(prev => prev + stats.pointsGained);
        } catch (err) {
            console.error("Failed to save review", err);
        }

        // 2. Logic for Re-queueing "Again" cards
        if (rating === 1) {
            setSessionCards(prev => [...prev, cardToSave]);
        }

        // 3. Move to next
        setTimeout(() => {
            if (currentIndex < sessionCards.length - 1) {
                setCurrentIndex((prev) => prev + 1);
            } else {
                setIsFinished(true);
            }
        }, 300);
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isFinished || !currentCard) return;

            if (e.code === 'Space') {
                e.preventDefault();
                handleFlip(); // Just toggle, never rate
            }

            // Number keys for ratings (only when flipped/back is shown)
            if (isFlipped) {
                if (e.key === '1') handleRate(1); // Forgot
                if (e.key === '2') handleRate(2); // Hard
                if (e.key === '3') handleRate(3); // Good
                if (e.key === '4') handleRate(4); // Easy
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFinished, isFlipped, currentCard]); // Dependencies updated

    // If no cards at all
    if (sessionCards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
                <h1 className="text-3xl font-black text-gray-900">החפיסה ריקה / אין כרטיסים ללימוד</h1>
                <p className="text-gray-500">נראה שאין כרטיסים שדורשים חזרה כרגע.</p>
                <Link
                    href={`/decks/${deckId}`}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700"
                >
                    חזרה לחפיסה
                </Link>
            </div>
        )
    }

    if (isFinished) {
        // Calculate Stats
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
        sessionResults.forEach(r => { if (counts[r.rating as keyof typeof counts] !== undefined) counts[r.rating as keyof typeof counts]++ });

        const forecast = sessionResults.reduce((acc, curr) => {
            acc[curr.nextIntervalLabel] = (acc[curr.nextIntervalLabel] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto px-4">
                <div className="space-y-2">
                    <div className="text-6xl animate-bounce mb-4">🏆</div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">סיכום סשן</h1>
                    <p className="text-gray-500">הרווחת <span className="text-amber-500 font-bold">{xpGained} XP</span> בסשן הזה!</p>
                </div>

                {/* Grid of Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                        <div className="text-2xl font-black text-rose-600">{counts[1]}</div>
                        <div className="text-xs text-rose-800 font-bold uppercase">שכחתי (Again)</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                        <div className="text-2xl font-black text-orange-600">{counts[2]}</div>
                        <div className="text-xs text-orange-800 font-bold uppercase">קשה (Hard)</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <div className="text-2xl font-black text-blue-600">{counts[3]}</div>
                        <div className="text-xs text-blue-800 font-bold uppercase">טוב (Good)</div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                        <div className="text-2xl font-black text-emerald-600">{counts[4]}</div>
                        <div className="text-xs text-emerald-800 font-bold uppercase">קל (Easy)</div>
                    </div>
                </div>

                {/* Forecast List */}
                <div className="w-full bg-white border border-gray-200 rounded-3xl p-6 text-right">
                    <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">📅 מתי אראה את הכרטיסים שוב?</h3>
                    <div className="flex flex-wrap gap-3 justify-end">
                        {Object.entries(forecast).map(([label, count]) => (
                            <div key={label} className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-3">
                                <span className="font-bold text-gray-900">{count} כרטיסים</span>
                                <span className="text-gray-400">⬅</span>
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm font-bold dir-ltr">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <Link
                    href={`/decks/${deckId}`}
                    className="bg-gray-900 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-800 hover:scale-105 transition-all shadow-xl shadow-blue-500/10 w-full md:w-auto"
                >
                    סיים וחזור
                </Link>
            </div>
        );
    }

    const progress = ((currentIndex) / sessionCards.length) * 100;

    return (
        <div className="max-w-4xl mx-auto px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 md:mb-12">
                <Link href={`/decks/${deckId}`} className="text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-2 font-medium">
                    <span className="text-xl">←</span> יציאה
                </Link>

                {/* Progress Bar */}
                <div className="flex-1 mx-8 max-w-sm">
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="text-sm font-bold text-gray-400 tracking-widest">
                    {currentIndex + 1} / {sessionCards.length}
                </div>
            </div>

            {/* XP Animation */}
            {showXpAnim && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 animate-out fade-out slide-out-to-top-10 duration-1000">
                    <div className="text-4xl font-black text-amber-400 drop-shadow-lg scale-150">
                        +10 XP
                    </div>
                </div>
            )}

            {/* Card Container */}
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div
                    onClick={handleFlip}
                    className="relative w-full max-w-2xl aspect-[4/3] md:aspect-[16/10] cursor-pointer group select-none"
                    style={{ perspective: "1000px" }}
                >
                    <div
                        className="relative w-full h-full transition-transform duration-500 shadow-2xl shadow-blue-900/5 rounded-[2rem]"
                        style={{
                            transformStyle: "preserve-3d",
                            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                        }}
                    >
                        {/* Front */}
                        <div
                            className="absolute inset-0 bg-white rounded-[2rem] p-6 md:p-12 flex flex-col items-center justify-center text-center border border-gray-100"
                            style={{
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden"
                            }}
                        >
                            <span className="absolute top-8 right-8 text-xs font-bold text-gray-400 uppercase tracking-widest">שאלה</span>

                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
                                {currentCard.front}
                            </h2>
                            <div className={`absolute bottom-8 text-sm font-medium text-gray-400 animate-pulse ${isFlipped ? "" : "opacity-100"}`}>
                                לחץ רווח להפיכה
                            </div>
                        </div>

                        {/* Back */}
                        <div
                            className="absolute inset-0 bg-slate-900 rounded-[2rem] p-8 md:p-16 flex flex-col items-center justify-center text-center text-white"
                            style={{
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                                transform: "rotateY(180deg)"
                            }}
                        >
                            <span className="absolute top-8 right-8 text-xs font-bold text-slate-500 uppercase tracking-widest">תשובה</span>

                            {/* Media Content */}
                            {(currentCard.images && currentCard.images.length > 0) ? (
                                <div className="mb-6 w-full flex-1 overflow-y-auto flex flex-col gap-4 min-h-0 items-center">
                                    {currentCard.images.map((img, idx) => (
                                        <div key={idx} className="w-full flex justify-center">
                                            <img
                                                src={img.url}
                                                alt={`Card visual ${idx + 1}`}
                                                className="rounded-xl w-[95%] h-auto object-contain shadow-sm border border-slate-700 bg-black/20"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : currentCard.imageUrl && (
                                <div className="mb-6 w-full flex-1 flex justify-center min-h-0 items-center">
                                    <img
                                        src={currentCard.imageUrl}
                                        alt="Card visual"
                                        className="rounded-xl w-[95%] h-auto object-contain shadow-sm border border-slate-700 bg-black/20"
                                    />
                                </div>
                            )}

                            {currentCard.audioUrl && (
                                <div className="mb-4 w-full flex justify-center">
                                    <audio controls src={currentCard.audioUrl} className="w-full max-w-xs" />
                                </div>
                            )}

                            <div className="w-full overflow-y-auto max-h-[40vh]"> {/* Scrollable text area if too long */}
                                <p className="text-2xl md:text-3xl font-medium leading-relaxed break-words break-all px-4">
                                    {currentCard.back}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ratings Bar */}
                <div className={`mt-12 grid grid-cols-4 gap-4 w-full max-w-2xl transition-all duration-500 transform ${showRatings ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}`}>
                    {[
                        { label: "שכחתי", color: "bg-rose-50 text-rose-600 hover:bg-rose-100 ring-1 ring-rose-100", rating: 1, key: "1" },
                        { label: "קשה", color: "bg-orange-50 text-orange-600 hover:bg-orange-100 ring-1 ring-orange-100", rating: 2, key: "2" },
                        { label: "טוב", color: "bg-blue-50 text-blue-600 hover:bg-blue-100 ring-1 ring-blue-100", rating: 3, key: "3" },
                        { label: "קל", color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 ring-1 ring-emerald-100", rating: 4, key: "4" },
                    ].map((btn, i) => (
                        <button
                            key={btn.rating}
                            onClick={(e) => { e.stopPropagation(); handleRate(btn.rating); }}
                            className={`relative py-6 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${btn.color} flex flex-col items-center justify-center gap-1 group`}
                            style={{ transitionDelay: `${i * 50}ms` }}
                            title={`קיצור מקלדת: ${btn.key}`}
                        >
                            <span className="absolute top-2 right-3 text-[10px] font-mono opacity-40 border border-current px-1 rounded">{btn.key}</span>
                            <span>{btn.label}</span>
                            <span className="text-xs opacity-70 font-medium tracking-wide block">
                                {getIntervalLabel(btn.rating)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
