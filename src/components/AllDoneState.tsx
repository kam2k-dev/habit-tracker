import { Button } from '@/components/ui/button';
import { CheckCircle2, Trophy, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/language-context';

interface AllDoneStateProps {
  totalHabits: number;
  onViewGoodHabits: () => void;
  onViewBadHabits: () => void;
}

export function AllDoneState({ totalHabits: _totalHabits, onViewGoodHabits, onViewBadHabits }: AllDoneStateProps) {
  const { t } = useLanguage();
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center"
    >
      {/* Celebration Icon */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
        className="mb-6"
      >
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          {/* Floating particles */}
          <motion.div
            animate={{ y: [-5, -15, -5], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-2 -right-2"
          >
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
          </motion.div>
          <motion.div
            animate={{ y: [-3, -12, -3], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
            className="absolute -top-1 -left-3"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </motion.div>
          <motion.div
            animate={{ y: [-4, -10, -4], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: 0.5 }}
            className="absolute top-2 -right-4"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
          </motion.div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h3 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold mb-2 text-foreground"
      >
        {t('allDone.title')}
      </motion.h3>
      
      {/* Description */}
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground mb-6 max-w-sm mx-auto"
      >
        {t('allDone.subtitle')}
      </motion.p>

      {/* Stats summary */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-start gap-2.5 mb-8 px-4 py-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-500/20 rounded-2xl max-w-xs sm:max-w-md w-full mx-auto"
      >
        <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <span className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed italic text-left">
          {t('allDone.quote')}
        </span>
      </motion.div>

      {/* Navigation CTAs */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-row items-center justify-center gap-3 w-full max-w-xs"
      >
        <Button
          variant="outline"
          onClick={onViewGoodHabits}
          className="group relative flex-1 items-center justify-center gap-2 overflow-hidden rounded-full border border-emerald-500/20 bg-emerald-50/60 px-4 py-2 text-xs font-semibold text-emerald-700 transition-all duration-300 hover:border-emerald-500/40 hover:bg-emerald-500/10 active:scale-[0.97] dark:bg-emerald-950/20 dark:text-emerald-400 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/15"
        >
          <span className="relative z-[1] whitespace-nowrap">{t('tabs.good')}</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-emerald-600 transition-transform duration-300 group-hover:translate-x-0.5 dark:text-emerald-400" />
        </Button>

        <Button
          variant="outline"
          onClick={onViewBadHabits}
          className="group relative flex-1 items-center justify-center gap-2 overflow-hidden rounded-full border border-rose-500/20 bg-rose-50/60 px-4 py-2 text-xs font-semibold text-rose-700 transition-all duration-300 hover:border-rose-500/40 hover:bg-rose-500/10 active:scale-[0.97] dark:bg-rose-950/20 dark:text-rose-400 dark:hover:border-rose-500/40 dark:hover:bg-rose-500/15"
        >
          <span className="relative z-[1] whitespace-nowrap">{t('tabs.bad')}</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-rose-600 transition-transform duration-300 group-hover:translate-x-0.5 dark:text-rose-400" />
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default AllDoneState;
