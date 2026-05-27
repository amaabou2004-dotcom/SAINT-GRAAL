import React, { useState } from 'react';
import { Trophy, Calendar, Award, ArrowRight, Notebook, ChevronDown, ChevronUp, Clock, Info } from 'lucide-react';
import { Contest } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface PublicContestsProps {
  contests: Contest[];
  darkMode: boolean;
}

export const PublicContests: React.FC<PublicContestsProps> = ({ contests, darkMode }) => {
  const [expandedContestId, setExpandedContestId] = useState<string | null>(null);

  // Filter only active or completed contests for the public (hide drafts)
  const publicContests = contests.filter(c => c.status === 'active' || c.status === 'completed');

  const toggleExpand = (id: string) => {
    setExpandedContestId(expandedContestId === id ? null : id);
  };

  const statusColors = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    completed: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    draft: 'hidden'
  };

  const statusLabels = {
    active: 'Inscriptions Ouvertes',
    completed: 'Clôturé / Délibération',
    draft: ''
  };

  return (
    <section 
      id="concours-public" 
      className="py-24 md:py-32 relative overflow-hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300"
    >
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-vert/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <div className="w-8 h-8 rounded-xl bg-violet/10 flex items-center justify-center text-violet">
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-violet">
              Grands Prix Littéraires
            </span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-gray-950 dark:text-white uppercase tracking-tight"
          >
            Espace Concours
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-lg text-gray-500 dark:text-gray-400 mt-4 font-semibold max-w-2xl mx-auto"
          >
            Prenez part aux concours d'écriture de <span className="text-violet font-black">Saint Graal Ivoirien</span>, révélez votre génie créatif et profitez d'opportunités de publication exclusives.
          </motion.p>
        </div>

        {/* Contests Grid */}
        {publicContests.length === 0 ? (
          <div className="max-w-xl mx-auto p-12 text-center rounded-[2.5rem] border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 flex flex-col items-center justify-center">
            <Info className="w-12 h-12 text-violet opacity-60 mb-4 animate-pulse" />
            <h4 className="font-extrabold text-lg text-gray-700 dark:text-gray-300">Aucun concours en cours</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
              Revenez très bientôt ! Nos administrateurs préparent de magnifiques prix et éditions pour encourager l'écriture ivoirienne.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {publicContests.map((contest, index) => {
              const isExpanded = expandedContestId === contest.id;
              
              // Days Left Calculation
              const daysLeft = Math.ceil(
                (new Date(contest.deadline).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)
              );

              return (
                <motion.div
                  key={contest.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`rounded-[2.5rem] border overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700/60 hover:border-violet/30' 
                      : 'bg-white border-gray-100 hover:border-violet/10 hover:shadow-[0_24px_50px_rgba(127,86,217,0.04)]'
                  }`}
                >
                  {/* Contest Hero Banner */}
                  <div className="relative h-56 md:h-64 overflow-hidden">
                    {contest.image ? (
                      <img 
                        src={contest.image} 
                        alt={contest.title} 
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${
                        darkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-violet/10 to-transparent'
                      }`}>
                        <Trophy className="w-16 h-16 text-violet opacity-30 animate-pulse" />
                      </div>
                    )}
                    
                    {/* Floating Status and Prize badges */}
                    <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                      <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border shadow-sm ${statusColors[contest.status]}`}>
                        {statusLabels[contest.status]}
                      </span>
                    </div>

                    <div className="absolute bottom-6 right-6">
                      <div className="px-5 py-2.5 bg-black/75 backdrop-blur-md text-white rounded-2xl flex items-center gap-2 shadow-lg border border-white/10">
                        <Award className="w-4 h-4 text-yellow-400" />
                        <span className="text-[11px] font-black uppercase tracking-wider">Dotation: {contest.prize}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-gray-950 dark:text-white leading-tight mb-4">
                        {contest.title}
                      </h3>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-semibold whitespace-pre-line">
                        {contest.description}
                      </p>

                      {/* Dropdown rules description */}
                      {contest.rules && (
                        <div className="mt-6">
                          <button
                            onClick={() => toggleExpand(contest.id)}
                            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-violet hover:text-violet-dark transition-colors cursor-pointer"
                          >
                            <span>Règlement & Conditions</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className={`p-5 rounded-2xl border text-xs leading-relaxed font-semibold whitespace-pre-line mt-3 ${
                                  darkMode 
                                    ? 'bg-gray-900/60 border-gray-750 text-gray-400' 
                                    : 'bg-violet/[0.01] border-violet/5 text-gray-600'
                                }`}>
                                  {contest.rules}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {/* Timeline & Actions */}
                    <div className="pt-6 mt-8 border-t border-gray-100 dark:border-gray-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">Date limite de dépôt</div>
                        <div className="flex items-center gap-1.5 text-sm font-extrabold text-red-500">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(contest.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                      </div>

                      {contest.status === 'active' && (
                        <div className="flex items-center gap-3">
                          {daysLeft > 0 ? (
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> J-{daysLeft} restants
                            </span>
                          ) : (
                            <span className="text-[10px] font-black uppercase tracking-wider text-red-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> Clôture aujourd'hui
                            </span>
                          )}
                          
                          <a
                            href="#soumissions"
                            className="inline-flex items-center gap-1.5 px-5 py-3 bg-violet hover:bg-violet-dark text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-violet/15 hover:translate-x-0.5 active:translate-x-0"
                          >
                            Participer <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}

                      {contest.status === 'completed' && (
                        <div className="text-xs font-black uppercase tracking-widest text-gray-400">
                          Les dépôts sont clos
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
