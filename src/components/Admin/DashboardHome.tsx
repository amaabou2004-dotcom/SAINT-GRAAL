import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Book, Users, FileText, Mail, ArrowUpRight, ArrowDownRight, 
  Clock, CheckCircle, AlertCircle, MoreVertical, ExternalLink,
  Plus, Newspaper, Users2, Activity, Layout, Image as ImageIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { BookItem, Author, Submission, ContactMessage, AdminLog, NewsItem } from '../../types';

interface DashboardHomeProps {
  books: BookItem[];
  authors: Author[];
  submissions: Submission[];
  messages: ContactMessage[];
  logs: AdminLog[];
  news: NewsItem[];
  darkMode: boolean;
  onTabChange: (tab: string, action?: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  books, authors, submissions, messages, logs, news, darkMode, onTabChange
}) => {
  const stats = [
    { id: 'books', label: 'Livres', value: books.length, icon: Book, color: 'bg-violet', trend: '+12%' },
    { id: 'authors', label: 'Auteurs', value: authors.length, icon: Users, color: 'bg-blue-500', trend: '+5%' },
    { id: 'submissions', label: 'Manuscrits', value: submissions.length, icon: FileText, color: 'bg-vert', trend: '+18%' },
    { id: 'messages', label: 'Messages', value: messages.length, icon: Mail, color: 'bg-orange-500', trend: '-2%' },
  ];

  // Mock data for charts - in real app, derive from collections
  const activityData = [
    { name: 'Lun', views: 400, publish: 240 },
    { name: 'Mar', views: 300, publish: 139 },
    { name: 'Mer', views: 200, publish: 980 },
    { name: 'Jeu', views: 278, publish: 390 },
    { name: 'Ven', views: 189, publish: 480 },
    { name: 'Sam', views: 239, publish: 380 },
    { name: 'Dim', views: 349, publish: 430 },
  ];

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
          <h1 className="text-3xl font-black tracking-tight uppercase">Vue d'ensemble</h1>
          <p className="text-gray-500 dark:text-gray-400">Bienvenue sur votre tableau de bord de gestion.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors cursor-pointer"
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
            onClick={() => onTabChange(stat.id)}
            className={`p-6 rounded-[2rem] shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} hover:shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden group cursor-pointer`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.color} opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`} />
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} bg-opacity-10 dark:bg-opacity-20 rounded-2xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend.startsWith('+') ? 'text-vert' : 'text-red-500'}`}>
                {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-black mt-1 leading-none">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className={`lg:col-span-2 p-8 rounded-[2.5rem] shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Activity className="text-violet" /> Activité de Publication
            </h3>
            <select className={`bg-gray-50 dark:bg-gray-900 border-0 outline-none p-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all`}>
              <option>7 Derniers Jours</option>
              <option>30 Derniers Jours</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#374151' : '#f3f4f6'} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1f2937' : '#fff', 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                <Area type="monotone" dataKey="publish" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories / Pie Chart */}
        <div className={`p-8 rounded-[2.5rem] shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <h3 className="text-xl font-black mb-8 flex items-center gap-2">
            <Layout className="text-vert" /> Par Catégorie
          </h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
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
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="font-bold">{cat.name}</span>
                </div>
                <span className="text-gray-500">{((cat.value / 1200) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <div className={`p-8 rounded-[2.5rem] shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black flex items-center gap-2">
              <FileText className="text-orange-500" /> Soumissions Récentes
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
              <Clock className="text-gray-400" /> Historique d'Activité
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
