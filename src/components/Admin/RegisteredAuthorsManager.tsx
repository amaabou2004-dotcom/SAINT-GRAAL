import React, { useState } from 'react';
import { 
  User, Shield, ShieldOff, Trash2, Search, 
  Mail, Phone, Clock, Wifi, WifiOff, FileText, CheckCircle,
  CheckSquare, Check, LayoutGrid, List
} from 'lucide-react';
import { RegisteredAuthor } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface RegisteredAuthorsManagerProps {
  authors: RegisteredAuthor[];
  onUpdate: (id: string, updates: Partial<RegisteredAuthor>) => void;
  onDelete: (id: string, noConfirm?: boolean) => void;
  darkMode: boolean;
}

const AUTHOR_PLACEHOLDER = "https://picsum.photos/seed/author/400/400";

export const RegisteredAuthorsManager: React.FC<RegisteredAuthorsManagerProps> = ({
  authors, onUpdate, onDelete, darkMode
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const filtered = authors.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         a.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || a.status === filter;
    return matchesSearch && matchesFilter;
  });

  const toggleSelection = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Supprimer ces ${selectedIds.length} comptes définitivement ?`)) {
      try {
        for (const id of selectedIds) {
          await onDelete(id, true);
        }
        setSelectedIds([]);
        setIsSelectionMode(false);
        alert("Suppression groupée terminée");
      } catch (error) {
        console.error("Bulk delete registered authors failed:", error);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(a => a.id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black">Comptes Auteurs (Espace Privé)</h2>
          <p className="text-sm text-gray-500">Gérez les accès à l'espace membre et modérez les utilisateurs inscrits.</p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {isSelectionMode && selectedIds.length > 0 ? (
            <button 
              onClick={handleBulkDelete}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-all cursor-pointer animate-in zoom-in-95"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer ({selectedIds.length})
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedIds([]);
                }}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  isSelectionMode 
                    ? 'bg-amber-50 border-amber-100 text-amber-600' 
                    : darkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-50 text-gray-400'
                }`}
                title="Séléction groupée"
              >
                <CheckSquare className="w-5 h-5" />
              </button>
              <div className={`p-1 rounded-xl flex ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? (darkMode ? 'bg-gray-700 text-white shadow-lg' : 'bg-white text-violet shadow-sm') : 'text-gray-400'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? (darkMode ? 'bg-gray-700 text-white shadow-lg' : 'bg-white text-violet shadow-sm') : 'text-gray-400'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`rounded-[2.5rem] border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm`}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher un membre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 rounded-2xl border-2 outline-none transition-all ${
                darkMode ? 'bg-gray-900 border-gray-700 focus:border-violet' : 'bg-gray-50 border-gray-50 focus:border-violet'
              }`}
            />
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'active', 'blocked'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f 
                    ? 'bg-violet text-white' 
                    : 'bg-gray-50 text-gray-400 dark:bg-gray-900'
                }`}
              >
                {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : 'Bloqués'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {viewMode === 'list' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50">
                  <th className="p-6 w-10">
                    {isSelectionMode && (
                      <button 
                        onClick={handleSelectAll}
                        className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                          selectedIds.length === filtered.length && filtered.length > 0
                            ? 'bg-violet border-violet text-white'
                            : 'bg-white border-gray-300 text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                  </th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Membre</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Statut</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Infos</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((author) => (
                  <tr 
                    key={author.id} 
                    onClick={() => isSelectionMode && toggleSelection(author.id)}
                    className={`border-b last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors ${
                      darkMode ? 'border-gray-700' : 'border-gray-50'
                    } ${isSelectionMode ? 'cursor-pointer' : ''} ${selectedIds.includes(author.id) ? 'bg-violet/5' : ''}`}
                  >
                    <td className="p-6">
                      {isSelectionMode && (
                        <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                          selectedIds.includes(author.id)
                            ? 'bg-violet border-violet text-white'
                            : 'bg-white border-gray-300 text-transparent'
                        }`}>
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={author.photo || AUTHOR_PLACEHOLDER} 
                            alt="" 
                            className="w-12 h-12 rounded-2xl object-cover shadow-sm"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${darkMode ? 'border-gray-800' : 'border-white'} ${author.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}>
                            {author.isOnline ? <Wifi className="w-2 h-2 text-white m-auto" /> : <WifiOff className="w-2 h-2 text-white m-auto" />}
                          </div>
                        </div>
                        <div>
                          <p className="font-bold">{author.name}</p>
                          <p className="text-xs text-gray-500">{author.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        author.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {author.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                          <Clock className="w-3 h-3" /> Inscrit le {new Date(author.createdAt).toLocaleDateString()}
                        </div>
                        {author.phone && (
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                            <Phone className="w-3 h-3" /> {author.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      {!isSelectionMode && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onUpdate(author.id, { status: author.status === 'active' ? 'blocked' : 'active' }); }}
                            title={author.status === 'active' ? "Bloquer l'accès" : "Réactiver l'accès"}
                            className={`p-3 md:p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
                              author.status === 'active' 
                                ? 'text-orange-500 bg-orange-50 md:bg-transparent' 
                                : 'text-green-500 bg-green-50 md:bg-transparent'
                            }`}
                          >
                            {author.status === 'active' ? <ShieldOff className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(author.id); }}
                            className="p-3 md:p-2 text-red-500 bg-red-50 md:bg-transparent rounded-xl transition-all active:scale-95 cursor-pointer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((author) => (
                <div 
                  key={author.id}
                  onClick={() => isSelectionMode && toggleSelection(author.id)}
                  className={`p-6 rounded-[2rem] border transition-all relative ${
                    isSelectionMode ? 'cursor-pointer' : ''
                  } ${
                    selectedIds.includes(author.id) 
                      ? 'border-violet bg-violet/5 ring-4 ring-violet/10' 
                      : darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50/50 border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <img 
                        src={author.photo || AUTHOR_PLACEHOLDER} 
                        alt="" 
                        className="w-16 h-16 rounded-2xl object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {isSelectionMode && (
                        <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                          selectedIds.includes(author.id) 
                            ? 'bg-violet border-violet text-white' 
                            : 'bg-white/50 border-white text-transparent'
                        }`}>
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 ${darkMode ? 'border-gray-900' : 'border-gray-50'} ${author.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                    {!isSelectionMode && (
                      <div className="flex gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onUpdate(author.id, { status: author.status === 'active' ? 'blocked' : 'active' }); }}
                          className={`p-2 rounded-xl transition-all ${author.status === 'active' ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}
                        >
                          {author.status === 'active' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(author.id); }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg">{author.name}</h3>
                  <p className="text-xs text-gray-500 mb-4">{author.email}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                      <Clock className="w-3 h-3" /> Membre depuis {new Date(author.createdAt).toLocaleDateString()}
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      author.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {author.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {filtered.length === 0 && (
            <div className="py-24 text-center">
              <User className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-bold italic">Aucun membre trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
