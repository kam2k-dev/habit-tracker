import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Plus
} from 'lucide-react';
import { HomeIcon } from '@/components/icons/HomeIcon';
import { GoodHabitIcon } from '@/components/icons/GoodHabitIcon';
import { BadHabitIcon } from '@/components/icons/BadHabitIcon';
import { TrendingIcon } from '@/components/icons/TrendingIcon';

export interface NavItem {
  id: string;
  label: string;
  icon: any; // Changed to any to support custom SVG icons
  color?: string;
}

interface FloatingBottomNavProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  onAddClick: () => void;
  className?: string;
  user?: {
    photoURL: string | null;
    displayName: string | null;
  } | null;
}

export function FloatingBottomNav({ 
  activeTab, 
  onTabChange, 
  onAddClick,
  className
}: FloatingBottomNavProps) {
  const [, setHoveredTab] = useState<string | null>(null);

  const items: NavItem[] = [
    { id: 'today', label: 'Hari Ini', icon: HomeIcon, color: 'text-blue-500' },
    { id: 'good', label: 'Baik', icon: GoodHabitIcon, color: 'text-emerald-500' },
    { id: 'add', label: 'Tambah', icon: Plus }, // Placeholder for central FAB
    { id: 'bad', label: 'Buruk', icon: BadHabitIcon, color: 'text-rose-500' },
    { id: 'stats', label: 'Stats', icon: TrendingIcon, color: 'text-purple-500' },
  ];

  return (
    <div className={cn(
      "fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md px-1",
      className
    )}>
      <div className="relative isolate flex h-16 items-center justify-between overflow-visible rounded-[2rem] border border-white/35 bg-white/[0.22] px-2 shadow-[0_18px_50px_rgba(15,23,42,0.22),inset_0_1px_1px_rgba(255,255,255,0.55),inset_0_-1px_1px_rgba(255,255,255,0.18)] ring-1 ring-white/35 backdrop-blur-[28px] backdrop-saturate-200 before:pointer-events-none before:absolute before:inset-[1px] before:-z-10 before:rounded-[1.9rem] before:bg-gradient-to-b before:from-white/45 before:via-white/12 before:to-white/5 dark:border-white/15 dark:bg-slate-950/[0.28] dark:shadow-[0_18px_55px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_-1px_1px_rgba(255,255,255,0.06)] dark:ring-white/10 dark:before:from-white/16 dark:before:via-white/7 dark:before:to-white/3 supports-[backdrop-filter]:bg-white/[0.18] supports-[backdrop-filter]:dark:bg-slate-950/[0.22]">
        <div className="pointer-events-none absolute inset-0 -z-20 rounded-[2rem] bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.55),transparent_28%),radial-gradient(circle_at_82%_88%,rgba(255,255,255,0.18),transparent_36%)] opacity-80 dark:opacity-30" />

        {items.map((item) => {
          const isActive = activeTab === item.id;
          const isAdd = item.id === 'add';
          const Icon = item.icon;

          if (isAdd) {
            return (
              <button
                key={item.id}
                onClick={onAddClick}
                onMouseEnter={() => setHoveredTab(item.id)}
                onMouseLeave={() => setHoveredTab(null)}
                aria-label="Tambah habit"
                className="relative z-10 flex h-12 w-[20%] flex-col items-center justify-center rounded-full transition-all duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/30 shadow-[0_8px_24px_rgba(15,23,42,0.12),inset_0_1px_1px_rgba(255,255,255,0.65)] backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.10] dark:shadow-[0_8px_24px_rgba(0,0,0,0.28),inset_0_1px_1px_rgba(255,255,255,0.14)]"
                >
                  <Plus className="h-[22px] w-[22px] text-foreground drop-shadow-sm dark:text-white" />
                </motion.div>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              onMouseEnter={() => setHoveredTab(item.id)}
              onMouseLeave={() => setHoveredTab(null)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className="relative z-10 flex h-12 w-[20%] flex-col items-center justify-center rounded-full transition-colors duration-300"
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.18 : 1,
                }}
                transition={{
                  scale: {
                    type: 'spring',
                    stiffness: 230,
                    damping: 26,
                    mass: 0.75,
                  },
                }}
                className={cn(
                  "relative flex h-11 w-11 transform-gpu items-center justify-center rounded-full transition-[background-color,border-color,box-shadow,backdrop-filter] duration-[400ms] ease-out will-change-transform",
                  isActive && "border border-white/40 bg-white/30 shadow-[0_8px_24px_rgba(15,23,42,0.12),inset_0_1px_1px_rgba(255,255,255,0.65)] backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.10] dark:shadow-[0_8px_24px_rgba(0,0,0,0.28),inset_0_1px_1px_rgba(255,255,255,0.14)]"
                )}
              >
                <Icon className={cn(
                  "h-[22px] w-[22px] transition-colors duration-[400ms] ease-out",
                  isActive ? "text-foreground drop-shadow-sm dark:text-white" : "text-foreground/45 dark:text-white/45",
                  isActive && item.color && item.color
                )} />
              </motion.div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
