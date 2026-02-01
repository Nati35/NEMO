"use client";

import { useState } from "react";
import { X, Check, MoreHorizontal, Eye } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import RichTextEditor from './RichTextEditor';

interface CardEditorProps {
    onSave: (front: string, back: string, imageUrls?: string[], audioUrl?: string) => void;
    onCancel: () => void;
    initialData?: {
        front: string;
        back: string;
        imageUrls?: string[];
        audioUrl?: string | null;
    };
}

export default function CardEditor({ onSave, onCancel, initialData }: CardEditorProps) {
    const [front, setFront] = useState(initialData?.front || "");
    const [back, setBack] = useState(initialData?.back || "");
    // We still track "images" for legacy/side-attachments if needed, 
    // but mostly we rely on inline images now.
    const [images, setImages] = useState<string[]>(initialData?.imageUrls || []);
    const [showPreview, setShowPreview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const uploadFile = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            return data.url;
        } catch (err: any) {
            console.error("Upload failed", err);
            alert(`Upload failed: ${err.message}.`);
            throw err;
        }
    };

    const handleSave = async () => {
        if (!front.trim() && !back.trim()) return;

        setIsSubmitting(true);
        try {
            // Extract inline images from markdown to ensure they are indexed
            const extractUrls = (text: string) => {
                const matches = text.matchAll(/!\[.*?\]\((.*?)\)/g);
                return Array.from(matches).map(m => m[1]);
            };

            const frontUrls = extractUrls(front);
            const backUrls = extractUrls(back);

            // Combine with explicitly attached images
            const allImages = Array.from(new Set([...images, ...frontUrls, ...backUrls]));

            await onSave(front, back, allImages, initialData?.audioUrl || undefined);
        } catch (error) {
            console.error("Failed to save card:", error);
            alert("שגיאה בשמירת הכרטיס. נסה שוב.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#1a1a1a] text-gray-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] w-full max-w-4xl border border-[#333]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#333] bg-[#1a1a1a]">
                <button onClick={onCancel} className="p-2 hover:bg-[#333] rounded-full transition-colors">
                    <X size={20} className="text-gray-400" />
                </button>
                <h2 className="text-lg font-bold text-gray-200">Edit card</h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowPreview(true)}
                        className="p-2 hover:bg-[#333] rounded-full transition-colors text-gray-400"
                        title="Preview"
                    >
                        <Eye size={20} />
                    </button>
                    <button className="p-2 hover:bg-[#333] rounded-full transition-colors text-gray-400">
                        <MoreHorizontal size={20} />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting || (!front && !back)}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-all disabled:opacity-50 disabled:grayscale"
                    >
                        <Check size={20} />
                    </button>
                </div>
            </div>

            {/* Preview Overlay */}
            {showPreview && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#1a1a1a] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#333] overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333]">
                            <span className="text-sm font-bold text-gray-400">Preview</span>
                            <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-[#333] rounded-full text-gray-400">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto text-center space-y-8 flex flex-col items-center">
                            <div className="space-y-4 max-w-lg w-full">
                                <div className="text-xl md:text-2xl font-bold text-gray-200 leading-snug dir-rtl">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={{ p: ({ node, ...props }) => <span {...props} /> }}>
                                        {front || "Question text..."}
                                    </ReactMarkdown>
                                </div>
                            </div>
                            <div className="w-16 h-px bg-[#333]" />
                            <div className="space-y-6 w-full max-w-lg">
                                <div className="text-lg text-gray-300 leading-relaxed dir-rtl whitespace-pre-wrap markdown-content">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                        {back || "Answer text..."}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Scroller */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#121212]">

                {/* Front Side */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end px-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Front side (Question)</label>
                    </div>
                    <RichTextEditor
                        value={front}
                        onChange={setFront}
                        placeholder="Type your question here..."
                        onImageUpload={uploadFile}
                        className="bg-[#1e1e1e] min-h-[120px]"
                    />
                </div>

                {/* Back Side */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end px-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Back side (Answer)</label>
                    </div>
                    <RichTextEditor
                        value={back}
                        onChange={setBack}
                        placeholder="Type the answer here..."
                        onImageUpload={uploadFile}
                        className="bg-[#1e1e1e] min-h-[150px]"
                    />
                </div>

            </div>

        </div>
    );
}
