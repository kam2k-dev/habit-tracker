import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { HomeIcon } from '@/components/icons/HomeIcon';
import { GoodHabitIcon } from '@/components/icons/GoodHabitIcon';
import { BadHabitIcon } from '@/components/icons/BadHabitIcon';
import { TrendingIcon } from '@/components/icons/TrendingIcon';

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  color?: string;
  activeColor?: string;
}

interface FloatingBottomNavProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  onAddClick: () => void;
  className?: string;
}

export function FloatingBottomNav({
  activeTab,
  onTabChange,
  onAddClick,
  className,
}: FloatingBottomNavProps) {
  const items: NavItem[] = [
    { id: 'today', label: 'Hari Ini', icon: HomeIcon, color: 'text-foreground/45 dark:text-white/45', activeColor: 'text-blue-500 dark:text-blue-500' },
    { id: 'good', label: 'Baik', icon: GoodHabitIcon, color: 'text-foreground/45 dark:text-white/45', activeColor: 'text-emerald-500 dark:text-emerald-400' },
    { id: 'add', label: '', icon: Plus },
    { id: 'bad', label: 'Buruk', icon: BadHabitIcon, color: 'text-foreground/45 dark:text-white/45', activeColor: 'text-rose-500 dark:text-rose-400' },
    { id: 'stats', label: 'Stats', icon: TrendingIcon, color: 'text-foreground/45 dark:text-white/45', activeColor: 'text-purple-500 dark:text-purple-400' },
  ];

  return (
    <div
      className={cn(
        'fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-50 -translate-x-1/2 px-4 w-full max-w-md md:max-w-4xl',
        className,
      )}
    >
      {/* Bar wrapper */}
      <div
        className={cn(
          'relative isolate flex items-center justify-between overflow-visible border border-white/20 dark:border-white/10 backdrop-blur-[24px] backdrop-saturate-200 h-16 px-4 rounded-[32px]',
          'before:pointer-events-none before:absolute before:inset-[1px] before:-z-10 before:rounded-[inherit] before:bg-gradient-to-b before:from-white/30 before:via-white/10 before:to-white/5',
          'dark:border-white/10 dark:before:from-white/10 dark:before:via-white/5 dark:before:to-white/2',
          /* Light / dark base - iOS liquid frosted look */
          'bg-white/60 dark:bg-slate-950/60 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.15),inset_0_1px_1px_rgba(255,255,255,0.4)] ring-1 ring-white/10',
          'dark:shadow-[0_18px_60px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] dark:ring-white/5',
        )}
      >
        {/* Subtle radial highlight */}
        <div className="pointer-events-none absolute inset-0 -z-20 rounded-[inherit] bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.55),transparent_28%),radial-gradient(circle_at_82%_88%,rgba(255,255,255,0.18),transparent_36%)] opacity-80 dark:opacity-30" />

        {items.map((item) => {
          const isActive = activeTab === item.id;
          const isAdd = item.id === 'add';
          const Icon = item.icon;

          /* ---- FAB (centre) ---- */
          if (isAdd) {
            return (
              <button
                key={item.id}
                onClick={onAddClick}
                aria-label="Tambah habit"
                className="relative z-10 flex flex-col items-center justify-center rounded-full w-[20%]"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                  className={cn(
                    'relative flex items-center justify-center rounded-full border border-white/40 bg-white/30 backdrop-blur-xl h-12 w-12',
                    'shadow-[0_8px_24px_rgba(15,23,42,0.12),inset_0_1px_1px_rgba(255,255,255,0.65)]',
                    'dark:border-white/12 dark:bg-white/[0.10] dark:shadow-[0_8px_24px_rgba(0,0,0,0.28),inset_0_1px_1px_rgba(255,255,255,0.14)]',
                  )}
                >
                  <Plus className="text-foreground drop-shadow-sm dark:text-white h-6 w-6" />
                </motion.div>
              </button>
            );
          }

          /* ---- Regular tab (Instagram-style with iOS sliding indicator) ---- */
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className="relative z-10 flex flex-col items-center justify-center w-[20%] h-12 overflow-visible"
            >
              {/* iOS Liquid Sliding Pill Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className={cn(
                    "absolute rounded-2xl -z-10 h-10 w-10 sm:w-14",
                    item.id === 'today' && "bg-blue-500/15 dark:bg-blue-500/25 shadow-[0_2px_12px_rgba(59,130,246,0.2)]",
                    item.id === 'good' && "bg-emerald-500/15 dark:bg-emerald-500/25 shadow-[0_2px_12px_rgba(16,185,129,0.2)]",
                    item.id === 'bad' && "bg-rose-500/15 dark:bg-rose-500/25 shadow-[0_2px_12px_rgba(244,63,94,0.2)]",
                    item.id === 'stats' && "bg-purple-500/15 dark:bg-purple-500/25 shadow-[0_2px_12px_rgba(168,85,247,0.2)]"
                  )}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 28,
                    mass: 0.8
                  }}
                />
              )}

              {/* Icon wrapper */}
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.15 : 1,
                  y: isActive ? -1 : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 350,
                  damping: 24,
                  mass: 0.6,
                }}
                className="relative flex items-center justify-center rounded-full will-change-transform h-8 w-8"
              >
                <Icon
                  className={cn(
                    'transition-colors duration-300 ease-out h-[22px] w-[22px]',
                    isActive
                      ? cn('drop-shadow-sm', item.activeColor)
                      : item.color,
                  )}
                />
              </motion.div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
