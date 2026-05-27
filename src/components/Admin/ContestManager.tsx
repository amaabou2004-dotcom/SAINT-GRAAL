import React, { useState } from 'react';
import { 
  Trophy, Plus, Trash2, Edit3, Calendar, 
  MapPin, Clock, Award, Users, AlertCircle, X, Image as ImageIcon, Loader2
} from 'lucide-react';
import { Contest } from '../../types';
import { compressImage } from '../../lib/utils';

interface ContestManagerProps {
  contests: Contest[];
  onAdd: (data: Omit<Contest, 'id' | 'createdAt'>) => Promise<void>;
  onUpdate: (id: string, data: Partial<Contest>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  darkMode: boolean;
}

export const ContestManager: React.FC<ContestManagerProps> = ({
  contests, onAdd, onUpdate, onDelete, darkMode
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'draft'>('all');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rules: '',
    prize: '',
    deadline: '',
    status: 'active' as 'active' | 'completed' | 'draft',
    participantsCount: 0
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("L'image est trop volumineuse (max 5MB).");
        return;
      }

      setIsCompressing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const compressed = await compressImage(base64, 800, 0.6);
          setPreview(compressed);
        } catch (err) {
          console.error("Image compression error:", err);
          setPreview(reader.result as string);
        } finally {
          setIsCompressing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = () => {
    setEditingContest(null);
    setPreview(null);
    setFormData({
      title: '',
      description: '',
      rules: '',
      prize: '',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ahead by default
      status: 'active',
      participantsCount: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (contest: Contest) => {
    setEditingContest(contest);
    setPreview(contest.image || null);
    setFormData({
      title: contest.title,
      description: contest.description,
      rules: contest.rules || '',
      prize: contest.prize,
      deadline: contest.deadline,
      status: contest.status,
      participantsCount: contest.participantsCount || 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submissionData = {
      ...formData,
      title: formData.title.trim() || "Concours Littéraire",
      description: formData.description.trim() || "Description à venir.",
      prize: formData.prize.trim() || "À déterminer",
      deadline: formData.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      image: preview || ''
    };

    try {
      if (editingContest) {
        await onUpdate(editingContest.id, submissionData);
      } else {
        await onAdd(submissionData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Voulez-vous supprimer définitivement ce concours ? Toutes les données associées seront perdues.")) {
      await onDelete(id);
    }
  };

  const filteredContests = contests.filter(c => {
    if (statusFilter === 'all') return true;
    return c.status === statusFilter;
  });

  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    draft: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
  };

  const statusLabels = {
    active: 'En cours',
    completed: 'Terminé',
    draft: 'Brouillon'
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-gray-900 dark:text-white-80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-violet dark:text-violet">Espace Concours</h1>
          <p className="text-gray-500 dark:text-gray-400">Gérez les grands prix littéraires et concours de Saint Graal Ivoirien.</p>
        </div>
        
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-6 py-4 bg-violet text-white font-black uppercase text-xs tracking-wider rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-violet/15 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Créer un Concours
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'active', 'completed', 'draft'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
              statusFilter === tab 
                ? 'bg-violet text-white border-transparent shadow-lg shadow-violet/10' 
                : darkMode 
                  ? 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white' 
                  : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tab === 'all' ? 'Tous' : statusLabels[tab]}
          </button>
        ))}
      </div>

      {/* Contests Grid */}
      {filteredContests.length === 0 ? (
        <div className={`p-16 text-center rounded-[2.5rem] border ${darkMode ? 'bg-gray-800/40 border-gray-700/60' : 'bg-gray-50/50 border-gray-100'} flex flex-col items-center justify-center space-y-4`}>
          <div className="w-16 h-16 bg-violet/10 text-violet rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-extrabold text-lg text-gray-700 dark:text-gray-300">Aucun concours disponible</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto font-semibold">
              Vous n'avez pas encore publié de concours correspondant à cette catégorie. Créez-en un pour inspirer les auteurs !
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredContests.map(contest => (
            <div 
              key={contest.id}
              className={`p-6 rounded-[2.5rem] border flex flex-col justify-between transition-all duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700/65 hover:border-violet/40' : 'bg-white border-gray-100 hover:border-violet/20 hover:shadow-xl hover:shadow-gray-100/40'
              }`}
            >
              <div>
                {/* Contest Banner Image */}
                {contest.image ? (
                  <img 
                    src={contest.image} 
                    alt={contest.title} 
                    className="w-full h-40 object-cover rounded-[1.75rem] mb-5 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={`w-full h-40 rounded-[1.75rem] mb-5 flex items-center justify-center ${
                    darkMode ? 'bg-gray-900' : 'bg-violet/5'
                  }`}>
                    <Trophy className="w-12 h-12 text-violet opacity-40" />
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${statusColors[contest.status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[contest.status]}
                  </span>
                  
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#F28C28] flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> {contest.prize}
                  </span>
                </div>

                <h3 className="text-xl font-black pr-4 truncate-2-lines mb-3" title={contest.title}>{contest.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed mb-6 font-semibold whitespace-pre-line">
                  {contest.description}
                </p>
              </div>

              <div>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-red-500 font-extrabold uppercase tracking-wide">
                    <Calendar className="w-3.5 h-3.5" /> Limite: {new Date(contest.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  {contest.participantsCount !== undefined && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 font-bold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-violet" /> {contest.participantsCount} cand.
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button 
                    onClick={() => handleOpenEditModal(contest)}
                    className="p-3 bg-violet/5 hover:bg-violet hover:text-white text-violet rounded-xl transition-all cursor-pointer"
                    title="Modifier"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(contest.id)}
                    className="p-3 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className={`w-full max-w-xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl border ${
              darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-950'
            } max-h-[92vh] flex flex-col relative`}
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-black text-violet mb-2">{editingContest ? "Modifier le Concours" : "Nouveau Concours"}</h2>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Planifiez ou publiez un grand prix ou un concours d'écriture pour stimuler l'excellence.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Titre du concours</label>
                <input 
                  type="text"
                  placeholder="Ex: Grand Prix de la Rentrée Littéraire"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-violet outline-none transition-all font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Dotation / Prix</label>
                  <input 
                    type="text"
                    placeholder="Ex: 500 000 CFA + Publication"
                    value={formData.prize}
                    onChange={e => setFormData({...formData, prize: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-violet outline-none transition-all font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Date Limite de dépôt</label>
                  <input 
                    type="date"
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-violet outline-none transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Statut *</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-violet outline-none transition-all font-semibold appearance-none"
                  >
                    <option value="active">En cours</option>
                    <option value="completed">Terminé</option>
                    <option value="draft">Brouillon</option>
                  </select>
                </div>
                <div className="space-y-1 border-gray-100">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Participants Estimés / Actuels</label>
                  <input 
                    type="number"
                    min={0}
                    value={formData.participantsCount}
                    onChange={e => setFormData({...formData, participantsCount: parseInt(e.target.value) || 0})}
                    className="w-full px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-violet outline-none transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Description générale du concours</label>
                <textarea 
                  rows={3}
                  placeholder="Décrivez l'enjeu du concours, les thèmes imposés et le public ciblé..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-violet outline-none transition-all font-semibold resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Règlement et Conditions de participation</label>
                <textarea 
                  rows={3}
                  placeholder="Éligibilité, nombre de mots, format manuscrit, frais de participation éventuels..."
                  value={formData.rules}
                  onChange={e => setFormData({...formData, rules: e.target.value})}
                  className="w-full px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-violet outline-none transition-all font-semibold resize-none"
                />
              </div>

              {/* Banner Upload */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Image du Concours</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col justify-center">
                    <input 
                      type="file" 
                      accept="image/*"
                      id="contest-banner"
                      onChange={handleImageChange}
                      className="hidden" 
                    />
                    <label 
                      htmlFor="contest-banner"
                      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-violet/40 rounded-xl cursor-pointer transition-colors hover:bg-violet/[0.01]"
                    >
                      {isCompressing ? (
                        <div className="flex flex-col items-center gap-2 text-violet">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="text-[10px] font-extrabold uppercase">Traitement...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <ImageIcon className="w-6 h-6" />
                          <span className="text-[10px] font-extrabold uppercase text-center">Sélectionner Photo (Affiche)</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {preview ? (
                    <div className="relative rounded-xl overflow-hidden shadow-md h-28 border border-gray-100">
                      <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setPreview(null)}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white hover:bg-black rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-100 dark:border-gray-800 rounded-xl h-28 flex items-center justify-center text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Pas d'image sélectionnée
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 font-black uppercase text-xs tracking-wider transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-violet hover:bg-violet-dark text-white rounded-xl font-black uppercase text-xs tracking-wider transition-all cursor-pointer"
                >
                  {editingContest ? "Mettre à jour" : "Créer le Concours"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
