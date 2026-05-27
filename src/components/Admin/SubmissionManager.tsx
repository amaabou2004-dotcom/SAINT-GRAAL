import React, { useState } from 'react';
import { 
  FileText, Download, CheckCircle, XCircle, 
  Clock, Search, MessageSquare, MoreVertical, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Submission, SubmissionStatus } from '../../types';

interface SubmissionManagerProps {
  submissions: Submission[];
  onUpdate: (id: string, updates: Partial<Submission>) => void;
  onDelete: (id: string) => void;
  darkMode: boolean;
}

export const SubmissionManager: React.FC<SubmissionManagerProps> = ({
  submissions, onUpdate, onDelete, darkMode
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<SubmissionStatus | 'all'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const filtered = submissions.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || s.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusStyle = (status: SubmissionStatus) => {
    switch (status) {
      case 'accepted': return 'bg-vert/10 text-vert';
      case 'refused': return 'bg-red-50 text-red-500';
      default: return 'bg-orange-50 text-orange-500';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black">Manuscrits Reçus</h2>
          <p className="text-sm text-gray-500">Gérez les soumissions des auteurs et suivez l'état du comité de lecture.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* List View */}
        <div className={`flex-1 rounded-[2.5rem] border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm flex flex-col`}>
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-2xl border-2 outline-none transition-all ${
                  darkMode ? 'bg-gray-900 border-gray-700 focus:border-violet' : 'bg-gray-50 border-gray-50 focus:border-violet'
                }`}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['all', 'pending', 'accepted', 'refused'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all active:scale-95 ${
                    activeFilter === filter 
                      ? 'bg-violet text-white shadow-lg shadow-violet/20' 
                      : 'bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-400'
                  }`}
                >
                  {filter === 'all' ? 'Toutes' : filter}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[600px] overflow-y-auto custom-scrollbar flex-1">
            {filtered.map((sub) => (
              <div 
                key={sub.id}
                onClick={() => {
                  setSelectedSubmission(sub);
                  // On mobile, scroll to details
                  if (window.innerWidth < 1024) {
                    setTimeout(() => document.getElementById('submission-details')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }
                }}
                className={`p-6 border-b last:border-0 cursor-pointer transition-all ${
                  selectedSubmission?.id === sub.id 
                    ? 'bg-violet/5 border-l-4 border-l-violet' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                } ${darkMode ? 'border-gray-700' : 'border-gray-50'}`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black">{sub.name}</h4>
                      <p className="text-xs text-gray-500 line-clamp-1">{sub.email}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(sub.status)}`}>
                    {sub.status}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(sub.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {sub.fileName}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-24 text-center text-gray-500 font-bold">
                Aucune soumission trouvée
              </div>
            )}
          </div>
        </div>

        {/* Detail View */}
        <AnimatePresence mode="wait">
          {selectedSubmission ? (
            <motion.div 
              key={selectedSubmission.id}
              id="submission-details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`w-full lg:w-1/3 rounded-[2.5rem] border p-8 flex flex-col space-y-8 h-fit lg:sticky lg:top-24 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black">Détails de Soumission</h3>
                  <p className="text-sm text-gray-500">ID: {selectedSubmission.id}</p>
                </div>
                <button onClick={() => setSelectedSubmission(null)} className="p-2 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Coordonnées</p>
                    <p className="font-bold">{selectedSubmission.phone}</p>
                    <p className="text-sm">{selectedSubmission.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Message de l'auteur</p>
                    <p className="text-sm italic text-gray-600 dark:text-gray-400">"{selectedSubmission.message}"</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Actions Manuscrit</p>
                  <a 
                    href={selectedSubmission.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full p-4 bg-violet text-white rounded-2xl font-bold shadow-lg shadow-violet/20 hover:scale-[1.02] transition-all"
                  >
                    <Download className="w-5 h-5" /> Télécharger le Manuscrit
                  </a>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => onUpdate(selectedSubmission.id, { status: 'accepted' })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-2xl font-bold text-xs border-2 transition-all ${
                        selectedSubmission.status === 'accepted' ? 'border-vert bg-vert text-white' : 'border-gray-100 dark:border-gray-700 hover:border-vert text-vert'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" /> Accepter
                    </button>
                    <button 
                      onClick={() => onUpdate(selectedSubmission.id, { status: 'refused' })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-2xl font-bold text-xs border-2 transition-all ${
                        selectedSubmission.status === 'refused' ? 'border-red-500 bg-red-500 text-white' : 'border-gray-100 dark:border-gray-700 hover:border-red-500 text-red-500'
                      }`}
                    >
                      <XCircle className="w-4 h-4" /> Refuser
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Commentaire Interne</p>
                  <textarea 
                    placeholder="Notes pour l'équipe..."
                    value={selectedSubmission.internalComment || ""}
                    onChange={(e) => onUpdate(selectedSubmission.id, { internalComment: e.target.value })}
                    className={`w-full p-4 rounded-2xl border-2 outline-none text-sm min-h-[100px] resize-none ${
                       darkMode ? 'bg-gray-900 border-gray-700 focus:border-violet' : 'bg-gray-50 border-gray-50 focus:border-violet'
                    }`}
                  />
                </div>

                <button 
                  onClick={() => {
                    if (window.confirm("Supprimer cette soumission ?")) {
                      onDelete(selectedSubmission.id);
                      setSelectedSubmission(null);
                    }
                  }}
                  className="flex items-center justify-center gap-2 w-full p-3 text-red-400 hover:text-red-500 text-xs font-bold transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Supprimer définitivement
                </button>
              </div>
            </motion.div>
          ) : (
            <div className={`hidden lg:flex flex-1 rounded-[2.5rem] border border-dashed flex-col items-center justify-center text-gray-400 space-y-4 p-12 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 opacity-20" />
              </div>
              <p className="font-bold text-center max-w-[200px]">Sélectionnez un manuscrit pour voir les détails et agir</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
