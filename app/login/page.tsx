'use client';

import { signIn } from "next-auth/react";
import Image from "next/image";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl border border-indigo-100 max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">ברוכים הבאים</h1>
                    <p className="text-gray-500">התחבר כדי להתחיל ללמוד ולעקוב אחר ההתקדמות שלך</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => signIn('google', { callbackUrl: '/' })}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all group"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform">🇬</span>
                        התחבר עם Google
                    </button>

                    <button
                        onClick={() => signIn('facebook', { callbackUrl: '/' })}
                        className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white font-bold py-4 rounded-xl hover:bg-[#166fe5] hover:shadow-md transition-all shadow-blue-500/20 group"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform">🇫</span>
                        התחבר עם Facebook
                    </button>
                </div>

                <div className="text-xs text-gray-400">
                    בלחיצה על התחברות את/ה מאשר/ת את תנאי השימוש
                </div>
            </div>
        </div>
    );
}
