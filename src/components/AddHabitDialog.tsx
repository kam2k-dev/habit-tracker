import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { HabitType } from '@/types/habit';
import { Plus } from 'lucide-react';
import { BadHabitIcon } from '@/components/icons/BadHabitIcon';
import { GoodHabitIcon } from '@/components/icons/GoodHabitIcon';
import { useLanguage } from '@/context/language-context';

// Check if device is touch/mobile
const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

interface AddHabitDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, type: HabitType) => void;
  defaultType?: HabitType;
}

export function AddHabitDialog({ isOpen, onOpenChange, onAdd, defaultType = 'good' }: AddHabitDialogProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [type, setType] = useState<HabitType>(defaultType);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setType(prev => prev !== defaultType ? defaultType : prev);
    }
  }, [isOpen, defaultType]);

  // Auto-focus only on desktop (not mobile)
  useEffect(() => {
    if (isOpen && !isTouchDevice()) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError(t('addHabit.habitNamePlaceholder'));
      return;
    }
    
    onAdd(name.trim(), type);
    setName('');
    setType('good');
    setError('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setName('');
    setType('good');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-3xl origin-bottom data-[state=open]:animate-genie-in data-[state=closed]:animate-genie-out">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t('addHabit.addTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('addHabit.goodTypeDesc')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Habit Type Selection */}
          <div className="space-y-2">
            <Label>{t('addHabit.typeLabel')}</Label>
            <Tabs value={type} onValueChange={(v) => setType(v as HabitType)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="good" className="flex items-center gap-2">
                  <GoodHabitIcon className="h-4 w-4 text-emerald-500" />
                  {t('tabs.good')}
                </TabsTrigger>
                <TabsTrigger value="bad" className="flex items-center gap-2">
                  <BadHabitIcon className="h-4 w-4 text-rose-500" />
                  {t('tabs.bad')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-xs text-muted-foreground">
              {type === 'good' 
                ? t('addHabit.goodTypeDesc') 
                : t('addHabit.badTypeDesc')}
            </p>
          </div>

          {/* Habit Name */}
          <div className="space-y-2">
            <Label htmlFor="habit-name">{t('addHabit.habitNameLabel')}</Label>
            <Input
              ref={inputRef}
              id="habit-name"
              inputMode="text"
              enterKeyHint="done"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder={t('addHabit.habitNamePlaceholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
            />
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t('addHabit.cancelButton')}
          </Button>
          <Button 
            onClick={handleSubmit}
            className={type === 'good' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}
          >
            {t('addHabit.saveButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddHabitDialog;
