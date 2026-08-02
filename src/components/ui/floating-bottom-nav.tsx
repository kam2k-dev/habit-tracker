import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { HomeIcon } from '@/components/icons/HomeIcon';
import { GoodHabitIcon } from '@/components/icons/GoodHabitIcon';
import { BadHabitIcon } from '@/components/icons/BadHabitIcon';
import { TrendingIcon } from '@/components/icons/TrendingIcon';
import { useLanguage } from '@/context/language-context';

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
  const { t } = useLanguage();
  const items: NavItem[] = [
    { id: 'today', label: t('tabs.today'), icon: HomeIcon, color: 'text-foreground/45 dark:text-white/45', activeColor: 'text-foreground dark:text-white' },
    { id: 'good', label: t('tabs.good'), icon: GoodHabitIcon, color: 'text-foreground/45 dark:text-white/45', activeColor: 'text-emerald-600 dark:text-emerald-400' },
    { id: 'add', label: '', icon: Plus },
    { id: 'bad', label: t('tabs.bad'), icon: BadHabitIcon, color: 'text-foreground/45 dark:text-white/45', activeColor: 'text-rose-600 dark:text-rose-400' },
    { id: 'stats', label: t('tabs.stats'), icon: TrendingIcon, color: 'text-foreground/45 dark:text-white/45', activeColor: 'text-purple-600 dark:text-purple-400' },
  ];

  return (
    <div
      className={cn(
        'fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-50 -translate-x-1/2 px-4 w-full max-w-md md:max-w-4xl',
        className,
      )}
    >
      {/* Bar wrapper - Instagram Floating Navbar Spec (h-16 64px, rounded-full / rounded-[34px]) */}
      <div
        className={cn(
          'relative flex items-center justify-between overflow-visible h-16 p-1 rounded-[34px]',
          /* Blur & Saturation (iOS / Instagram Liquid Glass effect) */
          'backdrop-blur-[40px] backdrop-saturate-[180%]',
          /* Background Opacity */
          'bg-white/50 dark:bg-[#1c1c1e]/70',
          /* Thin subtle border */
          'border border-white/60 dark:border-white/10',
          /* Shadow for depth */
          'shadow-[0_10px_36px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_36px_rgba(0,0,0,0.5)]',
        )}
      >
        {/* Subtle radial highlight inside background */}
        <div className="pointer-events-none absolute inset-0 -z-20 rounded-[inherit] overflow-hidden bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.6),transparent_28%),radial-gradient(circle_at_82%_88%,rgba(255,255,255,0.2),transparent_36%)] opacity-80 dark:opacity-30" />

        {items.map((item) => {
          const isActive = activeTab === item.id;
          const isAdd = item.id === 'add';
          const Icon = item.icon;

          /* ---- FAB (centre - Instagram Standard Top Layer z-30) ---- */
          if (isAdd) {
            return (
              <button
                key={item.id}
                onClick={onAddClick}
                aria-label="Tambah habit"
                className="relative z-30 flex flex-col items-center justify-center rounded-full w-[19%] h-full overflow-visible"
              >
                <motion.div
                  whileHover={{ scale: 1.12, rotate: 90 }}
                  whileTap={{ scale: 0.88, rotate: 180 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                  className={cn(
                    'relative z-30 flex items-center justify-center rounded-full border border-white/70 bg-white/60 backdrop-blur-2xl h-12 w-12 mx-auto',
                    'shadow-[0_4px_20px_rgba(15,23,42,0.16),inset_0_1px_1px_rgba(255,255,255,0.85)]',
                    'dark:border-white/20 dark:bg-white/[0.16] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.22)]',
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
              className="relative z-10 flex flex-col items-center justify-center w-[19%] h-full rounded-[24px] md:rounded-full group hover:rounded-full transition-all duration-300 overflow-hidden"
            >
              {/* iOS Glassmorphism Magnifying Pill Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  layout="position"
                  className={cn(
                    "absolute inset-0 rounded-[24px] md:rounded-full -z-10 transition-all duration-300",
                    /* Glass / Kaca Pembesar iOS Spec */
                    "bg-white/80 dark:bg-white/20",
                    "backdrop-blur-2xl backdrop-saturate-[200%]",
                    "border border-white/80 dark:border-white/30",
                    "shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1.5px_1px_rgba(255,255,255,0.9)]",
                    "dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1.5px_1px_rgba(255,255,255,0.3)]"
                  )}
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 32,
                    mass: 0.7
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
                    'transition-colors duration-300 ease-out h-6 w-6',
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
