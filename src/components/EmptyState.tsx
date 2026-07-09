'use client';
import { motion } from 'framer-motion';
import { Sunrise, Dumbbell, BookOpen, Plus } from 'lucide-react';
import { FlowButton } from '@/components/ui/flow-button';

interface EmptyStateProps {
  onAddHabit: () => void;
  onAddFromTemplate?: (template: string) => void;
}

const templates = [
  { name: 'Morning Routine', icon: Sunrise, habits: ['Minum air putih', 'Meditasi 5 menit', 'Stretching'] },
  { name: 'Fitness', icon: Dumbbell, habits: ['Jogging 30 menit', 'Push-up', 'Minum protein'] },
  { name: 'Reading', icon: BookOpen, habits: ['Baca 10 halaman', 'Catat quotes', 'Review buku'] },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 25,
    },
  },
};

const floatAnimation = {
  y: [0, -8, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
};

export function EmptyState({ onAddHabit: _onAddHabit, onAddFromTemplate }: EmptyStateProps) {
  return (
    <motion.div 
      className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Illustration */}
      <motion.div 
        className="mb-6 flex justify-center"
        variants={itemVariants}
        animate={floatAnimation}
      >
        <svg
          width="160"
          height="120"
          viewBox="0 0 160 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-muted-foreground"
        >
          {/* Person meditating */}
          <motion.circle 
            cx="80" cy="35" r="15" 
            className="fill-muted"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <path
            d="M65 55 Q80 45 95 55 L90 75 Q80 70 70 75 Z"
            className="fill-muted"
          />
          <ellipse cx="55" cy="70" rx="8" ry="4" className="fill-muted" />
          <ellipse cx="105" cy="70" rx="8" ry="4" className="fill-muted" />
          {/* Legs crossed */}
          <path
            d="M70 75 Q60 85 50 90 L110 90 Q100 85 90 75"
            className="fill-muted"
          />
          {/* Zzz indicators with animation */}
          <motion.text 
            x="100" y="25" 
            className="fill-muted-foreground text-sm"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
          >z</motion.text>
          <motion.text 
            x="108" y="20" 
            className="fill-muted-foreground text-xs"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          >z</motion.text>
          <motion.text 
            x="114" y="15" 
            className="fill-muted-foreground text-[10px]"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          >z</motion.text>
          {/* Sparkles with twinkle */}
          <motion.circle 
            cx="30" cy="40" r="2" 
            className="fill-emerald-400"
            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
          />
          <motion.circle 
            cx="130" cy="50" r="2" 
            className="fill-emerald-400"
            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
          <motion.circle 
            cx="40" cy="80" r="1.5" 
            className="fill-emerald-400"
            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
          />
        </svg>
      </motion.div>

      {/* Title */}
      <motion.h3 
        className="text-xl font-semibold mb-2"
        variants={itemVariants}
      >
        Mulai Perjalananmu
      </motion.h3>
      
      {/* Description */}
      <motion.p 
        className="text-muted-foreground mb-8 max-w-sm mx-auto"
        variants={itemVariants}
      >
        Bangun kebiasaan baik dan kurangi yang buruk. Satu langkah kecil hari ini adalah perubahan besar untuk masa depan.
      </motion.p>

      {/* Hint to use bottom nav plus button */}
      <motion.div 
        variants={itemVariants}
        className="mb-8 w-full max-w-sm"
      >
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 px-4 py-4 text-left shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Tambah kebiasaan dari menu + di bawah</p>
              <p className="text-xs text-muted-foreground mt-0.5">Gunakan navbar bawah untuk menambah kebiasaan baru kapan saja.</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Templates */}
      <motion.div 
        className="space-y-4"
        variants={itemVariants}
      >
        <p className="text-sm text-muted-foreground">Atau mulai dengan template:</p>
        <div className="flex flex-wrap justify-center gap-3">
          {templates.map((template, index) => (
            <motion.div
              key={template.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <FlowButton
                text={template.name}
                onClick={() => onAddFromTemplate?.(template.name)}
                variant="good"
                icon="arrow"
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default EmptyState;

