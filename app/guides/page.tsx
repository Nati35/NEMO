import { BookOpen, Lightbulb, PenTool, Share2 } from 'lucide-react';

export default function GuidesPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-black text-slate-900 mb-4">מרכז הדרכה 🎓</h1>
                <p className="text-slate-500 text-lg mb-8">כל מה שצריך לדעת כדי להוציא את המקסימום מ-NEMO.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Method Guide */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                        <Lightbulb size={24} />
                    </div>
                    <h2 className="text-xl font-bold mb-3 text-slate-900">איך השיטה עובדת?</h2>
                    <p className="text-slate-500 mb-4 leading-relaxed">
                        NEMO משתמשת באלגוריתם חכם (Spaced Repetition) שמזהה בדיוק מתי אתם עומדים לשכוח מילה או מושג – ומקפיץ לכם אותו לחזרה בדיוק ברגע הנכון.
                    </p>
                    <ul className="text-sm space-y-2 text-slate-600">
                        <li className="flex items-center gap-2">✅ לומדים רק את מה שצריך</li>
                        <li className="flex items-center gap-2">✅ חוסכים שעות של שינון מיותר</li>
                        <li className="flex items-center gap-2">✅ זוכרים לטווח ארוך</li>
                    </ul>
                </div>

                {/* Creating Decks */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="bg-purple-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                        <PenTool size={24} />
                    </div>
                    <h2 className="text-xl font-bold mb-3 text-slate-900">יצירת חפיסות</h2>
                    <p className="text-slate-500 mb-4 leading-relaxed">
                        כדי להתחיל, לחצו על כפתור "+" בדף הבית. תנו שם לחפיסה (למשל "אנגלית - פסיכומטרי") והתחילו להוסיף כרטיסיות.
                    </p>
                    <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600 border border-slate-200">
                        💡 <strong>טיפ:</strong> הוסיפו תמונות לכרטיסיות כדי לחזק את הזיכרון החזותי!
                    </div>
                </div>

                {/* Library & Community */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="bg-green-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                        <BookOpen size={24} />
                    </div>
                    <h2 className="text-xl font-bold mb-3 text-slate-900">הספרייה והקהילה</h2>
                    <p className="text-slate-500 mb-4 leading-relaxed">
                        בספרייה ("הספרייה שלי") תמצאו את כל החפיסות שלכם מסודר. בקרוב תוכלו גם לשתף חפיסות עם חברים ולהוריד חפיסות מוכנות מהקהילה.
                    </p>
                </div>

                {/* Daily Goals */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="bg-orange-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-orange-600">
                        <Share2 size={24} />
                    </div>
                    <h2 className="text-xl font-bold mb-3 text-slate-900">התמדה ויעדים</h2>
                    <p className="text-slate-500 mb-4 leading-relaxed">
                        הסוד הוא עקביות. נסו להיכנס כל יום ל-10 דקות לפחות. הגדירו יעד יומי בהגדרות (למשל 20 קלפים) ושמרו על ה-Streak בוער! 🔥
                    </p>
                </div>
            </div>

            {/* Video Tutorials Section */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="text-red-500">▶️</span> מדריכי וידאו
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Video Placeholder 1 */}
                    <div className="bg-slate-900 rounded-3xl overflow-hidden aspect-video relative group cursor-pointer shadow-lg hover:shadow-xl transition-all">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all">
                                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                            </div>
                        </div>
                        {/* 
                            Embed Instructions:
                            Replace this div with an iframe for YouTube/Vimeo:
                            <iframe src="https://www.youtube.com/embed/VIDEO_ID" className="w-full h-full" ... />
                        */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-white font-bold">איך מתחילים ב-5 דקות?</p>
                            <p className="text-slate-300 text-xs">מדריך למתחילים</p>
                        </div>
                    </div>

                    {/* Video Placeholder 2 */}
                    <div className="bg-slate-100 rounded-3xl overflow-hidden aspect-video flex items-center justify-center border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold">בקרוב: סרטונים נוספים...</p>
                    </div>
                </div>
            </div>

            {/* Support Contact */}
            <div className="mt-12 text-center bg-slate-50 p-8 rounded-3xl">
                <h3 className="font-bold text-slate-900 mb-2">עדיין מסתבכים?</h3>
                <p className="text-slate-500 mb-4">אנחנו כאן לעזור. שלחו לנו הודעה ונחזור אליכם בהקדם.</p>
                <button className="bg-white border border-slate-200 px-6 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors">
                    צור קשר עם התמיכה
                </button>
            </div>
        </div>
    );
}
