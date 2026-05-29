import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Book, Users, FileText, Mail, ArrowUpRight, ArrowDownRight, 
  Clock, CheckCircle, AlertCircle, MoreVertical, ExternalLink,
  Plus, Newspaper, Users2, Activity, Layout, Image as ImageIcon,
  MousePointer, ShoppingCart, TrendingUp, BarChart3, HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { BookItem, Author, Submission, ContactMessage, AdminLog, NewsItem, AnalyticsEvent } from '../../types';

interface DashboardHomeProps {
  books: BookItem[];
  authors: Author[];
  submissions: Submission[];
  messages: ContactMessage[];
  logs: AdminLog[];
  news: NewsItem[];
  analyticsEvents?: AnalyticsEvent[];
  darkMode: boolean;
  onTabChange: (tab: string, action?: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  books, authors, submissions, messages, logs, news, analyticsEvents = [], darkMode, onTabChange
}) => {
  // 1. Time range selections for analytics
  const [timeRange, setTimeRange] = useState<'7days' | '30days'>('7days');
  
  // 2. Computed general stats
  const totalViews = useMemo(() => analyticsEvents.filter(e => e.eventType === 'view').length, [analyticsEvents]);
  const totalOrderClicks = useMemo(() => analyticsEvents.filter(e => e.eventType === 'order_click').length, [analyticsEvents]);
  const totalOrderSubmits = useMemo(() => analyticsEvents.filter(e => e.eventType === 'order_submit').length, [analyticsEvents]);

  const stats = [
    { id: 'books', label: 'Livres au Catalogue', value: books.length, icon: Book, color: 'bg-violet', subtitle: 'Disponibles sur le site' },
    { id: 'views', label: 'Consultations (Articles)', value: totalViews, icon: MousePointer, color: 'bg-blue-500', subtitle: 'Clics sur fiches de livres' },
    { id: 'order_clicks', label: 'Tours de Commande', value: totalOrderClicks, icon: ShoppingCart, color: 'bg-orange-500', subtitle: 'Clics sur "Commander"' },
    { id: 'order_submits', label: 'Validations Directes', value: totalOrderSubmits, icon: CheckCircle, color: 'bg-emerald-500', subtitle: 'Finalisés sur WhatsApp' },
  ];

  // 3. Dynamic book-by-book popularity rankings
  const bookRankings = useMemo(() => {
    const rankingMap: Record<string, { id: string; title: string; genre: string; cover: string; views: number; orderClicks: number; orderSubmits: number; total: number }> = {};
    
    // Seed with all catalog books to show 0 values beautifully
    books.forEach(b => {
      rankingMap[b.id] = {
        id: b.id,
        title: b.title,
        genre: b.genre,
        cover: b.cover,
        views: 0,
        orderClicks: 0,
        orderSubmits: 0,
        total: 0
      };
    });
    
    // Aggregate logged and calculated events or fallback to simulate realistic seed if empty
    analyticsEvents.forEach(e => {
      if (!rankingMap[e.bookId]) {
        rankingMap[e.bookId] = {
          id: e.bookId,
          title: e.bookTitle || 'Livre supprimé',
          genre: 'Saint Graal Ivoirien',
          cover: '',
          views: 0,
          orderClicks: 0,
          orderSubmits: 0,
          total: 0
        };
      }
      
      const entry = rankingMap[e.bookId];
      if (e.eventType === 'view') {
        entry.views++;
      } else if (e.eventType === 'order_click') {
        entry.orderClicks++;
      } else if (e.eventType === 'order_submit') {
        entry.orderSubmits++;
      }
      entry.total = entry.views + entry.orderClicks + entry.orderSubmits;
    });

    return Object.values(rankingMap).sort((a, b) => b.total - a.total);
  }, [books, analyticsEvents]);

  // 4. Generate daily timeline metrics for selected timeframe
  const timelineData = useMemo(() => {
    const daysToGenerate = timeRange === '7days' ? 7 : 30;
    const data = [];
    const now = new Date();
    
    for (let i = daysToGenerate - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; // Year-Month-Day formatted UTC
      const displayLabel = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      
      const dayEvents = analyticsEvents.filter(e => e.timestamp && e.timestamp.startsWith(dateStr));
      const views = dayEvents.filter(e => e.eventType === 'view').length;
      const orderClicks = dayEvents.filter(e => e.eventType === 'order_click').length;
      const orderSubmits = dayEvents.filter(e => e.eventType === 'order_submit').length;
      
      data.push({
        date: displayLabel,
        'Consultations': views,
        'Clics Commande': orderClicks,
        'Validations WhatsApp': orderSubmits,
        total: views + orderClicks + orderSubmits
      });
    }
    return data;
  }, [analyticsEvents, timeRange]);

  // CATEGORIES / PIE CHART Data
  const sgCount = books.filter(b => b.genre === 'SAINT GRAAL IVOIRIEN').length;
  const isCount = books.filter(b => b.genre === 'IVOIRE STORY').length;
  const categoryData = [
    { name: 'SAINT GRAAL IVOIRIEN', value: sgCount || (isCount === 0 ? 5 : 0) },
    { name: 'IVOIRE STORY', value: isCount || (sgCount === 0 ? 3 : 0) },
  ];

  const COLORS = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Tableau de Bord & Statistiques</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Suivez en temps réel les préférences de vos lecteurs, l'intérêt des articles et l'évolution des commandes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Exporter Rapport
          </button>
          <button 
            type="button"
            onClick={() => onTabChange('books', 'addBook')}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet text-white rounded-xl font-bold text-sm shadow-lg shadow-violet/20 hover:scale-105 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nouveau Livre
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Ajouter Livre', icon: Plus, tab: 'books', color: 'bg-violet' },
          { label: 'Nouvel Auteur', icon: Users, tab: 'authors', color: 'bg-blue-500' },
          { label: 'Poster Actu', icon: Newspaper, tab: 'news', color: 'bg-vert' },
          { label: 'Médiathèque', icon: ImageIcon, tab: 'gallery', color: 'bg-orange-500' },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => onTabChange(action.tab)}
            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer active:scale-95 ${
              darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-100 hover:shadow-md'
            }`}
          >
            <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center text-white`}>
              <action.icon className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs uppercase tracking-widest">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-[2rem] shadow-sm border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            } transition-all relative overflow-hidden group hover:shadow-lg`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.color} opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700`} />
            <div className="flex items-center justify-between mb-2">
              <div className={`w-12 h-12 ${stat.color} bg-opacity-10 dark:bg-opacity-20 rounded-2xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <TrendingUp className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-black mt-1 leading-none">{stat.value}</h3>
            <p className="text-[11px] text-gray-400 dark:text-gray-400 font-semibold mt-1.5">{stat.subtitle}</p>
          </motion.div>
        ))}
      </div>

      {/* HIGH-LEVEL ACTIVE ANALYTICS BLOCKS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Click Evolution Area Chart */}
        <div id="click-evolution-chart" className={`lg:col-span-2 p-8 rounded-[2.5rem] shadow-sm border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-violet text-[9px] font-black uppercase tracking-[0.2em] block mb-1">Impact & Trafic</span>
              <h3 className="text-xl font-black flex items-center gap-2">
                <BarChart3 className="text-violet w-5 h-5" /> Évolution Visuelle des Clics
              </h3>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-xl">
              <button
                onClick={() => setTimeRange('7days')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeRange === '7days'
                    ? 'bg-white dark:bg-gray-800 shadow-sm text-violet'
                    : 'text-gray-500 hover:text-gray-950 dark:hover:text-gray-100'
                }`}
              >
                7 Jours
              </button>
              <button
                onClick={() => setTimeRange('30days')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeRange === '30days'
                    ? 'bg-white dark:bg-gray-800 shadow-sm text-violet'
                    : 'text-gray-500 hover:text-gray-950 dark:hover:text-gray-100'
                }`}
              >
                30 Jours
              </button>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorConsultations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorValidations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#374151' : '#f3f4f6'} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 'bold' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 'bold' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1f2937' : '#fff', 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                    fontFamily: 'sans-serif',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '15px', fontSize: '11px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="Consultations" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorConsultations)" />
                <Area type="monotone" dataKey="Clics Commande" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorClics)" />
                <Area type="monotone" dataKey="Validations WhatsApp" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValidations)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories / Genre Distribution */}
        <div className={`p-8 rounded-[2.5rem] shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <span className="text-vert text-[9px] font-black uppercase tracking-[0.2em] block mb-1">Distribution</span>
          <h3 className="text-xl font-black mb-8 flex items-center gap-2">
            <Layout className="text-vert w-5 h-5" /> Répartition Générale
          </h3>
          <div className="h-[200px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {categoryData.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-700 dark:text-gray-300 truncate max-w-[150px]">{cat.name}</span>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="text-gray-900 dark:text-gray-100 font-extrabold">{cat.value}</span>
                  <span className="text-gray-400 font-medium">({((cat.value / (books.length || 1)) * 100).toFixed(0)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOOKS POPULARITY RANKING ROW - "Quels livres intéressent le plus vos lecteurs" */}
      <div id="books-popularity-ranking" className={`p-8 rounded-[2.5rem] shadow-sm border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-violet text-[9px] font-black uppercase tracking-[0.2em] block mb-1">Classement</span>
            <h3 className="text-xl font-black flex items-center gap-2">
              <TrendingUp className="text-violet w-5 h-5" /> Les livres qui intéressent le plus vos lecteurs
            </h3>
            <p className="text-xs text-gray-400 font-semibold mt-1">
              Classé par le nombre total d'interactions (Consultation, Clic d'achat, Validation WhatsApp).
            </p>
          </div>
        </div>

        {/* Detailed ranking listing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookRankings.slice(0, 6).map((book, index) => {
            const hasInteractions = book.total > 0;
            const viewPercentage = book.total > 0 ? (book.views / book.total) * 100 : 0;
            const clickPercentage = book.total > 0 ? (book.orderClicks / book.total) * 100 : 0;
            const submitPercentage = book.total > 0 ? (book.orderSubmits / book.total) * 100 : 0;
            const conversionRate = book.orderClicks > 0 ? (book.orderSubmits / book.orderClicks) * 100 : 0;

            return (
              <div 
                key={book.id} 
                className={`p-5 rounded-2xl border ${
                  darkMode ? 'bg-gray-900/40 border-gray-700 hover:bg-gray-900/80' : 'bg-gray-50/50 border-gray-100 hover:bg-gray-50'
                } transition-all relative flex flex-col justify-between`}
              >
                {/* Ranking Badge */}
                <div className="absolute top-4 right-4 flex items-center justify-center w-7 h-7 bg-violet text-white text-[10px] font-black rounded-full shadow-md shadow-violet/20">
                  #{index + 1}
                </div>

                <div>
                  <div className="flex gap-3 items-center mb-4">
                    {book.cover ? (
                      <img 
                        src={book.cover} 
                        alt="Couverture" 
                        className="w-12 h-16 object-cover rounded-md shadow-sm border border-gray-200" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center text-gray-500">
                        <Book className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0 pr-6">
                      <h4 className="font-extrabold text-xs truncate uppercase tracking-wider text-gray-900 dark:text-white" title={book.title}>
                        {book.title}
                      </h4>
                      <span className="inline-block px-1.5 py-0.5 mt-1 bg-violet/10 text-violet rounded text-[8px] font-black uppercase tracking-wider">
                        {book.genre}
                      </span>
                    </div>
                  </div>

                  {/* Interaction Progress Breakdown */}
                  <div className="space-y-2 text-xs font-semibold leading-relaxed mb-4">
                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                      <span>Interactions totales :</span>
                      <span className="font-extrabold text-gray-900 dark:text-white">{book.total} clics</span>
                    </div>
                    
                    {/* Progress stacked bar */}
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden flex">
                      {hasInteractions ? (
                        <>
                          <div style={{ width: `${viewPercentage}%` }} className="bg-blue-500 h-full" title="Consultations" />
                          <div style={{ width: `${clickPercentage}%` }} className="bg-orange-500 h-full" title="Clics Commande" />
                          <div style={{ width: `${submitPercentage}%` }} className="bg-emerald-500 h-full" title="Validations" />
                        </>
                      ) : (
                        <div className="w-full bg-gray-300 dark:bg-gray-700 h-full" />
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-[9px] text-center uppercase font-bold tracking-wider pt-1">
                      <div className="text-blue-500 bg-blue-500/5 p-1 rounded">
                        <span className="block font-black text-[11px]">{book.views}</span> Consult.
                      </div>
                      <div className="text-orange-500 bg-orange-500/5 p-1 rounded">
                        <span className="block font-black text-[11px]">{book.orderClicks}</span> Clics
                      </div>
                      <div className="text-emerald-500 bg-emerald-500/5 p-1 rounded">
                        <span className="block font-black text-[11px]">{book.orderSubmits}</span> Valid.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conversion metrics */}
                <div className={`p-2.5 rounded-xl text-[10px] font-bold flex items-center justify-between mt-2 ${
                  darkMode ? 'bg-gray-950/40 text-gray-400' : 'bg-gray-100/50 text-gray-600'
                }`}>
                  <span className="uppercase tracking-wider">Taux de conversion :</span>
                  <span className="font-extrabold text-violet">
                    {conversionRate > 0 ? `${conversionRate.toFixed(1)}%` : '0%'}
                  </span>
                </div>
              </div>
            );
          })}
          
          {bookRankings.length === 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-gray-400 uppercase tracking-widest text-xs border border-dashed border-gray-200 rounded-2xl">
              Aucun libre disponible pour l'analyse.
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Submissions */}
        <div className={`p-8 rounded-[2.5rem] shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black flex items-center gap-2">
              <FileText className="text-orange-500 w-5 h-5" /> Soumissions Récentes
            </h3>
            <button 
              onClick={() => onTabChange('submissions')}
              className="text-sm font-bold text-violet hover:underline"
            >
              Voir Tout
            </button>
          </div>
          <div className="space-y-6">
            {submissions.slice(0, 5).map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold truncate">{sub.name}</p>
                    <p className="text-xs text-gray-500 truncate">{sub.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    sub.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                    sub.status === 'accepted' ? 'bg-vert/10 text-vert' : 'bg-red-100 text-red-600'
                  }`}>
                    {sub.status}
                  </span>
                  <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
            {submissions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Aucune soumission pour le moment.
              </div>
            )}
          </div>
        </div>

        {/* System Logs */}
        <div className={`p-8 rounded-[2.5rem] shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Clock className="text-gray-400 w-5 h-5" /> Historique d'Activité
            </h3>
          </div>
          <div className="space-y-6">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center gap-4 text-sm">
                <div className="w-2 h-2 rounded-full bg-violet animate-pulse" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">
                    <span className="font-black">{log.userName}</span> {log.action} <span className="font-bold text-violet">{log.entity}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">{new Date(log.timestamp).toLocaleString('fr-FR')}</p>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-center py-12 text-gray-500 italic">
                L'historique est vide.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
