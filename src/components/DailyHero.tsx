import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Flame, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';

import type { Variants } from 'framer-motion';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.23, 1, 0.32, 1],
      when: 'beforeChildren',
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

interface DailyHeroProps {
  userName: string;
  totalHabits: number;
  completedCount: number;
  streak: number;
  goodCount: number;
  badCount: number;
}

export const DailyHero = ({ userName, totalHabits, completedCount, streak, goodCount, badCount }: DailyHeroProps) => {
  const { t } = useLanguage();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('hero.goodMorning') : hour < 18 ? t('hero.goodAfternoon') : t('hero.goodEvening');
  const progress = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
  const isAllDone = totalHabits > 0 && progress === 100;

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="show" whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
      <Card className="relative overflow-hidden border border-white/20 dark:border-white/10 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl px-4 py-5 sm:p-6 shadow-lg">
        {/* Decorative background gradients subtle matching light/dark */}
        <motion.div
          aria-hidden="true"
          className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 blur-3xl pointer-events-none"
          animate={{ y: [0, 14, 0], x: [0, -6, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10 pointer-events-none"
          animate={{ opacity: [0.35, 0.8, 0.35] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        <motion.div className="relative z-10 space-y-4 sm:space-y-6">
          {/* Header Section */}
          <motion.div variants={itemVariants} className="flex items-center justify-between gap-3">
            <div className="space-y-0.5 sm:space-y-1.5 min-w-0">
              <motion.h2 
                variants={itemVariants}
                className="text-lg sm:text-2xl font-bold tracking-tight truncate"
              >
                {greeting}, {userName}.
              </motion.h2>
              <motion.p variants={itemVariants} className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {totalHabits === 0 
                  ? t('hero.noHabits')
                  : isAllDone
                    ? t('hero.allDone') 
                    : t('hero.progressText', { completed: completedCount, total: totalHabits })}
              </motion.p>
            </div>
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.04, rotate: 1 }}
              whileTap={{ scale: 0.98 }}
              className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100/90 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-900/30 shadow-sm"
            >
              <svg className="absolute inset-0 w-full h-full p-[2px] -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4.5"
                  className="text-emerald-100 dark:text-emerald-900/50 opacity-45"
                />
                <motion.circle
                  cx="24"
                  cy="24"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  className="text-emerald-500 dark:text-emerald-400"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: totalHabits > 0 ? progress / 100 : 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{ pathLength: totalHabits > 0 ? progress / 100 : 0 }}
                />
              </svg>
            </motion.div>
          </motion.div>

          {/* Stats & Progress Layout */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            {/* Progress Bar */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {t('hero.completionRate')}
                </span>
                <motion.span
                  key={progress}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "font-mono text-xs text-foreground",
                    isAllDone && "text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  {progress}%
                </motion.span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary/80 border border-border/40">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full transition-all relative overflow-hidden",
                    isAllDone 
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400" 
                      : "bg-gradient-to-r from-primary to-primary/80"
                  )}
                >
                  {isAllDone && (
                    <motion.div
                      className="absolute inset-0 bg-white/35"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                </motion.div>
              </div>
            </div>

            {/* Quick Stats Grid - 3 Columns with elegant Dividers */}
            <div className="grid grid-cols-3 divide-x divide-border/40 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-white/20 dark:border-white/10 backdrop-blur-sm py-3">
              <motion.div variants={itemVariants} className="flex flex-col items-center justify-center px-1 text-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Flame className="h-3 w-3 text-orange-500 fill-orange-500/20 shrink-0" />
                  {t('hero.activeStreak')}
                </span>
                <motion.span
                  key={streak}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-xl sm:text-2xl font-extrabold tracking-tight text-orange-600 dark:text-orange-400"
                >
                  {streak}
                </motion.span>
              </motion.div>
              
              <motion.div variants={itemVariants} className="flex flex-col items-center justify-center px-1 text-center">
                <span className="text-[10px] font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  {t('tabs.good')}
                </span>
                <motion.span
                  key={goodCount}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-xl sm:text-2xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400"
                >
                  {goodCount}
                </motion.span>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col items-center justify-center px-1 text-center">
                <span className="text-[10px] font-bold text-rose-600/80 dark:text-rose-400/80 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-rose-500 shrink-0" />
                  {t('tabs.bad')}
                </span>
                <motion.span
                  key={badCount}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-xl sm:text-2xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400"
                >
                  {badCount}
                </motion.span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </Card>
    </motion.div>
  );
};
