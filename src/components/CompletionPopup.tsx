import { useEffect, useState } from 'react';
import { Check, Minus } from 'lucide-react';
import type { HabitType } from '@/types/habit';

interface CompletionPopupProps {
  isOpen: boolean;
  habitName: string;
  type: HabitType;
  onClose: () => void;
}

export function CompletionPopup({ isOpen, habitName, type, onClose }: CompletionPopupProps) {
  const [show, setShow] = useState(false);
  const [randomMsg, setRandomMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShow(true), 50);
      // Set random message only when popup opens
      const messages = type === 'good' 
        ? ['Progres terbaik', 'Konsistensi adalah kunci', 'Terus berkembang']
        : ['Kesadaran adalah langkah pertama', 'Hari ini sudah cukup', 'Besok akan lebih baik'];
      setRandomMsg(messages[Math.floor(Math.random() * messages.length)]);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isOpen, type]);

  // Auto close
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => onClose(), 300);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 300);
  };

  if (!isOpen) return null;

  const isGood = type === 'good';

  return (
    <div 
      className={`fixed inset-x-0 bottom-28 z-[60] flex justify-center px-4 transition-all duration-300 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl max-w-sm w-fit shadow-lg border bg-card transition-all ${
          isGood ? 'border-emerald-200' : 'border-rose-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isGood ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
        }`}>
          {isGood ? <Check className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
        </div>

        {/* Content */}
        <div className="flex flex-col min-w-0">
          <p className={`text-sm font-semibold truncate ${
            isGood ? 'text-emerald-700' : 'text-rose-700'
          }`}>
            {isGood ? 'Berhasil!' : 'Tercatat'}
          </p>
          <p className="text-muted-foreground text-xs truncate">
            {habitName}
          </p>
        </div>

        {/* Motivational text */}
        <div className="hidden sm:block pl-3 border-l border-border">
          <p className="text-xs text-muted-foreground italic">
            {randomMsg}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CompletionPopup;
