'use client';

import { useLanguage } from '@/context/language-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';

interface LanguageSwitchProps {
  className?: string;
}

export function LanguageSwitch({ className = '' }: LanguageSwitchProps) {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label="Switch language"
      title={language === 'id' ? 'Bahasa Indonesia (Click to switch to English)' : 'English (Click to switch to Bahasa Indonesia)'}
      className={`relative flex h-8 w-8 items-center justify-center rounded-full text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors overflow-hidden ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={language}
          initial={{ y: -12, opacity: 0, rotate: -60, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          exit={{ y: 12, opacity: 0, rotate: 60, scale: 0.5 }}
          transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex items-center justify-center"
        >
          <Globe className="h-5 w-5 text-foreground/90" />
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
