"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                {/* Mobile menu button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Logo - Centered on mobile, Left on desktop */}
                <Link href="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                    NEMO
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
                    <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
                        לוח בקרה
                    </Link>
                    <Link href="/decks" className="hover:text-gray-900 transition-colors">
                        חפיסות
                    </Link>
                    <Link href="/stats" className="hover:text-gray-900 transition-colors">
                        סטטיסטיקה
                    </Link>
                </nav>

                {/* User Actions */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full text-xs font-bold ring-1 ring-orange-100/50">
                        <span>🔥</span>
                        <span>12 יום</span>
                    </div>

                    <button className="relative group overflow-hidden bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-gray-200 transition-all active:scale-95">
                        <span className="relative z-10">התחבר</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden border-b border-gray-100 bg-white">
                    <div className="container px-4 py-4 flex flex-col gap-4 text-sm font-medium text-gray-600">
                        <Link href="/dashboard" className="block py-2 hover:text-gray-900">לוח בקרה</Link>
                        <Link href="/decks" className="block py-2 hover:text-gray-900">חפיסות</Link>
                        <Link href="/stats" className="block py-2 hover:text-gray-900">סטטיסטיקה</Link>
                    </div>
                </div>
            )}
        </header>
    );
}
