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
  const [name, setName] = useState('');
  const [type, setType] = useState<HabitType>(defaultType);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Update type when defaultType changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
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
      setError('Nama kebiasaan tidak boleh kosong');
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Tambah Kebiasaan Baru
          </DialogTitle>
          <DialogDescription>
            Tambahkan kebiasaan yang ingin kamu track setiap hari.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Habit Type Selection */}
          <div className="space-y-2">
            <Label>Jenis Kebiasaan</Label>
            <Tabs value={type} onValueChange={(v) => setType(v as HabitType)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="good" className="flex items-center gap-2">
                  <GoodHabitIcon className="h-4 w-4 text-emerald-500" />
                  Baik
                </TabsTrigger>
                <TabsTrigger value="bad" className="flex items-center gap-2">
                  <BadHabitIcon className="h-4 w-4 text-rose-500" />
                  Buruk
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-xs text-muted-foreground">
              {type === 'good' 
                ? 'Kebiasaan baik yang ingin kamu bangun dan pertahankan.' 
                : 'Kebiasaan buruk yang ingin kamu kurangi atau hilangkan.'}
            </p>
          </div>

          {/* Habit Name */}
          <div className="space-y-2">
            <Label htmlFor="habit-name">Nama Kebiasaan</Label>
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
              placeholder={type === 'good' ? 'Contoh: Olahraga 30 menit' : 'Contoh: Main HP sebelum tidur'}
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
            Batal
          </Button>
          <Button 
            onClick={handleSubmit}
            className={type === 'good' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}
          >
            Tambah Kebiasaan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddHabitDialog;
