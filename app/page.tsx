import {
  BookOpen,
  Brain,
  Flame,
  Clock,
  ChevronRight,
  MoreVertical,
  Zap,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import NewDeckDialog from '@/components/NewDeckDialog';
import DeckCard from '@/components/DeckCard';

const prisma = new PrismaClient();

// TODO: Replace with real user ID from auth
const HARDCODED_USER_EMAIL = 'student@example.com';

async function getDashboardData(query?: string) {
  const user = await prisma.user.findUnique({
    where: { email: HARDCODED_USER_EMAIL },
    include: {
      decks: {
        where: query ? {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } }
          ]
        } : undefined,
        include: {
          _count: {
            select: { cards: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      }
    }
  });

  if (!user) return { decks: [], dueCount: 0, learnedCount: 0, streak: 0 };

  // Fetch Stats (Global stats should probably NOT be filtered by search, 
  // but if the user wants to "search" generally, maybe he wants to see stats for that search?
  // Usually dashboard stats are global. Let's keep stats global, but "Decks" list filtered.
  // The 'dueCount' and 'learnedCount' below use specific queries unrelated to the 'user.decks' fetch above.
  // So they will REMAIN GLOBAL, which is likely correct (Notification count shouldn't disappear just because I searched 'Math').

  const now = new Date();

  // 1. Due Cards: either overdue/due now OR new cards (interval 0)
  // We filter by user's decks if needed, but for MVP assuming all cards belong to decks owned by user
  const dueCount = await prisma.card.count({
    where: {
      deck: { userId: user.id }, // Ensure we only count user's cards
      OR: [
        { nextReview: { lte: now } },
        { interval: 0 }
      ]
    }
  });

  // 2. Learned Cards: repetition > 0
  const learnedCount = await prisma.card.count({
    where: {
      deck: { userId: user.id },
      repetition: { gt: 0 }
    }
  });

  // 3. Find active deck for the "Start Learning" button
  // 4. Enrich decks with stats (Due / Done Today)
  const enrichedDecks = await Promise.all(user.decks.map(async (deck) => {
    // Count Due
    const deckDueCount = await prisma.card.count({
      where: {
        deckId: deck.id,
        OR: [
          { nextReview: { lte: now } },
          { interval: 0 }
        ]
      }
    });

    // Count Done Today (Sessions)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // We count sessions associated with cards in this deck
    const deckDoneToday = await prisma.studySession.count({
      where: {
        card: { deckId: deck.id },
        actualDate: { gte: todayStart }
      }
    });

    // Count Upcoming (Next 20 mins - e.g. "Forgot" cards)
    const upcomingEnd = new Date(now.getTime() + 20 * 60000);
    const deckUpcomingCount = await prisma.card.count({
      where: {
        deckId: deck.id,
        nextReview: {
          gt: now,
          lte: upcomingEnd
        }
      }
    });

    return {
      ...deck,
      stats: {
        due: deckDueCount,
        doneToday: deckDoneToday,
        upcoming: deckUpcomingCount,
        total: await prisma.card.count({ where: { deckId: deck.id } })
      },
    };
  }));

  // Sort: Decks with due cards first
  enrichedDecks.sort((a, b) => b.stats.due - a.stats.due);

  // 5. Memory Strength (Average E-Factor)
  // E-Factor starts at 2.5. Range roughly 1.3 to 3.0.
  // We'll normalize: 2.5 = 100%, 1.3 = 50%.
  const { _avg: { efactor } } = await prisma.card.aggregate({
    where: { deck: { userId: user.id } },
    _avg: { efactor: true }
  });
  const avgEfactor = efactor || 2.5;
  const memoryStrength = Math.min(100, Math.round((avgEfactor / 2.5) * 100));

  // 6. Study Time (Last 7 Days) & Chart Data
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const weeklySessions = await prisma.studySession.findMany({
    where: {
      userId: user.id,
      actualDate: { gte: sevenDaysAgo }
    },
    select: { actualDate: true }
  });

  // Calculate Time (Estimate 15s per card review)
  const secondsPerReview = 15;
  const weeklySeconds = weeklySessions.length * secondsPerReview;
  const weeklyHours = (weeklySeconds / 3600).toFixed(1);

  // Group by Day for Chart
  const daysMap = new Map<number, number>(); // day 0-6 -> count
  weeklySessions.forEach(s => {
    const day = s.actualDate.getDay();
    daysMap.set(day, (daysMap.get(day) || 0) + 1);
  });

  // Generate last 7 days array ordered from 6 days ago to Today
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i)); // 6 days ago, 5 days ago, ... Today
    const dayIndex = d.getDay();
    const dayName = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'][dayIndex];
    return {
      day: dayName,
      val: daysMap.get(dayIndex) || 0
    };
  });

  // Normalize chart values to percentage relative to max for the bar height
  // Or just pass raw values and handle visual scaling? The UI uses %, let's scale max to 100%.
  const maxVal = Math.max(...chartData.map(d => d.val), 10); // Min max is 10 to avoid div/0
  const normalizedChart = chartData.map(d => ({
    ...d,
    percent: Math.round((d.val / maxVal) * 100)
  }));


  const activeDeckIdSmart = enrichedDecks.find(d => d.stats.due > 0)?.id || null;

  return {
    decks: enrichedDecks,
    dueCount,
    learnedCount,
    streak: user.streakDays,
    activeDeckId: activeDeckIdSmart,
    memoryStrength,
    weeklyHours,
    chartData: normalizedChart,
    userName: user.name || 'סטודנט'
  };
}

export default async function Home({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams?.q || '';
  const { decks, dueCount, learnedCount, streak, activeDeckId, memoryStrength, weeklyHours, chartData, userName } = await getDashboardData(query);

  const stats = [
    { label: 'כרטיסיות שנלמדו', value: learnedCount.toLocaleString(), icon: <BookOpen size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'חוזק זיכרון ממוצע', value: `${memoryStrength}%`, icon: <Brain size={20} />, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'רצף ימים (Streak)', value: streak.toString(), icon: <Flame size={20} />, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'זמן למידה השבוע', value: `${weeklyHours}h`, icon: <Clock size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  /* Random Quote Logic */
  const QUOTES = [
    "שלא יהיה לכם זיכרון של דג 🐟",
    "ללמוד למבחן זה כמו לרוץ מרתון, רק בלי החלק הבריא 🏃",
    "המוח הוא שריר, NEMO הוא המכון כושר שלך 💪",
    "זיכרון של פיל? בינתיים נסתפק בזיכרון של סטודנט אחרי קפה 🐘☕",
    "מי שטורח בערב שבת, זוכר את החומר למבחן בראשון 📅",
    "עוד כרטיסייה אחת ודי... (שקר שכולנו אומרים) 🤥",
    "ידע זה כוח, אבל קפה זה דלק ⛽",
    "לימודים זה החיים (כרגע, לפחות) 📚",
    "אל תדחה למחר את מה שאפשר לשכוח היום... סתם, בוא נלמד! 😉",
    "לא הביישן למד, ולא מי שלא בודק את הסיכומים 🤓",
    "הדרך להצלחה רצופה בהרבה כוסות אספרסו כפול ☕☕",
    "אם זה היה קל, כולם היו מצטיינים דיקן 🎓",
    "יש לך פוטנציאל אדיר! עכשיו רק צריך להוציא אותו מהמיטה 🛏️",
    "סיכומים הם החיים, כל השאר זה בונוס ✨",
    "מבחן זה רק דף עם שאלות, אתה זה התשובות (מקווים) 📝",
    "מי צריך שינה כשיש דדליין למחר בבוקר? 😴",
    "אני לא דוחה דברים, אני עושה אופטימיזציה ללחץ של הרגע האחרון ⚡",
    "ללמוד זה כמו חדר כושר למוח, רק בלי להזיע (לרוב) 🧠",
    "ההבדל בין 'נכשל' ל'עובר' זה לפעמים כרטיסייה אחת ב-NEMO 🐠",
    "אל תהיה דג, תהיה כריש של חומר! 🦈",
    "מה שלא הורג מחשל... או סתם מעייף, אבל בסוף עובר 💪",
    "היום לומדים, מחר זוכרים (בזכות האלגוריתם) 🤖",
    "סטודנט חכם יודע מתי ללמוד, סטודנט גאון זוכר מתי המבחן 📅",
    "כל שאלה היא הזדמנות להראות כמה למדת (או כמה ניחשת טוב) 🎲",
    "אין דבר העומד בפני הרצון (ובפני הרבה קפאין) ☕",
    "הצלחה היא סך כל המאמצים הקטנים שנעשים יום אחר יום 📈",
    "תאמין בעצמך, כי ויקיפדיה לא תהיה שם בשבילך במבחן 🚫🌐",
    "סיימת ללמוד? יופי, עכשיו תתחיל שוב (סתם, קח הפסקה) ⏸️",
    "הדף ריק? גם הראש? לא נורא, בשביל זה יש כרטיסיות 🃏",
    "החומר לא ייכנס לראש מעצמו (לצערי), בוא נעזור לו 🧠"
  ];
  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  return (
    <div className="p-8 pb-20">
      {/* Welcome Message */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-3xl font-black text-slate-900">בוקר טוב, {userName}.</h2>
            <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              NEMO Active
            </span>
          </div>
          <p className="text-slate-500 font-medium">
            מוכנים ללמוד? <span className="text-blue-600 italic">"{randomQuote}"</span>
          </p>
        </div>
        <NewDeckDialog />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Decks Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              החפיסות שלי <span className="text-sm font-normal text-slate-400">({decks.length})</span>
            </h3>
            <button className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
              צפה בהכל <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {decks.map((deck) => (
              <DeckCard key={deck.id} deck={{ ...deck, category: (deck as any).category || "כללי" }} />
            ))}
          </div>
        </div>

        {/* Right: Insights & Daily Session */}
        <div className="space-y-8">

          {/* Daily Smart Session */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                <Zap className="text-amber-400" size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">הסשן היומי שלך</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                {dueCount > 0
                  ? `אלגוריתם ה-NEMO מצא ${dueCount} כרטיסיות שדורשות רענון מיידי כדי למנוע שכחה. בוא נתקתק את זה!`
                  : "סיימת את כל החזרות להיום! אפשר לנוח או ללמוד כרטיסיות חדשות."
                }
              </p>
              {dueCount > 0 && activeDeckId && (
                <Link
                  href={`/study/${activeDeckId}`}
                  className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-50 transition-colors"
                >
                  התחל ללמוד עכשיו <ChevronRight size={18} />
                </Link>
              )}
            </div>
            {/* Abstract background element */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
          </div>

          {/* Memory Strength Chart (Real Data) */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-600" /> פעילות למידה שבועית
            </h3>
            <div className="space-y-4">
              {/* Chart Placeholder */}
              <div className="h-32 flex items-end justify-between gap-1 mt-4 px-2">
                {chartData && chartData.length > 0 ? chartData.map((d, i) => (
                  <div key={i} className="bg-blue-100 dark:bg-blue-900/30 w-full rounded-t-sm hover:bg-blue-200 transition-colors relative group" style={{ height: `${d.percent}%` }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none">
                      {d.val}
                    </div>
                  </div>
                )) : (
                  <div className="w-full text-center text-xs text-slate-400">אין נתונים עדיין</div>
                )}
              </div>
            </div>
            <div className="mt-8 flex items-center gap-3 bg-teal-50 p-4 rounded-2xl border border-teal-100">
              <CheckCircle2 size={18} className="text-teal-600" />
              <p className="text-[10px] text-teal-800 leading-tight">
                <strong>שיפור של 15%!</strong> שיטת הכרטיסיות החכמה העלתה את הציון הממוצע שלך בסימולציות.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
