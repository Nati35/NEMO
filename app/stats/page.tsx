import { PrismaClient } from '@prisma/client';
import { BarChart3, Calendar, Trophy, Zap, Target } from 'lucide-react';
import AnalyticsCharts from '@/components/AnalyticsCharts';

const prisma = new PrismaClient();

const HARDCODED_USER_EMAIL = 'student@example.com';

async function getStats() {
    // Fetch user by email to ensure consistency with Dashboard
    const user = await prisma.user.findUnique({
        where: { email: HARDCODED_USER_EMAIL },
        include: {
            studySessions: {
                orderBy: { actualDate: 'asc' }
            }
        }
    });

    if (!user) return null;

    const totalReviews = user.studySessions.length;

    // Card Status Distribution
    const totalCards = await prisma.card.count();
    const suspendedCards = await prisma.card.count({ where: { isSuspended: true } });
    const newCards = await prisma.card.count({ where: { repetition: 0, isSuspended: false } });
    const learningCards = await prisma.card.count({ where: { repetition: { gt: 0, lte: 4 }, isSuspended: false } }); // Approx learning
    const reviewCards = await prisma.card.count({ where: { repetition: { gt: 4 }, isSuspended: false } }); // Approx mature

    const cardStatusData = [
        { name: 'חדשים', value: newCards },
        { name: 'בלמידה', value: learningCards },
        { name: 'בחזרה', value: reviewCards },
        { name: 'מושהים', value: suspendedCards },
    ];

    // Calc Cards Learned (repetition > 0)
    const cardsLearned = learningCards + reviewCards;

    // Accuracy Calculation
    const successfulReviews = user.studySessions.filter(s => s.rating >= 3).length;
    const accuracy = totalReviews > 0 ? Math.round((successfulReviews / totalReviews) * 100) : 0;

    // Process Timeline Data
    const activityMap = new Map<string, number>();
    let cumulativeReviews = 0;

    // Fill last 14 days with 0 first
    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        activityMap.set(key, 0);
    }

    user.studySessions.forEach(session => {
        const dateKey = session.actualDate.toISOString().split('T')[0];
        // Only count if within last 14 days for the daily chart, or all time for cumulative?
        // For simplicity, let's just show last 14 days activity
        if (activityMap.has(dateKey)) {
            activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1);
        }
    });

    // Convert Map to Array
    const activityData = Array.from(activityMap.entries()).map(([date, count]) => ({
        date: date.split('-').slice(1).join('/'), // MM/DD
        count
    })).sort((a, b) => a.date.localeCompare(b.date)); // Naive sort, but map order preserved usually

    // Reviews Over Time (Cumulative for the window)
    const reviewsOverTime = Array.from(activityMap.entries()).map(([date, count]) => {
        cumulativeReviews += count;
        return { date: date.split('-').slice(1).join('/'), count: cumulativeReviews };
    });


    return {
        user,
        totalReviews,
        cardsLearned,
        accuracy,
        activityData,
        cardStatusData,
        reviewsOverTime
    };
}

export default async function StatsPage() {
    const stats = await getStats();
    if (!stats) return <div>Loading...</div>;

    const { user, totalReviews, cardsLearned, accuracy, activityData, cardStatusData, reviewsOverTime } = stats;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">אנליטיקה והתקדמות 📊</h1>
                <p className="text-gray-500 mt-2 text-lg">מעקב אחר הביצועים וההרגלים שלך.</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="רצף ימים"
                    value={`${user.streakDays} ימים`}
                    icon={<Zap size={24} className="text-amber-500" />}
                    color="bg-amber-50 border-amber-100"
                />
                <StatCard
                    label="כרטיסים שנלמדו"
                    value={cardsLearned}
                    icon={<BarChart3 size={24} className="text-blue-500" />}
                    color="bg-blue-50 border-blue-100"
                />
                <StatCard
                    label="סה״כ חזרות"
                    value={totalReviews}
                    icon={<Calendar size={24} className="text-purple-500" />}
                    color="bg-purple-50 border-purple-100"
                />
                <StatCard
                    label="דיוק ממוצע"
                    value={`${accuracy}%`}
                    icon={<Target size={24} className="text-emerald-500" />}
                    color="bg-emerald-50 border-emerald-100"
                />
            </div>

            {/* Charts Section */}
            <AnalyticsCharts
                activityData={activityData}
                reviewsOverTime={reviewsOverTime}
                cardStatusData={cardStatusData}
            />

            {/* XP Section */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-3xl font-black mb-2">רמת משתמש (XP)</h2>
                        <p className="opacity-90">המשך ללמוד כדי לעלות רמות ולפתוח אפשרויות חדשות!</p>
                    </div>
                    <div className="text-6xl font-black bg-white/20 p-6 rounded-2xl backdrop-blur-sm">
                        {user.points} <span className="text-2xl font-bold">XP</span>
                    </div>
                </div>
                {/* Background Decor */}
                <Trophy className="absolute -bottom-8 -left-8 text-white/10 rotate-12" size={200} />
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }: any) {
    return (
        <div className={`p-6 rounded-2xl border ${color} flex items-center gap-4 transition-transform hover:scale-105`}>
            <div className="bg-white p-3 rounded-xl shadow-sm">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-2xl font-black text-gray-900">{value}</p>
            </div>
        </div>
    )
}
