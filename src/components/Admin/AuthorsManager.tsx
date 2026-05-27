import React, { useState } from 'react';
import { 
  Users, Plus, Search, Trash2, Edit2, Upload, 
  UserPlus, Mail, Phone, Info, LayoutGrid, List, Book,
  CheckSquare, RotateCcw, Check, EyeOff, Star
} from 'lucide-react';
import { Author } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

const AUTHOR_PLACEHOLDER = "https://picsum.photos/seed/author/400/400";

import { Modal } from '../ui/Modal';
import { AuthorForm } from './AuthorForm';

interface AuthorsManagerProps {
  authors: Author[];
  onAdd: (data: any) => Promise<void>;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string, noConfirm?: boolean) => Promise<void>;
  darkMode?: boolean;
}

export function AuthorsManager({ authors, onAdd, onUpdate, onDelete, darkMode }: AuthorsManagerProps) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const filteredAuthors = authors.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    (a.bio && a.bio.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleSelection = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedAuthors(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Supprimer ces ${selectedAuthors.length} auteurs définitivement ? Cette action est irréversible.`)) {
      try {
        for (const id of selectedAuthors) {
          await onDelete(id, true);
        }
        setSelectedAuthors([]);
        setIsSelectionMode(false);
        alert("Suppression groupée terminée"); // Simple alert instead of many notifications
      } catch (error) {
        console.error("Bulk delete failed:", error);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedAuthors.length === filteredAuthors.length) {
      setSelectedAuthors([]);
    } else {
      setSelectedAuthors(filteredAuthors.map(a => a.id));
    }
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingAuthor(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Gestion des Auteurs
          </h2>
          <p className="text-sm text-slate-500">
            {authors.length} auteurs répertoriés dans le catalogue
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
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

          <div className="flex items-center gap-2">
            {authors.length > 0 && (
              <button 
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedAuthors([]);
                }}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isSelectionMode 
                    ? 'bg-amber-50 border-amber-200 text-amber-600' 
                    : darkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
                }`}
                title={isSelectionMode ? "Annuler le mode sélection" : "Mode sélection groupée"}
              >
                <CheckSquare className="w-5 h-5" />
              </button>
            )}

            <div className={`p-1 rounded-xl flex ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? (darkMode ? 'bg-slate-700 text-white shadow-lg' : 'bg-white text-violet shadow-sm') : 'text-slate-400'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? (darkMode ? 'bg-slate-700 text-white shadow-lg' : 'bg-white text-violet shadow-sm') : 'text-slate-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isSelectionMode && selectedAuthors.length > 0 ? (
            <button 
              type="button"
              onClick={handleBulkDelete}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-all whitespace-nowrap cursor-pointer animate-in zoom-in-95"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer ({selectedAuthors.length})
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleAdd}
              className="flex items-center gap-2 bg-violet text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-violet/20 hover:scale-[1.02] transition-all whitespace-nowrap cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Nouvel Auteur
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {viewMode === 'grid' ? (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredAuthors.map((author) => (
              <motion.div
                key={author.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => isSelectionMode && toggleSelection(author.id)}
                className={`group relative rounded-2xl border transition-all hover:shadow-xl ${
                  isSelectionMode ? 'cursor-pointer' : ''
                } ${
                  selectedAuthors.includes(author.id)
                    ? 'border-violet ring-4 ring-violet/20 shadow-lg'
                    : darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 hover:border-violet/20'
                }`}
              >
                <div className="aspect-square relative overflow-hidden rounded-t-2xl">
                  {author.isMonthAuthor && (
                    <div className="absolute top-3 left-3 z-20 bg-vert text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg pointer-events-none">
                      Focus Auteur
                    </div>
                  )}
                  {author.isHidden && (
                    <div className={`absolute top-3 ${author.isMonthAuthor ? 'left-[120px]' : 'left-3'} z-20 bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg flex items-center gap-1`}>
                      <EyeOff className="w-2.5 h-2.5" /> Masqué
                    </div>
                  )}
                  {isSelectionMode && (
                    <div className={`absolute top-3 left-3 z-10 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      selectedAuthors.includes(author.id)
                        ? 'bg-violet border-violet text-white'
                        : 'bg-white/40 border-white text-transparent'
                    }`}>
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  <img 
                    src={author.photo || AUTHOR_PLACEHOLDER} 
                    alt={author.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {!isSelectionMode && (
                    <div className="absolute top-3 right-3 flex gap-2 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 md:translate-y-2 md:group-hover:translate-y-0">
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onUpdate(author.id, { isMonthAuthor: !author.isMonthAuthor }); }}
                        className={`p-3 backdrop-blur-sm rounded-xl transition-all shadow-lg active:scale-90 cursor-pointer ${
                          author.isMonthAuthor 
                            ? 'bg-vert text-white' 
                            : 'bg-white/95 text-slate-400 hover:text-vert hover:bg-white'
                        }`}
                        title={author.isMonthAuthor ? "Retirer de la vedette" : "Définir comme auteur du mois"}
                      >
                        <Star className={`w-4 h-4 ${author.isMonthAuthor ? 'fill-current' : ''}`} />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleEdit(author); }}
                        className="p-3 bg-white/95 backdrop-blur-sm rounded-xl text-slate-700 hover:bg-violet hover:text-white transition-all shadow-lg active:scale-90 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDelete(author.id); }}
                        className="p-3 bg-white/95 backdrop-blur-sm rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className={`font-black text-lg mb-1 truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {author.name}
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1">
                      <Book className="w-3 h-3" />
                      Statut: {author.isHidden ? <span className="text-red-500">Masqué</span> : <span className="text-vert">Actif</span>}
                    </span>
                  </div>
                  <p className={`text-sm line-clamp-2 italic ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {author.bio || "Pas de biographie renseignée."}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            layout
            className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}
          >
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[600px] md:min-w-0">
                <thead className={darkMode ? 'bg-slate-900/50' : 'bg-slate-50'}>
                  <tr className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <th className="px-6 py-4 w-10">
                      {isSelectionMode && (
                        <button 
                          onClick={handleSelectAll}
                          className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                            selectedAuthors.length === filteredAuthors.length && filteredAuthors.length > 0
                              ? 'bg-violet border-violet text-white'
                              : 'bg-white border-slate-300 text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </th>
                    <th className="px-6 py-4">Auteur</th>
                    <th className="px-6 py-4 hidden md:table-cell">Bio Short</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredAuthors.map((author) => (
                    <tr 
                      key={author.id} 
                      onClick={() => isSelectionMode && toggleSelection(author.id)}
                      className={`group hover:bg-violet/[0.02] transition-colors ${
                        isSelectionMode ? 'cursor-pointer' : ''
                      } ${selectedAuthors.includes(author.id) ? 'bg-violet/5' : ''}`}
                    >
                      <td className="px-6 py-4">
                        {isSelectionMode && (
                          <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                            selectedAuthors.includes(author.id)
                              ? 'bg-violet border-violet text-white'
                              : 'bg-white border-slate-300 text-transparent'
                          }`}>
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img 
                              src={author.photo || AUTHOR_PLACEHOLDER} 
                              alt="" 
                              className="w-10 h-10 rounded-full object-cover shadow-sm"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              decoding="async"
                            />
                            {author.isMonthAuthor && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-vert rounded-full border-2 border-white dark:border-slate-800" title="Auteur du mois" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{author.name}</span>
                              {author.isHidden && (
                                <span className="bg-red-500/10 text-red-500 text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-1 font-black">
                                  <EyeOff className="w-2 h-2" /> MASQUÉ
                                </span>
                              )}
                            </div>
                            {author.isMonthAuthor && (
                              <span className="text-[9px] font-black uppercase text-vert tracking-wider">Auteur du mois</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <p className={`text-sm italic truncate max-w-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {author.bio || "---"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            type="button"
                            onClick={() => onUpdate(author.id, { isMonthAuthor: !author.isMonthAuthor })}
                            className={`p-3 md:p-2 rounded-xl transition-all active:scale-90 ${
                              author.isMonthAuthor 
                                ? 'bg-vert text-white' 
                                : `${darkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-vert' : 'hover:bg-vert/10 text-slate-400 hover:text-vert'}`
                            }`}
                            title={author.isMonthAuthor ? "Retirer de la vedette" : "Définir comme auteur du mois"}
                          >
                            <Star className={`w-4 h-4 ${author.isMonthAuthor ? 'fill-current' : ''}`} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleEdit(author)}
                            className={`p-3 md:p-2 rounded-xl transition-all ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'} active:scale-90`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => onDelete(author.id)}
                            className="p-3 md:p-2 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-500 transition-all active:scale-90"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredAuthors.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-bold italic">Aucun auteur trouvé</h3>
          <p className="text-sm">Essayez un autre mot-clé ou ajoutez un nouvel auteur.</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAuthor ? "Modifier l'Auteur" : "Nouvel Auteur"}
        subtitle={editingAuthor ? "Mettez à jour les informations du profil" : "Créez une nouvelle fiche auteur pour le catalogue"}
        icon={<UserPlus className="w-6 h-6 text-violet" />}
      >
        <AuthorForm 
          initialData={editingAuthor}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={async (data) => {
            try {
              if (editingAuthor) {
                await onUpdate(editingAuthor.id, data);
              } else {
                await onAdd(data);
              }
              setIsModalOpen(false);
            } catch (error) {
              console.error("Operation failed:", error);
              // Notification is usually handled by the parent's handleFirestoreError
              // but we catch it here to prevent closing the modal on error
            }
          }}
        />
      </Modal>
    </div>
  );
}
