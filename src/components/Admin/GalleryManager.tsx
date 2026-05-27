import React, { useState } from 'react';
import { 
  Image as ImageIcon, Plus, Search, Trash2, Upload, 
  Maximize2, Calendar, LayoutGrid, Layout
} from 'lucide-react';
import { GalleryItem } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface GalleryManagerProps {
  gallery: GalleryItem[];
  onAdd: (data: Partial<GalleryItem>) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<GalleryItem>) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => void;
  darkMode?: boolean;
}

export function GalleryManager({ gallery, onAdd, onDelete, onUpdate, handleImageUpload, darkMode }: GalleryManagerProps) {
  const [search, setSearch] = useState("");

  const filteredGallery = gallery.filter(item => 
    item.caption.toLowerCase().includes(search.toLowerCase())
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e, (url) => {
      onAdd({
        url,
        caption: "Nouvelle image",
        date: new Date().toISOString()
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Médiathèque
          </h2>
          <p className="text-sm text-slate-500">
            Gérez la galerie photo et les visuels de vos événements
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher par légende..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none transition-all ${
                darkMode 
                  ? 'bg-slate-800 border-slate-700 text-white focus:ring-2 focus:ring-violet/50' 
                  : 'bg-white border border-slate-200 focus:border-violet'
              }`}
            />
          </div>
          <label className="flex items-center gap-2 bg-vert text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-vert/20 hover:scale-[1.02] transition-all whitespace-nowrap cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Ajouter Photos</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={onFileChange}
              multiple
            />
          </label>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredGallery.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                darkMode ? 'bg-slate-800 border-slate-700 hover:border-violet/50' : 'bg-white border-slate-100 hover:border-violet/30 shadow-sm'
              }`}
            >
              {item.url && (
                <img 
                  src={item.url} 
                  alt="" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute top-2 right-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => onDelete(item.id)}
                  className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                <input 
                  type="text"
                  placeholder="Ajouter une légende..."
                  value={item.caption}
                  onChange={(e) => onUpdate(item.id, { caption: e.target.value })}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-2 py-1.5 text-[10px] text-white placeholder-white/60 outline-none"
                />
              </div>

              <div className="absolute top-2 left-2 p-1.5 bg-black/40 backdrop-blur-sm rounded-lg text-white/60 group-hover:text-white transition-colors">
                <div className="flex items-center gap-1 text-[8px] font-black uppercase">
                  <Calendar className="w-2.5 h-2.5" />
                  {new Date(item.date).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {filteredGallery.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-bold italic">Galerie vide</h3>
          <p className="text-sm">Importez vos premières photos pour alimenter la médiathèque.</p>
        </div>
      )}
    </div>
  );
}
