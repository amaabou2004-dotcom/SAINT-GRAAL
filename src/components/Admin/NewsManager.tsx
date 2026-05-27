import React, { useState } from 'react';
import { 
  Newspaper, Plus, Search, Trash2, Edit2, Upload, 
  Calendar, Megaphone, Share2, Eye, LayoutGrid, List
} from 'lucide-react';
import { NewsItem } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

import { Modal } from '../ui/Modal';
import { NewsForm } from './NewsForm';

interface NewsManagerProps {
  news: NewsItem[];
  onAdd: (data: any) => Promise<void>;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onNotify: (item: NewsItem) => void;
  darkMode?: boolean;
}

export function NewsManager({ news, onAdd, onUpdate, onDelete, onNotify, darkMode }: NewsManagerProps) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);

  const filteredNews = news.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (item: NewsItem) => {
    setEditingNews(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingNews(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Actualités & Annonces
          </h2>
          <p className="text-sm text-slate-500">
            Gérez les publications et les communications de la maison d'édition
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none transition-all ${
                darkMode 
                  ? 'bg-slate-800 border-slate-700 text-white focus:ring-2 focus:ring-violet/50' 
                  : 'bg-white border border-slate-200 focus:border-violet'
              }`}
            />
          </div>
          <button 
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 bg-violet text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-violet/20 hover:scale-[1.02] transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Actu
          </button>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 gap-4">
          {filteredNews.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`overflow-hidden rounded-2xl border transition-all hover:shadow-lg flex flex-col md:flex-row ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
              }`}
            >
            {item.image && (
              <div className="md:w-64 h-48 md:h-auto overflow-hidden shrink-0">
                <img 
                  src={item.image} 
                  alt="" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )}
              
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      <Calendar className="w-3 h-3 text-violet" />
                      {new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                    <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {item.title}
                    </h3>
                  </div>
                  
                  <div className="flex gap-2 shrink-0">
                    <button 
                      type="button"
                      onClick={() => onNotify(item)}
                      title="Partager aux abonnés"
                      className="p-3 bg-violet/10 text-violet rounded-xl hover:bg-violet hover:text-white transition-all active:scale-90"
                    >
                      <Megaphone className="w-5 h-5 md:w-4 md:h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-violet hover:text-white transition-all dark:bg-slate-700 active:scale-90"
                    >
                      <Edit2 className="w-5 h-5 md:w-4 md:h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="p-3 bg-slate-100 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all dark:bg-slate-700 active:scale-90"
                    >
                      <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>

                <p className={`text-sm leading-relaxed mb-6 line-clamp-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {item.content}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                      <Eye className="w-4 h-4" />
                       {/* Mock view count or could be real status */}
                      Public
                    </div>
                  </div>
                  <button className="text-xs font-black text-violet uppercase tracking-widest hover:underline flex items-center gap-1">
                    Voir sur le site
                    <Share2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {filteredNews.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <Newspaper className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-bold italic">Aucune actualité trouvée</h3>
          <p className="text-sm">Diffusez une nouvelle annonce en cliquant sur "Nouvelle Actu".</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNews ? "Modifier l'Actualité" : "Nouvelle Actualité"}
        subtitle={editingNews ? "Mettez à jour le contenu de votre article" : "Rédigez une annonce pour vos lecteurs et abonnés"}
        icon={<Newspaper className="w-6 h-6 text-violet" />}
      >
        <NewsForm 
          initialData={editingNews}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={async (data) => {
            try {
              if (editingNews) {
                await onUpdate(editingNews.id, data);
              } else {
                await onAdd(data);
              }
              setIsModalOpen(false);
            } catch (error) {
              console.error("Operation failed:", error);
            }
          }}
        />
      </Modal>
    </div>
  );
}
