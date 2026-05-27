import React, { useState } from 'react';
import { 
  Users, Download, Search, Mail, Trash2, 
  CheckCircle, Plus, Send, ExternalLink
} from 'lucide-react';
import { NewsletterSubscriber } from '../../types';

interface NewsletterManagerProps {
  subscribers: NewsletterSubscriber[];
  onDelete: (id: string) => void;
  onSendCampaign: () => void;
  darkMode: boolean;
}

export const NewsletterManager: React.FC<NewsletterManagerProps> = ({
  subscribers, onDelete, onSendCampaign, darkMode
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = subscribers.filter(s => s.email.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Email,Date Inscription\n" + 
      subscribers.map(s => `${s.email},${new Date(s.createdAt).toLocaleDateString()}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "abonnés_newsletter_saint_graal_ivoirien.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black">Base de Données Newsletter</h2>
          <p className="text-sm text-gray-500">Gérez vos abonnés et exportez la liste pour vos campagnes.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
          >
            <Download className="w-5 h-5 text-gray-500" /> Exporter CSV
          </button>
          <button 
            onClick={onSendCampaign}
            className="flex items-center gap-2 px-6 py-3 bg-violet text-white rounded-xl font-bold text-sm shadow-lg shadow-violet/20 hover:scale-105 transition-all"
          >
            <Send className="w-5 h-5" /> Nouvelle Campagne
          </button>
        </div>
      </div>

      <div className={`rounded-[2.5rem] border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm`}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="relative max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher un email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 rounded-2xl border-2 outline-none transition-all ${
                darkMode ? 'bg-gray-900 border-gray-700 focus:border-violet' : 'bg-gray-50 border-gray-50 focus:border-violet'
              }`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Statut</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Email de l'Abonné</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Date d'Inscription</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr key={sub.id} className={`border-b last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors ${darkMode ? 'border-gray-700' : 'border-gray-50'}`}>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-vert">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Actif</span>
                    </div>
                  </td>
                  <td className="p-6 font-bold">{sub.email}</td>
                  <td className="p-6 text-sm text-gray-500">{new Date(sub.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => onDelete(sub.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-bold">Aucun abonné trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
