"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import {
    Bold, Italic, Underline as UnderlineIcon, List, Image as ImageIcon,
    Type, Link as LinkIcon, Palette
} from "lucide-react";
import { useEffect, useRef } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (markdown: string) => void;
    placeholder?: string;
    onImageUpload?: (file: File) => Promise<string>;
    className?: string;
    minHeight?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, onImageUpload, className, minHeight = "120px" }: RichTextEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            Underline,
            Link.configure({ openOnClick: false }),
            Image,
            Placeholder.configure({ placeholder }),
            Markdown.configure({
                html: true, // Allow HTML (for colors)
                transformPastedText: true,
                transformCopiedText: true
            })
        ],
        content: value,
        editorProps: {
            attributes: {
                class: `prose prose-invert max-w-none focus:outline-none min-h-[${minHeight}] px-4 py-4`,
            },
            handlePaste: (view, event, slice) => {
                const items = Array.from(event.clipboardData?.items || []);
                const imageItem = items.find(item => item.type.startsWith('image/'));

                if (imageItem && onImageUpload) {
                    event.preventDefault();
                    const file = imageItem.getAsFile();
                    if (file) {
                        onImageUpload(file).then(url => {
                            if (url) {
                                editor?.chain().focus().setImage({ src: url }).run();
                            }
                        });
                    }
                    return true;
                }
                return false;
            }
        },
        onUpdate: ({ editor }) => {
            const markdown = (editor.storage as any).markdown.getMarkdown();
            onChange(markdown);
        },
    });

    // Sync external value changes (e.g. init) only if drastically different to avoid loop?
    // Actually standard pattern is mostly one-way unless external update mechanism exists.
    // For local state editor it's fine.
    useEffect(() => {
        if (editor && value !== (editor.storage as any).markdown.getMarkdown()) {
            // Only update if content is really different to prevent cursor jumps
            // Simple comparison might be enough for now or just setContent on init/reset
            // If user types, value updates.
            // If parent updates props.value, we want to reflect it?
            // usually only if focused is false or value changed significantly.
            // Let's rely on initialData mainly, or careful sync.
            // editor.commands.setContent(value);
        }
    }, [value, editor]);


    if (!editor) {
        return null;
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && onImageUpload) {
            const file = e.target.files[0];
            const url = await onImageUpload(file);
            if (url) {
                editor.chain().focus().setImage({ src: url }).run();
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className={`flex flex-col border border-[#333] rounded-xl overflow-hidden bg-[#1e1e1e] focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all ${className}`}>
            <EditorContent editor={editor} className="flex-1 w-full" />

            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-[#252525] border-t border-[#333] overflow-x-auto">
                <ToolbarButton
                    icon={<Bold size={16} />}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                />
                <ToolbarButton
                    icon={<Italic size={16} />}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                />
                <ToolbarButton
                    icon={<UnderlineIcon size={16} />}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive('underline')}
                />
                <div className="w-px h-4 bg-[#444] mx-2" />
                <ToolbarButton
                    icon={<List size={16} />}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                />
                <ToolbarButton
                    icon={<Type size={16} />}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    active={editor.isActive('heading', { level: 1 })}
                />
                <div className="w-px h-4 bg-[#444] mx-2" />

                <ColorButton color="#ef4444" onClick={() => editor.chain().focus().setColor('#ef4444').run()} active={editor.isActive('textStyle', { color: '#ef4444' })} />
                <ColorButton color="#3b82f6" onClick={() => editor.chain().focus().setColor('#3b82f6').run()} active={editor.isActive('textStyle', { color: '#3b82f6' })} />
                <ColorButton color="#10b981" onClick={() => editor.chain().focus().setColor('#10b981').run()} active={editor.isActive('textStyle', { color: '#10b981' })} />
                <ColorButton color="#f97316" onClick={() => editor.chain().focus().setColor('#f97316').run()} active={editor.isActive('textStyle', { color: '#f97316' })} />

                <div className="w-px h-4 bg-[#444] mx-2" />

                <ToolbarButton
                    icon={<ImageIcon size={16} />}
                    onClick={() => fileInputRef.current?.click()}
                    active={editor.isActive('image')}
                />
                <ToolbarButton
                    icon={<LinkIcon size={16} />}
                    onClick={setLink}
                    active={editor.isActive('link')}
                />

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
}

function ToolbarButton({ icon, onClick, active }: { icon: React.ReactNode, onClick: () => void, active?: boolean }) {
    return (
        <button
            type="button"
            onClick={(e) => { e.preventDefault(); onClick(); }}
            className={`
                p-2 rounded-lg transition-colors
                ${active ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-[#333] hover:text-gray-200'}
            `}
        >
            {icon}
        </button>
    )
}

function ColorButton({ color, onClick, active }: { color: string, onClick: () => void, active?: boolean }) {
    return (
        <button
            type="button"
            onClick={(e) => { e.preventDefault(); onClick(); }}
            className={`
                w-5 h-5 rounded-full hover:scale-110 transition-transform mx-1 border
                ${active ? 'border-white scale-110 ring-1 ring-offset-1 ring-offset-[#252525] ring-white/50' : 'border-white/10'}
            `}
            style={{ backgroundColor: color }}
            title={color}
        />
    )
}
