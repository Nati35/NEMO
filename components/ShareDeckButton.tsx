"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

interface ShareDeckButtonProps {
    deckTitle: string;
}

export default function ShareDeckButton({ deckTitle }: ShareDeckButtonProps) {
    const handleShare = () => {
        const url = window.location.href;
        const text = `היי! תראו את החפיסה שיצרתי ב-NEMO 🐠\n\n*${deckTitle}*\n\nבואו ללמוד איתי כאן:\n${url}`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors shadow-sm"
            title="שתף ב-WhatsApp"
        >
            <Share2 size={18} />
            <span>שתף</span>
        </button>
    );
}
