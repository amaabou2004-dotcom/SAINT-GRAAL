import React, { useState } from 'react';
import { Trophy, Calendar, Award, ArrowRight, Notebook, ChevronDown, ChevronUp, Clock, Info, Check, Upload, FileText } from 'lucide-react';
import { Contest, ContestSubmission } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from './ui/Modal';

interface PublicContestsProps {
  contests: Contest[];
  darkMode: boolean;
  onSubmitContestSubmission?: (data: Omit<ContestSubmission, 'id' | 'createdAt' | 'status'>) => Promise<void>;
}

export const PublicContests: React.FC<PublicContestsProps> = ({ contests, darkMode, onSubmitContestSubmission }) => {
  const [expandedContestId, setExpandedContestId] = useState<string | null>(null);

  // Participation Form States
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [participantName, setParticipantName] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");
  const [participantPhone, setParticipantPhone] = useState("");
  const [manuscriptTitle, setManuscriptTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [submissionMethod, setSubmissionMethod] = useState<'copyPaste' | 'fileUpload'>('copyPaste');
  const [textManuscript, setTextManuscript] = useState("");
  const [fileBase64, setFileBase64] = useState("");
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const resetForm = () => {
    setParticipantName("");
    setParticipantEmail("");
    setParticipantPhone("");
    setManuscriptTitle("");
    setSynopsis("");
    setSubmissionMethod("copyPaste");
    setTextManuscript("");
    setFileBase64("");
    setFileName("");
    setIsSubmitting(false);
    setIsSubmitted(false);
    setSelectedContest(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        alert("Le fichier est trop volumineux (maximum 800 Ko pour stockage sécurisé). Reduisez ou copiez-collez-le.");
        return;
      }
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'text/plain'
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Format invalide. Utilisez un document Word (.doc, .docx), PDF, ou Texte (.txt).");
        return;
      }

      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleParticipateFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContest || !onSubmitContestSubmission) return;

    if (!participantName.trim() || !participantEmail.trim() || !participantPhone.trim() || !manuscriptTitle.trim()) {
      alert("Veuillez renseigner tous les champs d'identification du formulaire.");
      return;
    }

    let finalContent = "";
    if (submissionMethod === 'copyPaste') {
      if (!textManuscript.trim()) {
        alert("Veuillez saisir ou coller le texte de votre livre ou manuscrit.");
        return;
      }
      finalContent = textManuscript;
    } else {
      if (!fileBase64) {
        alert("Veuillez sélectionner votre fichier de candidature.");
        return;
      }
      finalContent = fileBase64;
    }

    setIsSubmitting(true);
    try {
      await onSubmitContestSubmission({
        contestId: selectedContest.id,
        contestTitle: selectedContest.title,
        name: participantName.trim(),
        email: participantEmail.trim(),
        phone: participantPhone.trim(),
        title: manuscriptTitle.trim(),
        synopsis: synopsis.trim(),
        content: finalContent,
        fileName: submissionMethod === 'fileUpload' ? fileName : 'colle_direct.txt',
        fileUrl: '#'
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Désolé, une erreur est survenue lors de l'envoi de votre candidature.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                          
                          <button
                            onClick={() => setSelectedContest(contest)}
                            className="inline-flex items-center gap-1.5 px-5 py-3 bg-violet hover:bg-violet-dark text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-violet/15 hover:translate-x-0.5 active:translate-x-0 cursor-pointer"
                          >
                            Participer <ArrowRight className="w-3.5 h-3.5" />
                          </button>
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

      <Modal
        isOpen={selectedContest !== null}
        onClose={resetForm}
        title="Formulaire d'Inscription"
        subtitle={selectedContest ? `Candidature pour : ${selectedContest.title}` : ""}
        icon={<Trophy className="w-6 h-6 text-[#F28C28]" />}
      >
        {isSubmitted ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-110 dark:bg-emerald-950/40 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold border border-emerald-500/20">
              ✓
            </div>
            <h3 className="text-xl font-black text-gray-950 dark:text-white uppercase tracking-tight">Candidature Envoyée !</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold max-w-md mx-auto">
              Félicitations, votre manuscrit a été soumis avec succès pour le concours <span className="text-violet font-bold">"{selectedContest?.title}"</span>. L'administrateur examinera votre œuvre prochainement.
            </p>
            <button
              onClick={resetForm}
              className="mt-6 px-6 py-3.5 bg-violet hover:bg-violet-dark text-white rounded-xl font-black uppercase text-xs tracking-wider transition-all cursor-pointer"
            >
              Fermer la fenêtre
            </button>
          </div>
        ) : (
          <form onSubmit={handleParticipateFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Nom complet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Jean Koffi"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  className={`w-full px-5 py-3.5 rounded-xl border border-transparent outline-none transition-all font-semibold text-sm ${
                    darkMode ? 'bg-gray-900 focus:border-violet text-white' : 'bg-gray-50 focus:border-violet text-gray-900'
                  }`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Adresse E-mail *</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: jean.koffi@example.com"
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                  className={`w-full px-5 py-3.5 rounded-xl border border-transparent outline-none transition-all font-semibold text-sm ${
                    darkMode ? 'bg-gray-900 focus:border-violet text-white' : 'bg-gray-50 focus:border-violet text-gray-900'
                  }`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Téléphone *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: +225 07 00 00 00 00"
                  value={participantPhone}
                  onChange={(e) => setParticipantPhone(e.target.value)}
                  className={`w-full px-5 py-3.5 rounded-xl border border-transparent outline-none transition-all font-semibold text-sm ${
                    darkMode ? 'bg-gray-900 focus:border-violet text-white' : 'bg-gray-50 focus:border-violet text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Titre de l'œuvre d'écriture *</label>
              <input
                type="text"
                required
                placeholder="Ex: Les Échos du Django"
                value={manuscriptTitle}
                onChange={(e) => setManuscriptTitle(e.target.value)}
                className={`w-full px-5 py-3.5 rounded-xl border border-transparent outline-none transition-all font-semibold text-sm ${
                  darkMode ? 'bg-gray-900 focus:border-violet text-white' : 'bg-gray-50 focus:border-violet text-gray-900'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Synopsis ou Résumé court</label>
              <textarea
                rows={2}
                placeholder="Rédigez un synopsis court qui résume l'histoire et les thèmes clés abordés..."
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                className={`w-full px-5 py-3.5 rounded-xl border border-transparent outline-none transition-all font-semibold text-sm resize-none ${
                  darkMode ? 'bg-gray-900 focus:border-violet text-white' : 'bg-gray-50 focus:border-violet text-gray-900'
                }`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Type de dépôt du manuscrit *</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSubmissionMethod('copyPaste')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 justify-center cursor-pointer transition-all ${
                    submissionMethod === 'copyPaste'
                      ? 'border-violet bg-violet/5 text-violet'
                      : darkMode ? 'border-gray-700 bg-gray-900 text-gray-400' : 'border-gray-100 bg-gray-50 text-gray-500'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Copier-Coller du Texte</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubmissionMethod('fileUpload')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 justify-center cursor-pointer transition-all ${
                    submissionMethod === 'fileUpload'
                      ? 'border-violet bg-violet/5 text-violet'
                      : darkMode ? 'border-gray-700 bg-gray-900 text-gray-400' : 'border-gray-100 bg-gray-50 text-gray-500'
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Charger Word / PDF</span>
                </button>
              </div>
            </div>

            {submissionMethod === 'copyPaste' ? (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Saisissez ou collez votre texte ici *</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Écrivez ou collez le texte intégral ou l'extrait requis pour le concours..."
                  value={textManuscript}
                  onChange={(e) => setTextManuscript(e.target.value)}
                  className={`w-full px-5 py-3.5 rounded-xl border border-transparent outline-none transition-all font-semibold text-sm font-sans ${
                    darkMode ? 'bg-gray-900 focus:border-violet text-white' : 'bg-gray-50 focus:border-violet text-gray-900'
                  }`}
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Fichier de manuscrit d'écriture *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col justify-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      id="contest-doc-file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="contest-doc-file"
                      className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-violet/40 rounded-xl cursor-pointer transition-colors hover:bg-violet/[0.01]"
                    >
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-[10px] font-black uppercase text-center text-gray-400">Choisir un fichier</span>
                      <span className="text-[9px] text-gray-400 font-semibold mt-1">PDF, Word ou TXT (800Ko max)</span>
                    </label>
                  </div>

                  {fileBase64 ? (
                    <div className="border border-dashed border-gray-100 dark:border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-2 bg-violet/[0.01]">
                      <FileText className="w-8 h-8 text-violet animate-bounce" />
                      <div className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate max-w-full">
                        {fileName}
                      </div>
                      <button
                        type="button"
                        onClick={() => { setFileBase64(""); setFileName(""); }}
                        className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                      >
                        Changer le fichier
                      </button>
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-100 dark:border-gray-800 rounded-xl flex items-center justify-center text-xs text-gray-400 font-bold uppercase tracking-wider text-center p-6">
                      Aucun document chargé
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-150 dark:border-gray-700">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-3.5 rounded-xl bg-gray-105 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-650 dark:text-gray-300 font-black uppercase text-xs tracking-wider transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3.5 bg-violet hover:bg-violet-dark text-white rounded-xl font-black uppercase text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Traitement...
                  </>
                ) : (
                  "Soumettre ma candidature"
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </section>
  );
};
