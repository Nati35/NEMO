'use client';

import { useState } from 'react';
import CardEditor from '@/components/CardEditor';
import CardPreview from '@/components/CardPreview';
import { createCard } from '@/app/actions/createCard';
import { deleteCard, toggleCardSuspension, updateCard } from '@/app/actions/cardActions';
import { MoreVertical, Trash2, Edit2, Snowflake, Play, Eye } from 'lucide-react';

interface Card {
    id: string;
    front: string;
    back: string;
    audioUrl?: string | null;
    imageUrl?: string | null;
    images?: { url: string }[];
    isSuspended: boolean;
}

interface DeckCardListProps {
    deckId: string;
    initialCards: Card[];
}

export default function DeckCardList({ deckId, initialCards }: DeckCardListProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingCard, setEditingCard] = useState<Card | null>(null);
    const [previewCard, setPreviewCard] = useState<Card | null>(null);

    const handleAddCard = async (front: string, back: string, imageUrls?: string[], audioUrl?: string) => {
        await createCard(deckId, front, back, imageUrls, audioUrl);
        // setIsAdding(false); // Optional
    };

    const handleUpdateCard = async (front: string, back: string, imageUrls?: string[], audioUrl?: string) => {
        if (!editingCard) return;
        await updateCard(editingCard.id, { front, back, imageUrls, audioUrl });
        setEditingCard(null);
    };

    const handleToggleSuspend = async (card: Card) => {
        await toggleCardSuspension(card.id, card.isSuspended);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this card?')) {
            await deleteCard(id);
        }
    };

    return (
        <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">כרטיסים ({initialCards.length})</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    {isAdding ? "סגור עורך" : "+ הוסף כרטיס"}
                </button>
            </div>

            {/* Preview Modal */}
            {previewCard && (
                <CardPreview
                    card={previewCard}
                    onClose={() => setPreviewCard(null)}
                />
            )}

            {/* Editing Modal Overlay */}
            {editingCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl relative">
                        <CardEditor
                            initialData={{
                                front: editingCard.front,
                                back: editingCard.back,
                                imageUrls: editingCard.images?.map(i => i.url) || (editingCard.imageUrl ? [editingCard.imageUrl] : []),
                                audioUrl: editingCard.audioUrl
                            }}
                            onSave={handleUpdateCard}
                            onCancel={() => setEditingCard(null)}
                        />
                    </div>
                </div>
            )}

            {isAdding && !editingCard && (
                <div className="mb-8">
                    <CardEditor
                        onSave={handleAddCard}
                        onCancel={() => setIsAdding(false)}
                    />
                </div>
            )}

            <div className="space-y-3">
                {initialCards.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500">אין עדיין כרטיסים בחפיסה זו.</p>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="mt-2 text-blue-600 font-bold hover:underline"
                        >
                            התחל להוסיף עכשיו
                        </button>
                    </div>
                ) : (
                    initialCards.map((card) => (
                        <div
                            key={card.id}
                            onClick={() => setPreviewCard(card)}
                            className={`group bg-white border p-5 rounded-2xl flex justify-between items-center hover:shadow-md transition-all cursor-pointer ${card.isSuspended ? 'border-amber-200 bg-amber-50/50 opacity-75' : 'border-gray-100'}`}
                        >
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <div className="font-medium text-gray-900 border-l-2 border-blue-500 pl-4 Pointer-events-none">
                                    {card.front}
                                    {card.isSuspended && <span className="mr-2 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">מוקפא</span>}
                                </div>
                                <div className="text-gray-600 border-l-2 border-gray-200 pl-4 group-hover:border-blue-200 transition-colors flex items-center gap-2 pointer-events-none">
                                    {card.back}
                                    {(card.images?.length ?? 0) > 0 && <span className="text-xs text-gray-400 font-mono">[{card.images!.length} תמונות]</span>}
                                    {card.audioUrl && <span className="text-xs text-gray-400">🎵</span>}
                                </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-4">
                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Eye size={18} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleToggleSuspend(card); }}
                                    title={card.isSuspended ? "בטל הקפאה (חזור ללמוד)" : "הקפא כרטיס (דלג עליו)"}
                                    className={`p-2 rounded-lg transition-colors ${card.isSuspended ? 'text-amber-600 bg-amber-100 hover:bg-amber-200' : 'text-gray-400 hover:text-blue-400 hover:bg-blue-50'}`}
                                >
                                    <Snowflake size={18} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setEditingCard(card); }}
                                    title="ערוך"
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(card.id); }}
                                    title="מחק"
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
