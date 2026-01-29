import { X } from "lucide-react";
import { useEffect } from "react";

interface CardPreviewProps {
    card: {
        front: string;
        back: string;
        images?: { url: string }[];
        imageUrl?: string | null;
        audioUrl?: string | null;
    };
    onClose: () => void;
}

export default function CardPreview({ card, onClose }: CardPreviewProps) {
    const images = card.images?.map(i => i.url) || (card.imageUrl ? [card.imageUrl] : []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-500 text-sm tracking-widest uppercase">תצוגה מקדימה</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="overflow-y-auto p-8 space-y-8">

                    {/* Front */}
                    <div className="space-y-3 text-center">
                        <span className="text-xs font-bold text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">שאלה</span>
                        <h2 className="text-2xl font-black text-gray-900 leading-snug dir-rtl">
                            {card.front}
                        </h2>
                    </div>

                    <div className="w-16 h-1 bg-gray-100 rounded-full mx-auto" />

                    {/* Back */}
                    <div className="space-y-4 text-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">תשובה</span>

                        {/* Media */}
                        {images.length > 0 && (
                            <div className="flex gap-4 overflow-x-auto py-2 justify-center snap-x">
                                {images.map((url, i) => (
                                    <img
                                        key={i}
                                        src={url}
                                        alt="media"
                                        className="w-[90%] h-auto max-h-[60vh] rounded-xl border border-gray-200 shadow-sm object-contain snap-center bg-gray-50"
                                    />
                                ))}
                            </div>
                        )}

                        {card.audioUrl && (
                            <div className="flex justify-center">
                                <audio controls src={card.audioUrl} className="w-full max-w-sm" />
                            </div>
                        )}

                        <p className="text-xl md:text-2xl font-medium text-gray-700 leading-relaxed dir-rtl whitespace-pre-wrap">
                            {card.back}
                        </p>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
                    <button
                        onClick={onClose}
                        className="text-gray-500 font-medium hover:text-gray-900 text-sm"
                    >
                        סגור (ESC)
                    </button>
                </div>
            </div>
        </div>
    );
}
