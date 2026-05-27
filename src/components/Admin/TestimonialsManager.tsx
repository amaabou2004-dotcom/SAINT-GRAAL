import React, { useState } from 'react';
import { 
  MessageSquare, Plus, Search, Trash2, Edit2, Star, 
  Quote, Calendar, Target, User
} from 'lucide-react';
import { Testimonial } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

import { Modal } from '../ui/Modal';
import { TestimonialForm } from './TestimonialForm';

interface TestimonialsManagerProps {
  testimonials: Testimonial[];
  onAdd: (data: any) => Promise<void>;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  darkMode?: boolean;
}

export function TestimonialsManager({ testimonials, onAdd, onUpdate, onDelete, darkMode }: TestimonialsManagerProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const filtered = testimonials.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (item: Testimonial) => {
    setEditingTestimonial(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingTestimonial(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Avis & Témoignages
          </h2>
          <p className="text-sm text-slate-500">
            Validez et affichez les retours de vos lecteurs sur le site
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
                  ? 'bg-slate-800 border-slate-700 text-white' 
                  : 'bg-white border border-slate-200 focus:border-violet'
              }`}
            />
          </div>
          <button 
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 bg-violet text-white px-4 py-2 rounded-xl font-bold hover:scale-[1.02] transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Ajouter Avis
          </button>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`p-6 rounded-2xl border transition-all ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 hover:shadow-lg'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100">
                    {item.photo ? (
                      <img src={item.photo} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.role}</p>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-3 h-3 ${s <= item.rating ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} />
                  ))}
                </div>
              </div>

              <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 w-4 h-4 text-violet/20" />
                <p className={`text-sm italic leading-relaxed pl-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  "{item.content}"
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.date).toLocaleDateString('fr-FR')}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="p-2 hover:bg-violet/10 hover:text-violet rounded-lg transition-colors text-slate-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-slate-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-bold italic">Aucun témoignage</h3>
          <p className="text-sm">Cliquez sur « Ajouter Avis » pour publier le premier retour lecteur.</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTestimonial ? "Modifier l'Avis" : "Ajouter un Avis"}
        subtitle="Partagez les retours positifs de vos lecteurs pour inspirer confiance"
        icon={<Star className="w-6 h-6 text-yellow-400 fill-current" />}
      >
        <TestimonialForm 
          initialData={editingTestimonial}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={async (data) => {
            if (editingTestimonial) {
              await onUpdate(editingTestimonial.id, data);
            } else {
              await onAdd(data);
            }
            setIsModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
