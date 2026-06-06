import { useState, useRef, useCallback } from 'react';
import type { Habit, HabitStats } from '@/types/habit';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Target,
  Trash2,
  Check,
  RotateCcw,
  Edit2,
  ChevronRight
} from 'lucide-react';
import { StreakIcon } from '@/components/icons/StreakIcon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { useConfetti } from '@/hooks/useConfetti';
import { useCountUp } from '@/hooks/useCountUp';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  stats: HabitStats;
  onToggle: () => void;
  onUpdate: (updates: Partial<Habit>) => void;
  onDelete: () => void;
  selectedDate: string;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent, habitId: string) => void;
  onDragOver?: (e: React.DragEvent, habitId: string) => void;
  onDrop?: (e: React.DragEvent, habitId: string) => void;
  isAnimating?: boolean;
  hideAfterComplete?: boolean; // For Today tab: hide after showing checkmark
  recentLogs?: { date: string; completed: boolean }[];
}

export function HabitCard({ 
  habit, 
  isCompleted, 
  stats, 
  onToggle, 
  onUpdate, 
  onDelete, 
  selectedDate,
  isDraggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  isAnimating = false,
  hideAfterComplete = false,
  recentLogs = []
}: HabitCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editName, setEditName] = useState(habit.name);
  const [isDragging, setIsDragging] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { triggerConfetti } = useConfetti();
  
  // Swipe gesture state
  const x = useMotionValue(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const swipeStartX = useRef(0);
  const SWIPE_THRESHOLD = 50; // Lower threshold for more responsive swipe
  
  // Long press detection for mobile detail popup
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);

  // Handle touch start for swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(true);
    
    // Long press detection
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setIsDetailPopupOpen(true);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);
  }, []);

  // Handle touch move for swipe with smooth tracking
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const diffX = touchX - swipeStartX.current;
    const diffY = Math.abs(touchY - touchStartY.current);
    
    // Cancel long press if moving horizontally or vertically
    if ((Math.abs(diffX) > 10 || diffY > 10) && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // Only allow swipe if not dragging vertically significantly
    if (diffY < Math.abs(diffX) * 0.5) {
      // Less resistance for more responsive feel
      const resistance = 0.95;
      const dampedX = diffX * resistance;
      x.set(dampedX);
    }
  }, [isSwiping, x]);

  const isGood = habit.type === 'good';
  
  // Use count-up for statistics in expanded view
  const animatedStreak = useCountUp(stats.currentStreak, 1000);
  const animatedTotal = useCountUp(stats.totalCompleted, 1000);
  const animatedRate = useCountUp(stats.completionRate, 1200);

  // SVG circular progress properties
  const radius = 30;
  const circumference = 2 * Math.PI * radius;

  // Detect touch device - disable drag on mobile (HTML5 drag doesn't work on mobile)
  const isTouchDevice = typeof window !== 'undefined' && 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const canDrag = isDraggable && !isTouchDevice;

  // Use local timezone for date comparison (not UTC)
  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const isToday = selectedDate === localDate;
  
  // Calculate yesterday's date
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  const isYesterday = selectedDate === yesterdayDate;
  
  // Grace period: allow checking yesterday's habits until 12:00 PM (noon) today
  const currentHour = today.getHours();
  const isGracePeriod = isYesterday && currentHour < 12;
  const canToggle = isToday || isGracePeriod;

  const handleSaveEdit = () => {
    if (editName.trim()) {
      onUpdate({ name: editName.trim() });
      setIsEditDialogOpen(false);
    }
  };

  const handleCheckboxToggle = () => {
    if (!canToggle || isChecking) return;
    
    // Don't toggle if it was a long press
    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }
    
    setIsChecking(true);
    
    // Trigger confetti if completing (not unchecking)
    if (!isCompleted) {
      triggerConfetti(isGood);
    }
    
    const delay = hideAfterComplete ? 700 : 350;
    
    // Haptic feedback on successful toggle
    if (navigator.vibrate) {
      navigator.vibrate(isCompleted ? 15 : 30); // Shorter for uncheck, longer for check
    }
    
    setTimeout(() => {
      onToggle();
      setIsChecking(false);
    }, delay);
  };

  // Handle touch end for swipe with iOS-style spring animation
  const handleTouchEnd = useCallback(() => {
    setIsSwiping(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    const currentX = x.get();
    const velocity = x.getVelocity();
    
    // iOS-style spring config - faster snap back
    const iosSpring = {
      type: 'spring' as const,
      stiffness: 500,
      damping: 30,
      mass: 0.6,
      velocity: velocity * 0.5
    };
    
    // Lower velocity threshold for easier triggering
    const velocityThreshold = 300;
    
    // Swipe right - toggle complete/uncheck
    if (currentX > SWIPE_THRESHOLD || (currentX > 20 && velocity > velocityThreshold)) {
      if (canToggle) {
        animate(x, 0, iosSpring);
        // Haptic feedback on action
        if (navigator.vibrate) navigator.vibrate(10);
        handleCheckboxToggle();
      } else {
        animate(x, 0, iosSpring);
      }
    }
    // Swipe left - delete
    else if (currentX < -SWIPE_THRESHOLD || (currentX < -20 && velocity < -velocityThreshold)) {
      animate(x, 0, iosSpring);
      if (navigator.vibrate) navigator.vibrate(10);
      setIsDeleteDialogOpen(true);
    }
    // Reset with quick snap
    else {
      animate(x, 0, iosSpring);
    }
  }, [x, isCompleted, isToday, habit.archived, canToggle]);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    // Haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    if (onDragStart) {
      onDragStart(e, habit.id);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (onDragOver) {
      onDragOver(e, habit.id);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (onDrop) {
      onDrop(e, habit.id);
    }
  };

  return (
    <>
      <motion.div
        initial={false}
        animate={isAnimating ? { opacity: 0, scale: 0.95, y: -10 } : { opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: isAnimating ? 0.08 : 0,
        }}
        style={{ willChange: 'transform, opacity' }}
        className="relative"
      >
        {/* Swipe Background Layer - Icons on exposed side */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          {/* Left side - Delete (Red) - icon on RIGHT so it's visible when swiping left */}
          <motion.div 
            className="absolute inset-y-0 left-0 w-full bg-rose-500 flex items-center justify-end"
            style={{ 
              opacity: useTransform(x, [-80, -40, 0], [1, 0.5, 0]),
              x: useTransform(x, [-80, 0], [-20, 0]),
            }}
          >
            <div className="pr-5">
              <Trash2 className="h-7 w-7 text-white drop-shadow-md" />
            </div>
          </motion.div>
          {/* Right side - Complete/Uncheck - icon on LEFT so it's visible when swiping right */}
          <motion.div 
            className={`absolute inset-y-0 right-0 w-full flex items-center justify-start ${isCompleted ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ 
              opacity: useTransform(x, [0, 40, 80], [0, 0.5, 1]),
              x: useTransform(x, [0, 80], [20, 0]),
            }}
          >
            <div className="pl-5">
              {isCompleted ? (
                <RotateCcw className="h-7 w-7 text-white drop-shadow-md" />
              ) : (
                <Check className="h-7 w-7 text-white drop-shadow-md" />
              )}
            </div>
          </motion.div>
        </div>

        {/* Main Card with Swipe */}
        <motion.div
          style={{ x }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          drag={isTouchDevice ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
        >
          <Card 
            className={`habit-card p-4 transition-all duration-300 relative overflow-hidden group transform-gpu will-change-transform hover:-translate-y-1 hover:shadow-xl hover:border-primary/20 ${
              isDragging ? 'dragging scale-[1.02] shadow-2xl z-50' : ''
            } ${isSwiping ? 'cursor-grabbing' : ''} ${
              isCompleted 
                ? 'bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-white/20 dark:border-white/10 opacity-75' 
                : 'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-lg border-white/40 dark:border-white/10'
            }`}
            draggable={canDrag}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
          <div className="flex items-center gap-3 relative transition-transform duration-300 group-hover:translate-x-0.5">
            {/* Checkbox - Kiri khusus untuk klik */}
            <motion.div
              animate={isChecking ? { scale: [1, 1.18, 0.92, 1], opacity: 1 } : isCompleted ? { scale: 1.08, opacity: 1 } : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              onContextMenu={(e) => e.preventDefault()}
              className="touch-manipulation"
            >
              <motion.div
                key={isCompleted ? 'done' : 'idle'}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              >
                <Checkbox
                  checked={isCompleted}
                  onCheckedChange={handleCheckboxToggle}
                  disabled={!canToggle || isChecking}
                  className={`h-6 w-6 rounded-full border-2 habit-checkbox shrink-0 z-20 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
                    isGood 
                      ? 'data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 data-[state=checked]:shadow-[0_0_20px_rgba(16,185,129,0.7)]' 
                      : 'data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500 data-[state=checked]:shadow-[0_0_20px_rgba(244,63,94,0.7)]'
                  } ${isChecking ? 'opacity-70 scale-90' : 'opacity-100 hover:scale-110'}`}
                />
              </motion.div>
            </motion.div>

            {/* Habit Info - Tengah sampai Kanan untuk Drag */}
            <div 
              className={`flex-1 min-w-0 ${canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex flex-col justify-center gap-1.5 py-0.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <h3 className={`font-medium truncate text-sm sm:text-base ${
                      isCompleted
                        ? 'line-through text-muted-foreground'
                        : isGood
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {habit.name}
                    </h3>
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0"
                    >
                      <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                    </motion.div>
                  </div>

                  {/* Stats - Kanan inline */}
                  <div className="flex items-center gap-2 shrink-0 text-[10px] text-muted-foreground">
                    {stats.currentStreak > 0 && (
                      <div className="flex items-center gap-1 text-orange-500">
                        <StreakIcon className="h-3 w-3" />
                        <span>{animatedStreak}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>{animatedTotal}x</span>
                    </div>
                  </div>
                </div>

                {/* Baris 2: Mini dots */}
                {!isCompleted && recentLogs && recentLogs.length > 0 && (
                  <div className="flex items-center gap-1 shrink-0">
                    {recentLogs.map((log, idx) => (
                      <div
                        key={log.date}
                        className={cn(
                          "w-2.5 h-2.5 rounded-[2px] transition-all duration-500",
                          log.completed 
                            ? (isGood ? "bg-emerald-500" : "bg-rose-500") 
                            : "bg-muted-foreground/15 border border-border/5"
                        )}
                        style={{
                          opacity: log.completed ? (0.4 + (idx * 0.1)) : 1
                        }}
                        title={`${log.date}: ${log.completed ? 'Selesai' : 'Belum selesai'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>

        {/* Expandable Section */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-border/50 space-y-4">
                <div className="flex items-center gap-6">
                  {/* Circular Progress */}
                  <div className="relative w-20 h-20 shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-muted/20"
                      />
                      <motion.circle
                        cx="40"
                        cy="40"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - (stats.completionRate / 100) * circumference }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={isGood ? "text-emerald-500" : "text-rose-500"}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs font-bold leading-none">{animatedRate}%</span>
                      <span className="text-[8px] text-muted-foreground">Goal</span>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3">
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Current Streak</p>
                      <p className="text-sm font-semibold flex items-center gap-1">
                        <StreakIcon className="h-3.5 w-3.5 text-orange-500" />
                        {animatedStreak} hari
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Best Streak</p>
                      <p className="text-sm font-semibold">{stats.longestStreak} hari</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Total Selesai</p>
                      <p className="text-sm font-semibold">{animatedTotal} kali</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Status</p>
                      <p className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded-full inline-block text-center",
                        stats.completionRate >= 75 ? "bg-emerald-500/10 text-emerald-600" : 
                        stats.completionRate >= 50 ? "bg-blue-500/10 text-blue-600" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {stats.completionRate >= 75 ? 'Excellent' : stats.completionRate >= 50 ? 'Good' : 'Needs work'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar info */}
                <div className="flex justify-end pt-2">
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="h-auto p-0 text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1"
                    onClick={() => setIsDetailPopupOpen(true)}
                  >
                    Buka Riwayat Lengkap <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      </motion.div>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kebiasaan</DialogTitle>
            <DialogDescription>
              Ubah nama kebiasaanmu di sini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kebiasaan</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Masukkan nama kebiasaan"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveEdit}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Kebiasaan</DialogTitle>
            <DialogDescription>
              Apakah kamu yakin ingin menghapus kebiasaan &quot;{habit.name}&quot;? 
              Semua data riwayat juga akan dihapus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Popup for Mobile Long Press */}
      <Dialog open={isDetailPopupOpen} onOpenChange={setIsDetailPopupOpen}>
        <DialogContent className="sm:max-w-[280px]">
          <DialogHeader>
            <DialogTitle className={`text-lg ${isGood ? 'text-emerald-600' : 'text-rose-600'}`}>
              {habit.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isGood ? 'Kebiasaan Baik' : 'Kebiasaan Buruk'} • {isCompleted ? 'Selesai' : 'Belum Selesai'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Selesai</span>
              <span className="font-medium">{stats.totalCompleted}x</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Streak Saat Ini</span>
              <span className="font-medium text-orange-500">{stats.currentStreak} hari</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tingkat Penyelesaian</span>
              <span className="font-medium">{stats.completionRate}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Streak Terpanjang</span>
              <span className="font-medium">{stats.longestStreak} hari</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDetailPopupOpen(false)} className="w-full">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
