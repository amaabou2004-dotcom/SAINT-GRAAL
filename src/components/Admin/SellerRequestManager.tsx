import React, { useState } from 'react';
import { 
  Store, CheckCircle, XCircle, Trash2, Mail, Phone, MapPin, 
  Calendar, Clock, Filter, Search, ChevronRight, FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { SellerRequest } from '../../types';

interface SellerRequestManagerProps {
  requests: SellerRequest[];
  onUpdate: (id: string, updates: Partial<SellerRequest>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  darkMode: boolean;
}

export const SellerRequestManager: React.FC<SellerRequestManagerProps> = ({
  requests, onUpdate, onDelete, darkMode
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'refused'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<SellerRequest | null>(null);

  const filteredRequests = requests.filter(req => {
    const matchesFilter = filter === 'all' || req.status === filter;
    const searchString = `${req.name} ${req.contactName} ${req.email} ${req.phone} ${req.city} ${req.address}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStatusChange = async (id: string, status: 'accepted' | 'refused') => {
    if (window.confirm(`Voulez-vous modifier le statut de cette demande en "${status === 'accepted' ? 'Acceptée' : 'Refusée'}" ?`)) {
      await onUpdate(id, { status });
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest(prev => prev ? { ...prev, status } : null);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette demande de partenariat ?")) {
      await onDelete(id);
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest(null);
      }
    }
  };

  const exportRequests = () => {
    const headers = ["Nom Boutique", "Responsable", "E-mail", "Téléphone", "Ville", "Adresse", "Message", "Statut", "Date de demande"];
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(",")].concat(
          requests.map(r => [
            `"${r.name.replace(/"/g, '""')}"`,
            `"${r.contactName.replace(/"/g, '""')}"`,
            `"${r.email}"`,
            `"${r.phone}"`,
            `"${r.city.replace(/"/g, '""')}"`,
            `"${r.address.replace(/"/g, '""')}"`,
            `"${r.message.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
            `"${r.status}"`,
            `"${new Date(r.createdAt).toLocaleString('fr-FR')}"`
          ].join(","))
        ).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `demandes_partenaires_vendeurs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase flex items-center gap-3">
            <Store className="text-violet w-8 h-8" /> Demandes de Partenariat Vendeurs
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gérez les demandes des libraires et vendeurs indépendants souhaitant distribuer vos livres.
          </p>
        </div>
        <div>
          <button
            onClick={exportRequests}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Exporter en CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Requests List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search and Filters */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une boutique / ville..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-transparent outline-none focus:border-violet transition-all ${
                  darkMode ? 'bg-gray-800 focus:bg-gray-800' : 'bg-white focus:bg-white shadow-sm shadow-gray-100'
                }`}
              />
            </div>

            {/* Status filtering */}
            <div className="flex gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto w-full sm:w-auto">
              {(['all', 'pending', 'accepted', 'refused'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer uppercase ${
                    filter === type
                      ? 'bg-violet text-white shadow-md shadow-violet/10'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {type === 'all' && 'Tous'}
                  {type === 'pending' && 'En attente'}
                  {type === 'accepted' && 'Acceptés'}
                  {type === 'refused' && 'Refusés'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className={`p-6 rounded-[2rem] border transition-all cursor-pointer group flex items-start justify-between relative overflow-hidden ${
                  selectedRequest?.id === req.id
                    ? 'border-violet' + (darkMode ? ' bg-violet/5' : ' bg-violet/5')
                    : (darkMode ? 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800' : 'bg-white border-gray-100 hover:shadow-md')
                }`}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className={`p-3 rounded-2xl flex-shrink-0 ${
                    req.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500' :
                    req.status === 'refused' ? 'bg-red-500/10 text-red-500' :
                    'bg-amber-500/10 text-amber-500'
                  }`}>
                    <Store className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h4 className="font-extrabold text-lg text-gray-900 dark:text-white group-hover:text-violet transition-colors truncate">
                        {req.name}
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                        req.status === 'refused' ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}>
                        {req.status === 'pending' ? 'En attente' : req.status === 'accepted' ? 'Accepté' : 'Refusé'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-gray-500 font-medium">
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" /> {req.city} - {req.address}
                      </p>
                      <p className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-gray-400" /> {req.email}
                      </p>
                      <p className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {req.phone}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" /> {new Date(req.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-center flex-shrink-0">
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${selectedRequest?.id === req.id ? 'translate-x-1 text-violet' : 'group-hover:translate-x-1'}`} />
                </div>
              </div>
            ))}

            {filteredRequests.length === 0 && (
              <div className={`p-12 text-center rounded-[2.5rem] border ${darkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white border-gray-100'}`}>
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-bold text-lg text-gray-400">Aucune demande trouvée</h4>
                <p className="text-sm text-gray-400 mt-1">Modifiez vos critères de recherche ou filtres.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detailed View */}
        <div className="lg:col-span-1">
          {selectedRequest ? (
            <div className={`p-8 rounded-[2.5rem] border sticky top-4 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'
            }`}>
              {/* Card Meta */}
              <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  selectedRequest.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40' :
                  selectedRequest.status === 'refused' ? 'bg-red-100 text-red-800 dark:bg-red-950/40' :
                  'bg-amber-100 text-amber-800 dark:bg-amber-950/40'
                }`}>
                  {selectedRequest.status === 'pending' ? 'En attente de revue' : selectedRequest.status === 'accepted' ? 'Partenariat Actif' : 'Demande déclinée'}
                </span>
                <button
                  onClick={() => handleDelete(selectedRequest.id)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-xl transition-colors cursor-pointer"
                  title="Supprimer la demande"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Title / Partner Details */}
              <div className="mb-8">
                <h3 className="text-2xl font-black text-violet mb-2">{selectedRequest.name}</h3>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Responsable : {selectedRequest.contactName}</p>
              </div>

              {/* Information Cards */}
              <div className="space-y-4 mb-8">
                <div className={`p-4 rounded-xl flex items-center gap-4 ${darkMode ? 'bg-gray-900/40' : 'bg-gray-50'}`}>
                  <MapPin className="w-5 h-5 text-violet flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-black tracking-wider text-gray-400">Ville et Adresse</p>
                    <p className="font-bold text-sm truncate">{selectedRequest.city}, {selectedRequest.address}</p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl flex items-center gap-4 ${darkMode ? 'bg-gray-900/40' : 'bg-gray-50'}`}>
                  <Mail className="w-5 h-5 text-violet flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-black tracking-wider text-gray-400">Email de contact</p>
                    <a href={`mailto:${selectedRequest.email}`} className="font-bold text-sm hover:underline block truncate text-violet">{selectedRequest.email}</a>
                  </div>
                </div>

                <div className={`p-4 rounded-xl flex items-center gap-4 ${darkMode ? 'bg-gray-900/40' : 'bg-gray-50'}`}>
                  <Phone className="w-5 h-5 text-violet flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-black tracking-wider text-gray-400">Téléphone portable</p>
                    <a href={`tel:${selectedRequest.phone}`} className="font-bold text-sm hover:underline block truncate text-violet">{selectedRequest.phone}</a>
                  </div>
                </div>

                <div className={`p-4 rounded-xl flex items-center gap-4 ${darkMode ? 'bg-gray-900/40' : 'bg-gray-50'}`}>
                  <Clock className="w-5 h-5 text-violet flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-black tracking-wider text-gray-400">Soumise le</p>
                    <p className="font-bold text-sm">{new Date(selectedRequest.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              {/* Message Block */}
              <div className="mb-8">
                <h4 className="text-xs uppercase font-black tracking-wider text-gray-400 mb-3">Message et Motivations</h4>
                <div className={`p-5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap italic font-medium ${
                  darkMode ? 'bg-gray-900/60 text-gray-300' : 'bg-gray-50 text-gray-600'
                }`}>
                  "{selectedRequest.message || 'Aucun message particulier fourni.'}"
                </div>
              </div>

              {/* Actions */}
              {selectedRequest.status === 'pending' && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleStatusChange(selectedRequest.id, 'accepted')}
                    className="flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold font-black uppercase text-xs tracking-wider shadow-lg shadow-emerald-500/10 cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <CheckCircle className="w-4 h-4" /> Accepter
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedRequest.id, 'refused')}
                    className="flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold font-black uppercase text-xs tracking-wider shadow-lg shadow-red-500/10 cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <XCircle className="w-4 h-4" /> Refuser
                  </button>
                </div>
              )}

              {selectedRequest.status !== 'pending' && (
                <button
                  onClick={() => onUpdate(selectedRequest.id, { status: 'pending' })}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-950 rounded-xl font-black uppercase text-xs tracking-wider cursor-pointer transition-colors"
                >
                  Remettre en attente
                </button>
              )}
            </div>
          ) : (
            <div className={`p-8 py-16 text-center rounded-[2.5rem] border border-dashed flex flex-col items-center justify-center space-y-4 ${
              darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-50/50 border-gray-200'
            }`}>
              <Store className="w-12 h-12 text-gray-300 animate-pulse" />
              <div>
                <h4 className="font-extrabold text-gray-400">Aucune sélection</h4>
                <p className="text-xs text-gray-400 mt-1">Cliquez sur une demande dans la liste de gauche pour en afficher les détails complets.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
