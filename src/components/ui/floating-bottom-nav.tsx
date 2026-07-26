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
    { id: 'today', label: t('tabs.today'), icon: HomeIcon, color: 'text-foreground/45 dark:text-white/45', activeColor: 'text-blue-500 dark:text-blue-500' },
    { id: 'good', label: t('tabs.good'), icon: GoodHabitIcon, color: 'text-foreground/45 dark:text-white/45', activeColor: 'text-emerald-500 dark:text-emerald-400' },
    { id: 'add', label: '', icon: Plus },
    { id: 'bad', label: t('tabs.bad'), icon: BadHabitIcon, color: 'text-foreground/45 dark:text-white/45', activeColor: 'text-rose-500 dark:text-rose-400' },
    { id: 'stats', label: t('tabs.stats'), icon: TrendingIcon, color: 'text-foreground/45 dark:text-white/45', activeColor: 'text-purple-500 dark:text-purple-400' },
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
          'relative isolate flex items-center justify-between overflow-visible h-[70px] px-3.5 sm:px-5 rounded-[35px]',
          /* Blur & Saturation (iOS Material effect) */
          'backdrop-blur-[40px] backdrop-saturate-[180%]',
          /* Background Opacity (WhatsApp iOS style uses a milky/dark translucent background) */
          'bg-white/45 dark:bg-[#1c1c1e]/60',
          /* Thin subtle border */
          'border border-white/40 dark:border-white/10',
          /* Shadow for depth */
          'shadow-[0_12px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)]',
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
                  whileHover={{ scale: 1.12, rotate: 90 }}
                  whileTap={{ scale: 0.88, rotate: 180 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                  className={cn(
                    'relative flex items-center justify-center rounded-full border border-white/50 bg-white/40 backdrop-blur-xl h-[52px] w-[52px]',
                    'shadow-[0_6px_20px_rgba(15,23,42,0.15),inset_0_1px_1px_rgba(255,255,255,0.7)]',
                    'dark:border-white/15 dark:bg-white/[0.12] dark:shadow-[0_6px_20px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.18)]',
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
              className="relative z-10 flex flex-col items-center justify-center w-[20%] h-[52px] overflow-visible"
            >
              {/* iOS Liquid Glass Sliding Pill Indicator (Matched Curvature & Balanced Padding) */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  layout="position"
                  className={cn(
                    "absolute rounded-[26px] -z-10 h-[52px] w-[92%] max-w-[84px] sm:max-w-[100px] backdrop-blur-xl border border-transparent transition-colors duration-300",
                    item.id === 'today' && "bg-blue-500/22 dark:bg-blue-500/32 shadow-[0_4px_24px_rgba(59,130,246,0.38)] dark:shadow-[0_4px_28px_rgba(59,130,246,0.48)]",
                    item.id === 'good' && "bg-emerald-500/22 dark:bg-emerald-500/32 shadow-[0_4px_24px_rgba(16,185,129,0.38)] dark:shadow-[0_4px_28px_rgba(16,185,129,0.48)]",
                    item.id === 'bad' && "bg-rose-500/22 dark:bg-rose-500/32 shadow-[0_4px_24px_rgba(244,63,94,0.38)] dark:shadow-[0_4px_28px_rgba(244,63,94,0.48)]",
                    item.id === 'stats' && "bg-purple-500/22 dark:bg-purple-500/32 shadow-[0_4px_24px_rgba(168,85,247,0.38)] dark:shadow-[0_4px_28px_rgba(168,85,247,0.48)]"
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
