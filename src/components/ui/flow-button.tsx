'use client';
import { Plus, ArrowRight, type LucideIcon } from 'lucide-react';

interface FlowButtonProps {
  text?: string;
  onClick?: () => void;
  variant?: 'good' | 'bad';
  fullWidth?: boolean;
  icon?: 'plus' | 'arrow';
}

export function FlowButton({ 
  text = "Modern Button", 
  onClick, 
  variant = 'good', 
  fullWidth = false,
  icon = 'plus'
}: FlowButtonProps) {
  const isGood = variant === 'good';
  const IconComponent: LucideIcon = icon === 'plus' ? Plus : ArrowRight;
  
  return (
    <button 
      onClick={onClick}
      className={`group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-full border px-4 py-2 text-xs font-semibold cursor-pointer transition-all duration-300 active:scale-[0.97] ${
        fullWidth ? 'w-full max-w-[220px]' : 'w-fit'
      } ${
        isGood 
          ? 'border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40 dark:hover:bg-emerald-500/15' 
          : 'border-rose-500/20 bg-rose-50/60 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/40 dark:hover:bg-rose-500/15'
      }`}
    >
      <IconComponent 
        className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 ${
          isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
        }`} 
      />

      <span className="relative z-[1] whitespace-nowrap">
        {text}
      </span>
    </button>
  );
}
