import React from 'react';
import { 
  BookOpen, Sparkles, Heart, Award, Compass, Globe, Users, 
  MapPin, CheckCircle, ArrowRight, Quote
} from 'lucide-react';
import { motion } from 'motion/react';

interface AProposProps {
  onQuoteClick?: () => void;
}

export const APropos: React.FC<AProposProps> = ({ onQuoteClick }) => {
  // Styling configuration
  const orange = '#F28C28';
  const green = '#2E9E45';
  const black = '#111111';

  // Subtle variants for entry animations
  const fadeInUp = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <section 
      id="apropos" 
      className="bg-white text-[#111111] overflow-hidden py-16 md:py-28 font-sans scroll-mt-20 selection:bg-[#F28C28]/25"
    >
      {/* 1. HERO SECTION SIMPLE */}
      <div className="max-w-7xl mx-auto px-4 mb-20 md:mb-28 text-center">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#2E9E45]/30 rounded-full bg-[#2E9E45]/5 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#2E9E45]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#2E9E45]">À Propos de Nous</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#111111] leading-tight max-w-4xl mx-auto">
            Présentation de la maison d’édition Saint Graal Ivoirien
          </h1>
          <div className="flex items-center justify-center gap-4 py-2">
            <div className="h-[2px] w-12 bg-[#F28C28]" />
            <span className="text-xl md:text-2xl font-serif italic text-[#F28C28] tracking-wide">
              L’idéal de l’édition
            </span>
            <div className="h-[2px] w-12 bg-[#F28C28]" />
          </div>
        </motion.div>
      </div>

      {/* 2. SECTION 1 : QUI SOMMES-NOUS ? */}
      <div className="max-w-7xl mx-auto px-4 mb-24 md:mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            className="lg:col-span-5 relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            {/* Elegant premium visual layout - no excessive decorations */}
            <div className="border border-gray-100 rounded-[2.5rem] bg-gray-50/50 p-8 md:p-12 shadow-[0_4px_25px_rgba(0,0,0,0.01)] relative">
              <Quote className="absolute -top-6 -left-2 w-14 h-14 text-[#2E9E45]/15" />
              <div className="space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-[#2E9E45] block">L'Origine</span>
                <p className="text-base leading-relaxed text-[#111111]/80">
                  Le nom <strong className="text-[#111111] font-semibold">« Saint Graal Ivoirien »</strong> incarne notre quête absolue de l’excellence éditoriale. Pour nous, chaque manuscrit retenu est une perle rare, un trésor culturel que nous polissons avec soin pour l’offrir aux lecteurs.
                </p>
                <div className="h-0.5 w-16 bg-[#2E9E45]/40" />
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Saint Graal Ivoirien • Fondée à Abidjan
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="lg:col-span-7 space-y-6 lg:pl-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <div className="inline-block bg-[#F28C28]/10 text-[#F28C28] text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">
              Une Mission Engagée
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111111]">
              Qui sommes-nous ?
            </h2>
            <div className="h-1 w-16 bg-[#F28C28] rounded-full" />
            <p className="text-lg md:text-xl text-[#111111]/90 leading-relaxed font-light">
              Fondée à Abidjan en Mars 2024, Saint Graal Ivoirien est un acteur engagé et dynamique de l’industrie du livre en Côte d’Ivoire et en Afrique. Portée par une vision moderne et exigeante de la littérature, elle se donne pour mission de découvrir, façonner et promouvoir les talents littéraires d’aujourd'hui et de demain.
            </p>
          </motion.div>
        </div>
      </div>

      {/* 3. SECTION 2 : NOTRE VISION & NOS ENGAGEMENTS */}
      <div className="bg-gray-50/60 border-y border-gray-100 py-20 md:py-28 mb-24 md:mb-32">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16 space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#2E9E45] block">Valeurs & Principes</span>
            <h2 className="text-3xl md:text-4xl font-black text-[#111111]">Notre Vision & Nos Engagements</h2>
            <div className="w-16 h-1 bg-[#2E9E45] mx-auto rounded-full" />
            <p className="text-base text-gray-600 leading-relaxed pt-2">
              Dans un écosystème en pleine mutation, Saint Graal Ivoirien se distingue par une approche professionnelle, transparente et profondément humaine de l'édition.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {/* Commitment 1 */}
            <motion.div 
              variants={fadeInUp}
              className="bg-white p-8 rounded-3xl border border-gray-100/80 shadow-[0_4px_25px_rgba(0,0,0,0.015)] space-y-6 hover:shadow-[0_10px_35px_rgba(0,0,0,0.025)] transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F28C28]/10 flex items-center justify-center text-[#F28C28]">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#111111]">La valorisation des auteurs</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Nous plaçons l'écrivain au cœur de notre modèle. Notre direction veille personnellement au respect des engagements, notamment à travers une politique de droits d'auteur juste, transparente et motivante, qui dépasse les standards habituels du secteur.
                </p>
              </div>
              <div className="pt-2 flex items-center text-xs font-bold text-[#F28C28] uppercase tracking-wider gap-1.5">
                Engagement Humain <CheckCircle className="w-3.5 h-3.5 text-[#2E9E45]" />
              </div>
            </motion.div>

            {/* Commitment 2 */}
            <motion.div 
              variants={fadeInUp}
              className="bg-white p-8 rounded-3xl border border-gray-100/80 shadow-[0_4px_25px_rgba(0,0,0,0.015)] space-y-6 hover:shadow-[0_10px_35px_rgba(0,0,0,0.025)] transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#2E9E45]/10 flex items-center justify-center text-[#2E9E45]">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#111111]">La diversité éditoriale</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Du roman de littérature générale à la poésie, en passant par les essais et la littérature jeunesse, nous explorons tous les genres pour refléter la richesse des réalités et de l'imaginaire africain.
                </p>
              </div>
              <div className="pt-2 flex items-center text-xs font-bold text-[#2E9E45] uppercase tracking-wider gap-1.5">
                Richesse Littéraire <CheckCircle className="w-3.5 h-3.5 text-[#2E9E45]" />
              </div>
            </motion.div>

            {/* Commitment 3 */}
            <motion.div 
              variants={fadeInUp}
              className="bg-white p-8 rounded-3xl border border-gray-100/80 shadow-[0_4px_25px_rgba(0,0,0,0.015)] space-y-6 hover:shadow-[0_10px_35px_rgba(0,0,0,0.025)] transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F28C28]/10 flex items-center justify-center text-[#F28C28]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#111111]">L’innovation et la proximité</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  À travers le lancement de collections thématiques fortes comme la collection romance Ivoire Story et une présence active sur le terrain, nous brisons les barrières pour rapprocher le livre des populations et susciter le goût de la lecture dès le plus jeune âge.
                </p>
              </div>
              <div className="pt-2 flex items-center text-xs font-bold text-[#F28C28] uppercase tracking-wider gap-1.5">
                Collections Uniques <CheckCircle className="w-3.5 h-3.5 text-[#2E9E45]" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* 4. SECTION 3 : NOS DOMAINES DE PUBLICATION */}
      <div className="max-w-7xl mx-auto px-4 mb-24 md:mb-32">
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-16 space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#F28C28] block">Notre Catalogue</span>
          <h2 className="text-3xl md:text-4xl font-black text-[#111111]">Nos Domaines de Publication</h2>
          <div className="w-16 h-1 bg-[#F28C28] mx-auto rounded-full" />
          <p className="text-sm text-gray-500">
            Une offre éditoriale variée, qui célèbre la créativité et la profondeur de l'esprit ivoirien et africain.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Card 1 */}
          <motion.div 
            variants={fadeInUp}
            className="group relative bg-[#111111] text-white p-8 md:p-10 rounded-[2.5rem] overflow-hidden flex flex-col justify-between min-h-[300px]"
          >
            {/* Subtle elegant pattern block */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#2E9E45]/10 rounded-full blur-2xl group-hover:bg-[#2E9E45]/20 transition-all duration-500" />
            <div className="space-y-4 relative z-10">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2E9E45]">01 / Genre Majeur</span>
              <h3 className="text-2xl font-black">Littérature Générale</h3>
              <p className="text-sm text-white/75 leading-relaxed">
                Des romans forts, des récits de vie et des fictions qui interpellent, émeuvent et font réfléchir.
              </p>
            </div>
            <div className="pt-8 relative z-10 flex items-center justify-between text-xs font-bold text-[#2E9E45] uppercase tracking-wider">
              <span>Profondeur & Réflexion</span>
              <Award className="w-5 h-5 text-[#2E9E45]" />
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            variants={fadeInUp}
            className="group relative bg-white text-[#111111] border-2 border-[#F28C28]/20 p-8 md:p-10 rounded-[2.5rem] overflow-hidden flex flex-col justify-between min-h-[300px]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F28C28]/5 rounded-full blur-2xl group-hover:bg-[#F28C28]/10 transition-all duration-500" />
            <div className="space-y-4 relative z-10">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F28C28]">02 / Collection Phare</span>
              <h3 className="text-2xl font-black">Collection Ivoire Story</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Une collection entièrement dédiée à la romance, capturant les battements de cœur, les réalités contemporaines et les passions à l'ivoirienne.
              </p>
            </div>
            <div className="pt-8 relative z-10 flex items-center justify-between text-xs font-bold text-[#F28C28] uppercase tracking-wider">
              <span>Romance Contemporaine</span>
              <Heart className="w-5 h-5 text-[#F28C28] fill-current" />
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            variants={fadeInUp}
            className="group relative bg-white text-[#111111] border-2 border-gray-100 p-8 md:p-10 rounded-[2.5rem] overflow-hidden flex flex-col justify-between min-h-[300px]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full blur-2xl" />
            <div className="space-y-4 relative z-10">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2E9E45]">03 / Accompagnement</span>
              <h3 className="text-2xl font-black">Jeunesse & Éducation</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Des ouvrages adaptés pour accompagner l'éveil intellectuel et culturel de la jeune génération.
              </p>
            </div>
            <div className="pt-8 relative z-10 flex items-center justify-between text-xs font-bold text-[#2E9E45] uppercase tracking-wider">
              <span>Éveil & Culture</span>
              <Award className="w-5 h-5 text-[#2E9E45]" />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 5. SECTION 4 : UNE PRÉSENCE RAYONNANTE */}
      <div className="bg-[#111111] text-white py-20 md:py-28 relative">
        {/* Subtle decorative circles - NO high-contrast futuristic glows, just simple borders */}
        <div className="absolute top-0 left-0 w-72 h-72 border border-white/[0.03] rounded-full -ml-36 -mt-36" />
        <div className="absolute bottom-0 right-0 w-96 h-96 border border-white/[0.03] rounded-full -mr-48 -mb-48" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div 
              className="lg:col-span-7 space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <div className="inline-flex items-center gap-2 bg-[#2E9E45]/25 border border-[#2E9E45]/40 text-[#2E9E45] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                <Globe className="w-4 h-4" /> Dimension Internationale
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Une présence rayonnante</h2>
              <div className="h-1 w-20 bg-[#F28C28] rounded-full" />
              
              <p className="text-lg text-white/80 leading-relaxed font-light">
                Basée à Abidjan, la maison d'édition ne se limite pas aux frontières ivoiriennes. Grâce à sa participation active aux grands rendez-vous nationaux et internationaux comme le Salon International du Livre d'Abidjan (<span className="text-[#F28C28] font-bold">SILA</span>), la Foire Internationale du Livre de Ouagadougou (<span className="text-[#F28C28] font-bold">FILO</span>) ainsi qu’à des synergies fortes avec des événements majeurs comme le Meeting International du Livre et des Arts associés (<span className="text-[#2E9E45] font-bold">MILA</span>), Saint Graal Ivoirien s'impose comme une vitrine incontournable de la créativité littéraire africaine.
              </p>
            </motion.div>

            <motion.div 
              className="lg:col-span-5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F28C28] flex items-center justify-center text-white font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-lg text-white">Confiance Sans Frontières</h4>
                </div>
                
                <p className="text-sm text-white/90 leading-relaxed italic">
                  “Des auteurs du Congo, du Bénin, du Burkina Faso, du Sénégal, de France, d’Allemagne et de l'étranger nous font confiance.”
                </p>

                <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider text-[#2E9E45]">
                  <span>Afrique</span> • <span>Europe</span> • <span>Amérique du Nord</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 6. SECTION FINALE */}
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="max-w-3xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2E9E45]/10 text-[#2E9E45] mb-2">
            <Compass className="w-8 h-8" />
          </div>
          
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif italic font-black text-[#111111] leading-snug">
            “Saint Graal Ivoirien, L’idéal de l’édition !”
          </h3>
          
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Vous avez un manuscrit d'exception ou souhaitez explorer notre catalogue ? 
            Contactez notre direction administrative dès aujourd'hui.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="#soumissions"
              className="px-8 py-4 bg-[#F28C28] text-white rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-md inline-flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              Soumettre un manuscrit <ArrowRight className="w-4 h-4" />
            </a>
            <a 
              href="#catalogue"
              className="px-8 py-4 border-2 border-gray-200 text-[#111111] rounded-xl font-bold hover:border-[#2E9E45] hover:text-[#2E9E45] transition-all inline-flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              Explorer le catalogue
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
