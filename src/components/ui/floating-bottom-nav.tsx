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
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-lg",
      className
    )}>
      <div className="bg-card/70 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl shadow-black/10 rounded-full py-2 px-2 flex items-center justify-between relative ring-1 ring-white/20">
        
        {/* Animated background pill for active tab */}
        {activeTab !== 'add' && (
          <motion.div
            layoutId="active-pill"
            className="absolute bg-white/10 dark:bg-black/10 rounded-full h-[calc(100%-16px)] z-0 shadow-sm"
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              width: 'calc(20% - 8px)',
              left: `calc(${items.findIndex(i => i.id === activeTab) * 20}% + 4px)`
            }}
          />
        )}

        {items.map((item) => {
          const isActive = activeTab === item.id;
          const isAdd = item.id === 'add';
          const Icon = item.icon;

          if (isAdd) {
            return (
              <div key={item.id} className="w-[20%] flex justify-center z-10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onAddClick}
                  className="bg-primary text-primary-foreground h-12 w-12 -mt-6 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.15)] ring-4 ring-background dark:ring-background/80"
                >
                  <Plus className="h-6 w-6" />
                </motion.button>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              onMouseEnter={() => setHoveredTab(item.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className="w-[20%] flex flex-col items-center justify-center py-2 relative z-10 transition-colors"
            >
              <motion.div
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0
                }}
                className="relative"
              >
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isActive ? "text-foreground" : "text-muted-foreground/60",
                  isActive && item.color && item.color
                )} />
                {isActive && (
                  <motion.div 
                    layoutId="active-dot"
                    className={cn(
                      "absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                      item.id === 'good' ? 'bg-emerald-500' : 
                      item.id === 'bad' ? 'bg-rose-500' : 
                      item.id === 'today' ? 'bg-blue-500' : 'bg-foreground'
                    )}
                  />
                )}
              </motion.div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
