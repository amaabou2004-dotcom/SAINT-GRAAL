import React from 'react';
import { Mail, Trash2, CheckCircle, Clock, Search, MessageSquare, Reply } from 'lucide-react';
import { ContactMessage } from '../../types';

interface MessageManagerProps {
  messages: ContactMessage[];
  onUpdate: (id: string, updates: Partial<ContactMessage>) => void;
  onDelete: (id: string) => void;
  darkMode: boolean;
}

export const MessageManager: React.FC<MessageManagerProps> = ({
  messages, onUpdate, onDelete, darkMode
}) => {
  const [filter, setFilter] = React.useState<'all' | 'unread' | 'read'>('all');
  const [search, setSearch] = React.useState('');

  const filteredMessages = messages
    .filter(m => {
      if (filter === 'unread') return !m.isRead;
      if (filter === 'read') return m.isRead;
      return true;
    })
    .filter(m => 
      m.name.toLowerCase().includes(search.toLowerCase()) || 
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Mail className="text-violet" /> Messages & Contacts
          </h2>
          <p className="text-sm text-gray-500">Gérez les demandes reçues via le formulaire de contact.</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'unread', 'read'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === f 
                  ? 'bg-violet text-white shadow-lg shadow-violet/20' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'unread' ? 'Non lus' : 'Lus'}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text"
          placeholder="Rechercher par nom, sujet ou message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full pl-12 pr-4 py-4 rounded-3xl border-2 transparent focus:border-violet outline-none transition-all ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'
          }`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredMessages.map((msg) => (
          <div 
            key={msg.id}
            className={`p-6 rounded-[2.5rem] border transition-all ${
              msg.isRead 
                ? (darkMode ? 'bg-gray-800/50 border-gray-700 opacity-80' : 'bg-gray-50/50 border-transparent')
                : (darkMode ? 'bg-gray-800 border-violet/30 border-2' : 'bg-white border-gray-100 shadow-md')
            }`}
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                      msg.isRead ? 'bg-gray-200 text-gray-500' : 'bg-violet/10 text-violet'
                    }`}>
                      {msg.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-lg">{msg.name}</h4>
                      <p className="text-xs text-gray-500 font-medium">{msg.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!msg.isRead && (
                      <span className="w-2 h-2 bg-violet rounded-full animate-pulse" />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h5 className="font-black text-sm text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                    Sujet: {msg.subject}
                  </h5>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 italic">
                    "{msg.message}"
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button 
                    onClick={() => onUpdate(msg.id, { isRead: !msg.isRead })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      msg.isRead 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200' 
                        : 'bg-violet/10 text-violet hover:bg-violet hover:text-white'
                    }`}
                  >
                    {msg.isRead ? <Clock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    {msg.isRead ? 'Marquer comme non lu' : 'Marquer comme lu'}
                  </button>

                  <a 
                    href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white text-xs font-bold transition-all"
                  >
                    <Reply className="w-4 h-4" /> Répondre
                  </a>

                  <button 
                    onClick={() => onDelete(msg.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredMessages.length === 0 && (
          <div className="py-24 text-center bg-gray-50 dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
            <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <MessageSquare className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Aucun message trouvé</h3>
            <p className="text-gray-500 mt-2">Affinez vos critères de recherche ou de filtrage.</p>
          </div>
        )}
      </div>
    </div>
  );
};
