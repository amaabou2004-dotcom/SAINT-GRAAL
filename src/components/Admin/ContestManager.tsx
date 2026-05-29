import React, { useState } from 'react';
import { 
  Trophy, Plus, Trash2, Edit3, Calendar, 
  MapPin, Clock, Award, Users, AlertCircle, X, Image as ImageIcon, Loader2,
  FileText, Download, CheckCircle, XCircle, Search, Eye, MessageSquare
} from 'lucide-react';
import { Contest, ContestSubmission } from '../../types';
import { compressImage } from '../../lib/utils';

interface ContestManagerProps {
  contests: Contest[];
  onAdd: (data: Omit<Contest, 'id' | 'createdAt'>) => Promise<void>;
  onUpdate: (id: string, data: Partial<Contest>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  contestSubmissions?: ContestSubmission[];
  onUpdateSubmission?: (id: string, updates: Partial<ContestSubmission>) => Promise<void>;
  onDeleteSubmission?: (id: string) => Promise<void>;
  darkMode: boolean;
}

export const ContestManager: React.FC<ContestManagerProps> = ({
  contests, onAdd, onUpdate, onDelete,
  contestSubmissions = [], onUpdateSubmission, onDeleteSubmission,
  darkMode
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'draft'>('all');

  // Sub Tab & Contest Submission States
  const [activeSubTab, setActiveSubTab] = useState<'contests' | 'submissions'>('contests');
  const [subSearchTerm, setSubSearchTerm] = useState("");
  const [subStatusFilter, setSubStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'refused'>('all');
  const [selectedSub, setSelectedSub] = useState<ContestSubmission | null>(null);
  const [internalCommentInput, setInternalCommentInput] = useState("");

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

  const handleOpenSubDetail = (sub: ContestSubmission) => {
    setSelectedSub(sub);
    setInternalCommentInput(sub.internalComment || "");
  };

  const handleSaveSubUpdate = async (subId: string, status: 'pending' | 'accepted' | 'refused') => {
    if (!onUpdateSubmission) return;
    await onUpdateSubmission(subId, {
      status,
      internalComment: internalCommentInput
    });
    setSelectedSub(prev => prev && prev.id === subId ? { ...prev, status, internalComment: internalCommentInput } : prev);
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
          <p className="text-gray-500 dark:text-gray-400">Gérez les grands prix littéraires et les manuscrits soumis en compétition.</p>
        </div>
        
        {activeSubTab === 'contests' && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-6 py-4 bg-violet text-white font-black uppercase text-xs tracking-wider rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-violet/15 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Créer un Concours
          </button>
        )}
      </div>

      {/* Sub Tabs Toggle */}
      <div className="flex border-b border-gray-150 dark:border-gray-800">
        <button
          onClick={() => setActiveSubTab('contests')}
          className={`px-6 py-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'contests'
              ? 'border-violet text-violet font-black'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Concours d'Écriture
        </button>
        <button
          onClick={() => setActiveSubTab('submissions')}
          className={`px-6 py-4 text-xs font-black uppercase tracking-wider border-b-2 relative transition-all cursor-pointer ${
            activeSubTab === 'submissions'
              ? 'border-violet text-violet'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Candidatures Reçues
          {contestSubmissions.filter(s => s.status === 'pending').length > 0 && (
            <span className="ml-1.5 px-2 py-0.5 bg-red-500 text-white font-bold rounded-full text-[9px] animate-pulse">
              {contestSubmissions.filter(s => s.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {activeSubTab === 'contests' ? (
        <>
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
        </>
      ) : (
        <div className="space-y-6">
          {/* Search and filter row */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            {/* Search input */}
            <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl w-full md:max-w-md border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par candidat, œuvre, concours..."
                value={subSearchTerm}
                onChange={(e) => setSubSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none font-semibold text-xs w-full text-gray-700 dark:text-white"
              />
            </div>

            {/* Quick Filter buttons */}
            <div className="flex flex-wrap gap-2">
              {([
                { id: 'all', label: 'Toutes' },
                { id: 'pending', label: 'En attente' },
                { id: 'accepted', label: 'Acceptées' },
                { id: 'refused', label: 'Refusées' },
              ] as const).map(f => (
                <button
                  key={f.id}
                  onClick={() => setSubStatusFilter(f.id)}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider border rounded-xl transition-all cursor-pointer ${
                    subStatusFilter === f.id
                      ? 'bg-violet text-white border-transparent'
                      : darkMode
                        ? 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                        : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submissions items table / list */}
          {contestSubmissions.filter(sub => {
            const matchesSearch = 
              sub.name.toLowerCase().includes(subSearchTerm.toLowerCase()) ||
              sub.title.toLowerCase().includes(subSearchTerm.toLowerCase()) ||
              sub.contestTitle.toLowerCase().includes(subSearchTerm.toLowerCase());
            const matchesStatus = subStatusFilter === 'all' || sub.status === subStatusFilter;
            return matchesSearch && matchesStatus;
          }).length === 0 ? (
            <div className={`p-16 text-center rounded-[2.5rem] border ${
              darkMode ? 'bg-gray-800/40 border-gray-700/60' : 'bg-gray-50/50 border-gray-100'
            } flex flex-col items-center justify-center space-y-4`}>
              <div className="w-16 h-16 bg-violet/10 text-violet rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-violet opacity-60" />
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-gray-700 dark:text-gray-300">Aucune candidature</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto font-semibold font-sans">
                  Aucun manuscrit d'écrivain ne correspond aux critères de recherche actuels.
                </p>
              </div>
            </div>
          ) : (
            <div className={`overflow-x-auto rounded-[2rem] border ${
              darkMode ? 'border-gray-800' : 'border-gray-100'
            }`}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={darkMode ? 'bg-gray-900/40 text-gray-400' : 'bg-gray-50 text-gray-500'}>
                    <th className="p-5 text-[10px] font-black uppercase tracking-wider">Candidat</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-wider">Concours Ciblé</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-wider">Œuvre Soumise</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-wider">Score / Status</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-semibold text-xs">
                  {contestSubmissions.filter(sub => {
                    const matchesSearch = 
                      sub.name.toLowerCase().includes(subSearchTerm.toLowerCase()) ||
                      sub.title.toLowerCase().includes(subSearchTerm.toLowerCase()) ||
                      sub.contestTitle.toLowerCase().includes(subSearchTerm.toLowerCase());
                    const matchesStatus = subStatusFilter === 'all' || sub.status === subStatusFilter;
                    return matchesSearch && matchesStatus;
                  }).map(sub => {
                    const submissionDate = sub.createdAt ? new Date(sub.createdAt) : null;
                    const statusConfig = {
                      pending: { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400', label: 'À évaluer' },
                      accepted: { bg: 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400', label: 'Retenu / Accepté' },
                      refused: { bg: 'bg-red-105 text-red-800 dark:bg-red-955/20 dark:text-red-400', label: 'Décliné' },
                    }[sub.status || 'pending'];

                    return (
                      <tr 
                        key={sub.id} 
                        className={`hover:bg-violet/[0.01] transition-colors ${
                          darkMode ? 'text-gray-300' : 'text-gray-800'
                        }`}
                      >
                        <td className="p-5">
                          <div>
                            <div className="font-black text-sm text-gray-950 dark:text-white">{sub.name}</div>
                            <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{sub.email} • {sub.phone}</div>
                          </div>
                        </td>
                        <td className="p-5 font-black text-gray-600 dark:text-gray-300 max-w-xs truncate">
                          {sub.contestTitle}
                        </td>
                        <td className="p-5">
                          <div className="font-bold flex items-center gap-1.5">
                            <span className="font-extrabold text-violet">{sub.title}</span>
                            {sub.fileName !== 'colle_direct.txt' && (
                              <span className="px-1.5 py-0.5 bg-violet/10 text-violet font-bold rounded text-[9px]">FILE</span>
                            )}
                          </div>
                          {sub.synopsis && (
                            <div className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{sub.synopsis}</div>
                          )}
                        </td>
                        <td className="p-5">
                          <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${statusConfig.bg}`}>
                            {statusConfig.label}
                          </span>
                          {submissionDate && (
                            <div className="text-[9px] text-gray-400 dark:text-gray-500 mt-1 font-semibold">
                              Envoyé le {submissionDate.toLocaleDateString('fr-FR')} à {submissionDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </td>
                        <td className="p-5 text-right">
                          <button
                            onClick={() => handleOpenSubDetail(sub)}
                            className="p-2.5 bg-violet/5 hover:bg-violet text-violet hover:text-white rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 font-black uppercase text-[9px] tracking-wider"
                          >
                            <Eye className="w-3.5 h-3.5" /> Évaluer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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

      {/* Contest Submission Evaluation Detail Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className={`w-full max-w-4xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl border ${
              darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-950'
            } max-h-[92vh] flex flex-col relative`}
          >
            <button 
              onClick={() => setSelectedSub(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-violet/10 text-violet rounded-xl flex items-center justify-center animate-pulse">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Candidature de {selectedSub.name}</h2>
                <p className="text-xs text-violet font-black uppercase tracking-wider">{selectedSub.contestTitle}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {/* Dual grid for Candidate & Submission details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-gray-905 border-gray-700' : 'bg-gray-50 border-gray-100'} space-y-4`}>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#F28C28]">Fiche du Candidat</h3>
                  <div className="space-y-3 text-xs font-semibold">
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Nom complet :</span>
                      <span className="text-sm font-extrabold text-gray-900 dark:text-white">{selectedSub.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Email :</span>
                      <a href={`mailto:${selectedSub.email}`} className="text-sm font-extrabold text-violet hover:underline">{selectedSub.email}</a>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Téléphone :</span>
                      <a href={`tel:${selectedSub.phone}`} className="text-sm font-extrabold text-violet hover:underline">{selectedSub.phone}</a>
                    </div>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-gray-905 border-gray-700' : 'bg-gray-50 border-gray-100'} space-y-4`}>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#F28C28]">Détails de l'œuvre</h3>
                  <div className="space-y-3 text-xs font-semibold">
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Titre soumis :</span>
                      <span className="text-sm font-extrabold text-gray-900 dark:text-white">{selectedSub.title}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Fichier de dépôt :</span>
                      <span className="text-sm font-extrabold text-violet flex items-center gap-1">
                        <FileText className="w-4 h-4" /> {selectedSub.fileName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Date d'envoi :</span>
                      <span className="text-sm font-extrabold text-gray-600 dark:text-gray-300">
                        {selectedSub.createdAt ? new Date(selectedSub.createdAt).toLocaleString('fr-FR') : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Synopsis Box */}
              {selectedSub.synopsis && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Synopsis ou Résumé</h4>
                  <div className={`p-4 rounded-2xl border text-xs leading-relaxed font-semibold font-sans whitespace-pre-wrap ${
                    darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100/50 border-gray-100'
                  }`}>
                    {selectedSub.synopsis}
                  </div>
                </div>
              )}

              {/* Manuscript File Contents (Copy paste text or Base64 Word / PDF loader) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Contenu ou Manuscrit joint
                  </h4>
                  {selectedSub.fileName !== 'colle_direct.txt' && (
                    <a
                      href={selectedSub.content}
                      disabled={!selectedSub.content || selectedSub.content === '#'}
                      download={selectedSub.fileName}
                      className="text-[9px] font-black uppercase tracking-wider text-violet hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Télécharger ({selectedSub.fileName.split('.').pop()?.toUpperCase()})
                    </a>
                  )}
                </div>

                <div className={`p-5 rounded-2xl border text-xs leading-relaxed font-mono whitespace-pre-wrap max-h-96 overflow-y-auto ${
                  darkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-800'
                }`}>
                  {selectedSub.fileName === 'colle_direct.txt' ? (
                    selectedSub.content
                  ) : selectedSub.content?.startsWith('data:application/pdf') || selectedSub.content?.startsWith('data:application/vnd') || selectedSub.content?.startsWith('data:application/msword') ? (
                    <div className="py-8 text-center space-y-3">
                      <FileText className="w-10 h-10 text-violet mx-auto animate-pulse" />
                      <p className="text-xs font-bold text-gray-500">
                        Ce manuscrit a été déposé sous forme de fichier Word ou PDF.
                      </p>
                      <a
                        href={selectedSub.content}
                        download={selectedSub.fileName}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-violet text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-sm hover:scale-105 transition-transform"
                      >
                        <Download className="w-4 h-4" /> Cliquer pour Télécharger et Consulter
                      </a>
                    </div>
                  ) : (
                    selectedSub.content || "Aucun contenu à afficher."
                  )}
                </div>
              </div>

              {/* Evaluation decision & comments block */}
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#F28C28] flex items-center gap-1.5 font-sans">
                  <MessageSquare className="w-4 h-4" /> Décision de l'Administration : {
                    selectedSub.status === 'accepted' ? (
                      <span className="text-green-500">RETEUN / ACCEPTÉ</span>
                    ) : selectedSub.status === 'refused' ? (
                      <span className="text-red-500">DÉCLINÉ</span>
                    ) : (
                      <span className="text-yellow-500">EN ATTENTE D'ÉVALUATION</span>
                    )
                  }
                </h3>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Notes d'évaluation internes & Avis :</label>
                  <textarea
                    rows={3}
                    placeholder="Saisissez vos commentaires, critiques et notes sur cette œuvre..."
                    value={internalCommentInput}
                    onChange={(e) => setInternalCommentInput(e.target.value)}
                    className={`w-full px-5 py-3.5 rounded-xl border border-transparent outline-none transition-all font-semibold text-xs resize-none ${
                      darkMode ? 'bg-gray-950 focus:border-violet text-white' : 'bg-gray-100 focus:border-violet text-gray-905'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Decision trigger buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between pt-6 mt-6 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  if (onDeleteSubmission && window.confirm("Supprimer définitivement cette candidature de la base de données ?")) {
                    onDeleteSubmission(selectedSub.id);
                    setSelectedSub(null);
                  }
                }}
                className="px-5 py-3.5 rounded-xl bg-red-50 hover:bg-red-500 hover:text-white text-red-500 font-black uppercase text-xs tracking-wider transition-all cursor-pointer self-start"
              >
                Supprimer de la Base
              </button>

              <div className="flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-5 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-650 dark:text-gray-300 font-black uppercase text-xs tracking-wider transition-all cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleSaveSubUpdate(selectedSub.id, 'refused');
                    setSelectedSub(null);
                  }}
                  className="px-5 py-3.5 bg-red-500 hover:bg-red-650 text-white rounded-xl font-black uppercase text-xs tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" /> Écarter
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleSaveSubUpdate(selectedSub.id, 'accepted');
                    setSelectedSub(null);
                  }}
                  className="px-5 py-3.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl font-black uppercase text-xs tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5 animate-bounce-subtle"
                >
                  <CheckCircle className="w-4 h-4" /> Sélectionner l'Œuvre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
