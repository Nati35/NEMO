"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface CardEditorProps {
    onSave: (front: string, back: string, imageUrls?: string[], audioUrl?: string) => void;
    onCancel: () => void;
    initialData?: {
        front: string;
        back: string;
        imageUrls?: string[];
        audioUrl?: string | null; // Allow null to match DB type
    };
}

export default function CardEditor({ onSave, onCancel, initialData }: CardEditorProps) {
    const [front, setFront] = useState(initialData?.front || "");
    const [back, setBack] = useState(initialData?.back || "");
    // Note: imageUrls from initialData are strings (URLs), but state uses File[].
    // To handle editing existing images vs new uploads, we need a hybrid approach.
    // For MVP: We will treat existing URLS as "readonly" previews or separate state?
    // Let's assume onSave re-sends everything. 
    // We need state for `existingImages` (string[]) and `newFiles` (File[]).
    // Simpler MVP: Just show existing images and allow deleting them.
    const [existingImages, setExistingImages] = useState<string[]>(initialData?.imageUrls || []);
    const [imageFiles, setImageFiles] = useState<File[]>([]);

    // Audio too
    const [existingAudio, setExistingAudio] = useState<string | null>(initialData?.audioUrl || null);
    const [audioFile, setAudioFile] = useState<File | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helpers to upload file to Supabase 'media' bucket
    const uploadFile = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('media')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw uploadError;
        }

        const { data } = supabase.storage.from('media').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            // Append new files to existing ones
            setImageFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        if (e.clipboardData.files && e.clipboardData.files.length > 0) {
            const pastedFiles = Array.from(e.clipboardData.files).filter(f => f.type.startsWith('image/'));
            if (pastedFiles.length > 0) {
                e.preventDefault(); // Stop valid paste from weirding out text area
                setImageFiles(prev => [...prev, ...pastedFiles]);
                // Optional: Notify user
                // alert('Image pasted!');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!front.trim() || !back.trim()) return;

        setIsSubmitting(true);

        try {
            let newImageUrls: string[] = [];
            let finalAudioUrl = existingAudio || undefined;

            if (imageFiles.length > 0) {
                // Upload all new images in parallel
                newImageUrls = await Promise.all(imageFiles.map(file => uploadFile(file)));
            }

            if (audioFile) {
                finalAudioUrl = await uploadFile(audioFile);
            }

            // Combine existing keys (urls) with new ones
            const finalImageUrls = [...existingImages, ...newImageUrls];

            onSave(front, back, finalImageUrls, finalAudioUrl);

            // Reset form if it's a new card (no initialData)
            if (!initialData) {
                setFront("");
                setBack("");
                setImageFiles([]);
                setAudioFile(null);
                setExistingImages([]);
                setExistingAudio(null);
            }
        } catch (error: any) {
            console.error("Failed to save card with media:", error);
            alert(`Error saving card: ${error.message || "Unknown error"}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            onPaste={handlePaste}
            className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8 animate-in fly-in-bottom duration-300 outline-none"
            tabIndex={0} // Allow div to receive focus/paste if clicked
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">הוספת כרטיס חדש</h3>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Front Input */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">שאלה (צד קדמי)</label>
                    <textarea
                        value={front}
                        onChange={(e) => setFront(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow min-h-[100px] resize-none"
                        placeholder="מה אתה רוצה לזכור?"
                        required
                        autoFocus
                    />
                </div>

                {/* Back Input */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">תשובה (צד אחורי)</label>
                    <textarea
                        value={back}
                        onChange={(e) => setBack(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow min-h-[100px] resize-none"
                        placeholder="התשובה..."
                        required
                    />
                </div>

                {/* Media Uploads */}
                <div className="flex flex-col gap-3 py-4 border-t border-gray-100 mt-4">

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                                <span>📷</span>
                                <span className="text-sm font-bold">
                                    {imageFiles.length > 0 ? "הוסף עוד תמונות" : "הוסף תמונות"}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label>
                            {imageFiles.length > 0 && (
                                <span className="text-xs text-blue-600 font-medium">{imageFiles.length} קבצים נבחרו</span>
                            )}
                        </div>

                        {/* Selected Images Preview List */}
                        {(imageFiles.length > 0 || existingImages.length > 0) && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {/* Existing Images */}
                                {existingImages.map((url, i) => (
                                    <div key={`existing-${i}`} className="relative group">
                                        <img src={url} alt="preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                                        <button
                                            type="button"
                                            onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}

                                {/* New Files */}
                                {imageFiles.map((file, i) => (
                                    <div key={`new-${i}`} className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-xs text-gray-600 border border-gray-200">
                                        <span className="truncate max-w-[100px]">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Audio Upload */}
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer bg-purple-50 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors">
                            <span>🎵</span>
                            <span className="text-sm font-bold">
                                {audioFile ? "שנה הקלטה/שמע" : "הוסף שמע"}
                            </span>
                            <input
                                type="file"
                                accept="audio/*"
                                className="hidden"
                                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                            />
                        </label>
                        {audioFile && (
                            <span className="text-xs text-gray-500 truncate max-w-[150px]">{audioFile.name}</span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting || !front || !back}
                        className={`
              relative overflow-hidden bg-gray-900 text-white px-8 py-3 rounded-xl font-bold transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0
            `}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                מעלה ושומר...
                            </span>
                        ) : (
                            "שמור והוסף עוד"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
