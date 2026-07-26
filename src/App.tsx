import { useState, useEffect, useMemo, useRef, lazy, Suspense, memo } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/language-context';
import { Navbar1 } from '@/components/ui/navbar-1';
import { FloatingBottomNav } from '@/components/ui/floating-bottom-nav';
import { DailyHero } from '@/components/DailyHero';
import { StatsSkeleton, ShimmerSkeleton, HabitCardSkeleton } from '@/components/ui/shimmer-skeleton';
import { TodayPageSkeleton, StatsPageSkeleton } from '@/components/ui/page-skeletons';
import type { ContributionDay } from '@/components/ui/git-hub-calendar';
import { HabitCard } from '@/components/HabitCard';
import { DateSelector } from '@/components/DateSelector';
import { Login } from '@/components/Login';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BadHabitIcon } from '@/components/icons/BadHabitIcon';
import { GoodHabitIcon } from '@/components/icons/GoodHabitIcon';
import type { HabitType } from '@/types/habit';
import { Toaster, toast } from 'sonner';
import { subDays, format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';

// Lazy load popup components (heavy Dialog from Radix)
const DayDetailPopup = lazy(() => import('@/components/DayDetailPopup'));
const AddHabitDialog = lazy(() => import('@/components/AddHabitDialog'));
const StatsOverview = lazy(() => import('@/components/StatsOverview'));
const EmptyState = lazy(() => import('@/components/EmptyState'));
const AllDoneState = lazy(() => import('@/components/AllDoneState'));
const GitHubCalendar = lazy(() => import('@/components/ui/git-hub-calendar').then(m => ({ default: m.GitHubCalendar })));

// Memoized HabitCard to prevent unnecessary re-renders
const MemoizedHabitCard = memo(HabitCard);

// Generate last 365 days of dates - only once
const generateDates = (): string[] => {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const date = subDays(today, i);
    dates.push(format(date, 'yyyy-MM-dd'));
  }
  return dates;
};

// Pre-calculate all dates (constant)
const ALL_DATES = generateDates();

function App() {
  const { t, currentTranslations } = useLanguage();
  const { user, loading: authLoading, isPreviewMode, logout, requestSignIn } = useAuth();
  
  // Load custom avatar from localStorage on mount
  const [customAvatar, setCustomAvatar] = useState<string | null>(() => {
    const saved = localStorage.getItem('customAvatar');
    return saved || null;
  });
  
  // Save custom avatar to localStorage when it changes
  useEffect(() => {
    if (customAvatar) {
      localStorage.setItem('customAvatar', customAvatar);
    } else {
      localStorage.removeItem('customAvatar');
    }
  }, [customAvatar]);



  const {
    activeHabits,
    logs,
    isLoaded,
    addHabit,
    updateHabit,
    deleteHabit,
    deleteAllHabits,
    toggleHabitLog,
    getHabitLog,
    getRecentHabitLogs,
    getHabitStats,
  } = useHabits();

  // All hooks must be before any early return
  const [selectedDate, setSelectedDate] = useState(() => {
    // Use local timezone (not UTC) for date
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);
  
  // Deteksi streak reset (Brian Tracy concept)
  useEffect(() => {
    if (!isLoaded || activeHabits.length === 0) return;
    
    try {
      const notifiedResetsStr = localStorage.getItem('notifiedResets');
      const notifiedResets = notifiedResetsStr ? JSON.parse(notifiedResetsStr) : {};
      let updated = false;

      activeHabits.forEach(habit => {
        const stats = getHabitStats(habit.id);
        // Jika streak 0 tapi pernah ada history
        if (stats.currentStreak === 0 && stats.totalCompleted > 0) {
          const habitLogs = logs.filter(l => l.habitId === habit.id && l.completed);
          if (habitLogs.length > 0) {
            habitLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const lastDate = habitLogs[0].date;
            
            // Jika reset ini belum pernah dinotifikasi
            if (notifiedResets[habit.id] !== lastDate) {
              toast.error(t('toast.streakReset', { name: habit.name }), {
                duration: 8000,
                icon: '⚠️'
              });
              notifiedResets[habit.id] = lastDate;
              updated = true;
            }
          }
        }
      });

      if (updated) {
        localStorage.setItem('notifiedResets', JSON.stringify(notifiedResets));
      }
    } catch (e) {
      console.error("Error checking streak resets", e);
    }
  }, [isLoaded, activeHabits, logs, getHabitStats, t]);
  
  const [addHabitType, setAddHabitType] = useState<HabitType>('good');
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  
  // State for drag ordering in Today tab
  const [todayOrder, setTodayOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('todayHabitOrder');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Track which habits are animating (fading out)
  const [animatingHabits, setAnimatingHabits] = useState<Set<string>>(new Set());
  
  // Track habits waiting to be hidden in Today tab (keep visible during delay)
  const [pendingHideHabits, setPendingHideHabits] = useState<Set<string>>(new Set());
  
  // Completion popup state
  // [REMOVED] - Popup penyelesaian dihapus sesuai permintaan user

  // Day detail popup state
  const [dayDetailPopup, setDayDetailPopup] = useState<{
    isOpen: boolean;
    date: string | null;
  }>({
    isOpen: false,
    date: null,
  });

  // Drag and drop state - MUST be before any early return
  const [draggedHabitId, setDraggedHabitId] = useState<string | null>(null);
  
  // Save order to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('todayHabitOrder', JSON.stringify(todayOrder));
  }, [todayOrder]);

  // Clear pending/animating habits when leaving Today tab or habits change
  useEffect(() => {
    if (activeTab !== 'today') {
      setPendingHideHabits(prev => prev.size > 0 ? new Set() : prev);
      setAnimatingHabits(prev => prev.size > 0 ? new Set() : prev);
    }
  }, [activeTab]);

  // Initialize todayOrder when habits change - MUST be before any early return
  useEffect(() => {
    const habitIds = activeHabits.map(h => h.id);
    const hasNewIds = habitIds.some(id => !todayOrder.includes(id));
    const hasRemovedIds = todayOrder.some(id => !habitIds.includes(id));

    if (hasNewIds || hasRemovedIds) {
      setTodayOrder(prev => {
        const newIds = habitIds.filter(id => !prev.includes(id));
        const validOrder = prev.filter(id => habitIds.includes(id));
        return [...validOrder, ...newIds];
      });
    }
  }, [activeHabits, todayOrder]);

  // Initialize dark mode on mount from localStorage (compatibility with old key or new key)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || localStorage.getItem('darkMode');
    const isDark = savedTheme === 'dark' || savedTheme === 'true' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Generate contribution data with good/bad counts - OPTIMIZED
  const contributionData: ContributionDay[] = useMemo(() => {
    if (!user || !isLoaded) return [];

    // Pre-index habits by ID for O(1) lookup instead of O(n) find()
    const habitTypeById = new Map<string, string>();
    for (const habit of activeHabits) {
      habitTypeById.set(habit.id, habit.type);
    }

    // Pre-index logs by date for O(1) lookup
    const logsByDate = new Map<string, { good: number; bad: number }>();
    for (const log of logs) {
      if (!log.completed) continue;
      const habitType = habitTypeById.get(log.habitId);
      if (!habitType) continue;

      const existing = logsByDate.get(log.date);
      if (existing) {
        if (habitType === 'good') existing.good++;
        else existing.bad++;
      } else {
        logsByDate.set(log.date, {
          good: habitType === 'good' ? 1 : 0,
          bad: habitType === 'bad' ? 1 : 0,
        });
      }
    }

    // Build data array in single pass - O(365) instead of O(365 * n * m)
    const data = ALL_DATES.map(date => {
      const counts = logsByDate.get(date) || { good: 0, bad: 0 };
      return {
        date,
        goodCount: Math.min(counts.good, 4),
        badCount: Math.min(counts.bad, 4),
      };
    });

    return data;
  }, [logs, activeHabits, user, isLoaded]);

  // Create key for calendar re-render - use total activity count for efficient change detection
  const calendarKey = useMemo(() => {
    const totalActivity = contributionData.reduce((sum, d) => sum + d.goodCount + d.badCount, 0);
    const nonZeroDays = contributionData.filter(d => d.goodCount > 0 || d.badCount > 0).length;
    return `${totalActivity}-${nonZeroDays}-${contributionData.length}`;
  }, [contributionData]);

  // Show welcome toast on first load (always call hook)
  useEffect(() => {
    // Welcome toast removed to keep the interface clean
  }, [isLoaded, user, activeHabits.length]);

  // Show skeleton instead of spinner during auth initialization
  if (authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <ShimmerSkeleton height="56px" borderRadius="0" className="w-full border-b" />
        <main className="max-w-4xl mx-auto px-4 pt-8 pb-6 space-y-6">
          <StatsSkeleton />
          <div className="space-y-4 mt-8">
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <ShimmerSkeleton key={i} width="96px" height="40px" borderRadius="6px" />
              ))}
            </div>
            <ShimmerSkeleton height="48px" borderRadius="12px" />
            {[...Array(3)].map((_, i) => (
              <HabitCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Redirect to login if not authenticated and not in preview mode
  if (!user && !isPreviewMode) {
    return <Login />;
  }

  // Use guest user object for preview mode
  const currentUser = user || (isPreviewMode ? {
    displayName: 'Guest User',
    email: 'guest@example.com',
    photoURL: null,
  } as any : null);

  const handleAddHabit = (name: string, type: HabitType) => {
    if (isPreviewMode) {
      toast.info('Sign in to save your habits permanently!', {
        description: 'You are currently in Preview Mode.',
      });
    }
    addHabit(name, type);
    toast.success('Kebiasaan berhasil ditambahkan!', {
      description: `"${name}" telah ditambahkan ke daftar kebiasaan ${type === 'good' ? 'baik' : 'buruk'}.`,
    });
  };

  const handleAddFromTemplate = (templateKey: string) => {
    const templatesMap = currentTranslations.templates;
    const templateData = templatesMap[templateKey as keyof typeof templatesMap];

    if (templateData && typeof templateData === 'object' && 'habits' in templateData) {
      const habitsList = (templateData as { name: string; habits: string[] }).habits;
      const templateName = (templateData as { name: string; habits: string[] }).name;
      habitsList.forEach((habitName, index) => {
        setTimeout(() => {
          addHabit(habitName, 'good');
        }, index * 200);
      });
      const titleMsg = templatesMap.templateAdded.replace('{name}', templateName);
      const descMsg = templatesMap.habitsAddedCount.replace('{count}', String(habitsList.length));
      toast.success(titleMsg, {
        description: descMsg,
      });
    }
  };

  const handleDeleteHabit = (id: string, name: string) => {
    deleteHabit(id);
    toast.success('Kebiasaan dihapus', {
      description: `"${name}" telah dihapus dari daftar.`,
    });
  };

  const handleToggleHabit = async (habitId: string, _habitName: string, _type: HabitType) => {
    const wasCompleted = getHabitLog(habitId, selectedDate);
    
    // For Today tab: IMMEDIATELY add to pendingHide BEFORE async operation
    // This ensures the habit stays visible during the entire animation
    if (!wasCompleted && activeTabRef.current === 'today') {
      setPendingHideHabits(prev => new Set([...prev, habitId]));
    }
    
    const isCompleted = await toggleHabitLog(habitId, selectedDate);

    // Add fade animation when completing (checking) a habit
    if (isCompleted && !wasCompleted) {
      // Haptic feedback for successful completion
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
      
      // Delay before starting fade animation:
      // - Today tab: 500ms to see checkmark + strikethrough before fading
      // - Other tabs: 200ms quick feedback
      const isTodayTab = activeTabRef.current === 'today';
      const animDelay = isTodayTab ? 500 : 200;
      
      setTimeout(() => {
        setAnimatingHabits(prev => new Set([...prev, habitId]));
        
        // Remove from pendingHide and animating after animation completes
        const animDuration = isTodayTab ? 800 : 600;
        setTimeout(() => {
          // Remove from animating first
          setAnimatingHabits(prev => {
            const next = new Set([...prev]);
            next.delete(habitId);
            return next;
          });
          // Then remove from pendingHide to trigger re-render
          setPendingHideHabits(prev => {
            const next = new Set([...prev]);
            next.delete(habitId);
            return next;
          });
        }, animDuration);
      }, animDelay);
    }

    // Show popup when completing a habit
    // [REMOVED] - Logika popup penyelesaian dihapus
  };

  const handleDragStart = (e: React.DragEvent, habitId: string) => {
    setDraggedHabitId(habitId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, habitId: string) => {
    e.preventDefault();
    if (!draggedHabitId || draggedHabitId === habitId) return;
    
    // Reorder habits
    const allTodayIds = [...todayOrder];
    const draggedIndex = allTodayIds.indexOf(draggedHabitId);
    const targetIndex = allTodayIds.indexOf(habitId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Remove dragged item
      allTodayIds.splice(draggedIndex, 1);
      // Insert at new position
      allTodayIds.splice(targetIndex, 0, draggedHabitId);
      setTodayOrder(allTodayIds);
    }
  };

  const handleDrop = (e: React.DragEvent, _habitId: string) => {
    e.preventDefault();
    setDraggedHabitId(null);
    // iOS-style haptic feedback on successful drop
    if (navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }
  };

  const handleDeleteAllHabits = async () => {
    setIsDeleteAllDialogOpen(true);
  };

  const confirmDeleteAllHabits = async () => {
    setIsDeleteAllDialogOpen(false);
    await deleteAllHabits();
    toast.success('Semua kebiasaan dihapus', {
      description: 'Semua kebiasaan dan log telah dihapus.',
    });
  };

  // Get ordered habits for Today tab (completed habits go to bottom)
  const todayHabits = (() => {
    // Filter out completed habits (unless pending hide or animating)
    const visibleHabits = activeHabits.filter(h => {
      const log = logs.find(l => l.habitId === h.id && l.date === selectedDate);
      const isCompleted = log?.completed || false;
      // Show if: not completed, OR pending hide, OR animating
      return !isCompleted || pendingHideHabits.has(h.id) || animatingHabits.has(h.id);
    });
    
    // Separate incomplete and completed habits
    const incomplete = visibleHabits.filter(h => {
      const log = logs.find(l => l.habitId === h.id && l.date === selectedDate);
      return !log?.completed;
    });
    const completed = visibleHabits.filter(h => {
      const log = logs.find(l => l.habitId === h.id && l.date === selectedDate);
      return log?.completed;
    });
    
    // Sort function by todayOrder
    const sortByOrder = (habits: typeof activeHabits) => {
      if (todayOrder.length === 0) return habits;
      return [...habits].sort((a, b) => {
        const indexA = todayOrder.indexOf(a.id);
        const indexB = todayOrder.indexOf(b.id);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    };
    
    // Return incomplete first, then completed at bottom
    return [...sortByOrder(incomplete), ...sortByOrder(completed)];
  })();

  // Get all habits for Good/Bad tabs (completed go to bottom)
  const allHabits = (() => {
    // Sort function by todayOrder
    const sortByOrder = (habits: typeof activeHabits) => {
      if (todayOrder.length === 0) return habits;
      return [...habits].sort((a, b) => {
        const indexA = todayOrder.indexOf(a.id);
        const indexB = todayOrder.indexOf(b.id);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    };

    // Split by completion status
    const incomplete = activeHabits.filter(h => {
      const log = logs.find(l => l.habitId === h.id && l.date === selectedDate);
      return !log?.completed;
    });
    const completed = activeHabits.filter(h => {
      const log = logs.find(l => l.habitId === h.id && l.date === selectedDate);
      return log?.completed;
    });

    // Return incomplete first, then completed at bottom
    return [...sortByOrder(incomplete), ...sortByOrder(completed)];
  })();
  
  // Today tab - only show incomplete habits
  const goodHabitsToday = todayHabits.filter(h => h.type === 'good');
  const badHabitsToday = todayHabits.filter(h => h.type === 'bad');

  // Check if all habits are completed for today
  const allHabitsCompleted = activeHabits.length > 0 && todayHabits.length === 0;

  // Good/Bad tabs - show all habits
  const goodHabitsAll = allHabits.filter(h => h.type === 'good');
  const badHabitsAll = allHabits.filter(h => h.type === 'bad');

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar1
          user={currentUser ? { ...currentUser, photoURL: customAvatar || currentUser.photoURL } : null}
          activeHabitsCount={0}
          onLogout={logout}
          onRequestSignIn={requestSignIn}
          onDeleteAll={handleDeleteAllHabits}
          onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          onAvatarChange={setCustomAvatar}
          isPreviewMode={isPreviewMode}
        />
        <main className="max-w-4xl mx-auto px-4 pt-8 pb-6 space-y-6">
          {activeTab === 'stats' ? <StatsPageSkeleton /> : <TodayPageSkeleton />}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster 
        position="top-center" 
        richColors 
        toastOptions={{
          className: "rounded-2xl border-none shadow-xl backdrop-blur-xl bg-white/80 dark:bg-black/80 font-sans",
          style: {
            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
          },
          duration: 3000,
        }}
      />
      
      {/* Navbar */}
      <Navbar1
        user={currentUser ? { ...currentUser, photoURL: customAvatar || currentUser.photoURL } : null}
        activeHabitsCount={activeHabits.length}
        onLogout={logout}
        onRequestSignIn={requestSignIn}
        onDeleteAll={handleDeleteAllHabits}
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onAvatarChange={setCustomAvatar}
        isPreviewMode={isPreviewMode}
      />

      <main className="max-w-4xl mx-auto px-4 pt-8 pb-6 space-y-6">
        {/* Daily Hero Section - Only show on Today tab */}
        {activeTab === 'today' && (
          <DailyHero 
            userName={currentUser?.displayName || 'User'}
            totalHabits={activeHabits.length}
            completedCount={activeHabits.filter(h => getHabitLog(h.id, selectedDate)).length}
            streak={activeHabits.reduce((acc, h) => Math.max(acc, getHabitStats(h.id).currentStreak), 0)}
            goodCount={activeHabits.filter(h => h.type === 'good' && getHabitLog(h.id, selectedDate)).length}
            badCount={activeHabits.filter(h => h.type === 'bad' && getHabitLog(h.id, selectedDate)).length}
          />
        )}

        {/* Main Content Tabs */}
        {activeTab !== 'stats' && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today">{t('tabs.today')}</TabsTrigger>
              <TabsTrigger value="good">{t('stats.goodHabits')}</TabsTrigger>
              <TabsTrigger value="bad">{t('stats.badHabits')}</TabsTrigger>
            </TabsList>

            {/* Today Tab */}
            <TabsContent value="today" className="space-y-4 mt-4 pb-32">
            <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
            
            {activeHabits.length === 0 ? (
              <Suspense fallback={null}>
                <EmptyState
                  onAddHabit={() => {
                    setAddHabitType('good');
                    setIsAddDialogOpen(true);
                  }}
                  onAddFromTemplate={handleAddFromTemplate}
                />
              </Suspense>
            ) : allHabitsCompleted ? (
              <Suspense fallback={null}>
                <AllDoneState
                  totalHabits={activeHabits.length}
                  onViewGoodHabits={() => setActiveTab('good')}
                  onViewBadHabits={() => setActiveTab('bad')}
                />
              </Suspense>
            ) : (
              <div className="space-y-3">
                {goodHabitsToday.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <GoodHabitIcon className="h-4 w-4 text-emerald-500" />
                      {t('stats.goodHabits')}
                    </h3>
                    <div className="space-y-2">
                      {goodHabitsToday.map(habit => (
                        <MemoizedHabitCard
                          key={habit.id}
                          habit={habit}
                          isCompleted={getHabitLog(habit.id, selectedDate)}
                          stats={getHabitStats(habit.id)}
                          recentLogs={getRecentHabitLogs(habit.id)}
                          onToggle={() => handleToggleHabit(habit.id, habit.name, habit.type)}
                          onUpdate={(updates) => updateHabit(habit.id, updates)}
                          onDelete={() => handleDeleteHabit(habit.id, habit.name)}
                          selectedDate={selectedDate}
                          isDraggable={true}
                          onDragStart={handleDragStart}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          isAnimating={animatingHabits.has(habit.id)}
                          hideAfterComplete={true}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {badHabitsToday.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <BadHabitIcon className="h-4 w-4 text-rose-500" />
                      {t('stats.badHabits')}
                    </h3>
                    <div className="space-y-2">
                      {badHabitsToday.map(habit => (
                        <MemoizedHabitCard
                          key={habit.id}
                          habit={habit}
                          isCompleted={getHabitLog(habit.id, selectedDate)}
                          stats={getHabitStats(habit.id)}
                          recentLogs={getRecentHabitLogs(habit.id)}
                          onToggle={() => handleToggleHabit(habit.id, habit.name, habit.type)}
                          onUpdate={(updates) => updateHabit(habit.id, updates)}
                          onDelete={() => handleDeleteHabit(habit.id, habit.name)}
                          selectedDate={selectedDate}
                          isDraggable={true}
                          onDragStart={handleDragStart}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          isAnimating={animatingHabits.has(habit.id)}
                          hideAfterComplete={true}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Good Habits Tab */}
          <TabsContent value="good" className="space-y-4 mt-4 pb-32">
            <div className="flex justify-center px-4">
              <Card className="p-2.5 bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50 w-fit max-w-[90vw] sm:max-w-md">
                <p className="text-[11px] sm:text-xs text-emerald-800 dark:text-emerald-400 text-center sm:text-left leading-relaxed">
                  <GoodHabitIcon className="h-3.5 w-3.5 inline mr-1 -translate-y-[1px]" />
                  {t('emptyState.goodBanner')}
                </p>
              </Card>
            </div>

            {goodHabitsAll.length === 0 ? (
              <Card className="p-8 text-center flex flex-col items-center border-dashed">
                <p className="text-muted-foreground text-sm">{t('emptyState.noGoodHabits')}</p>
                <div className="mt-4 flex items-center gap-3 text-left max-w-xs p-3 rounded-xl bg-muted/40 border border-border/40">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <GoodHabitIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{t('emptyState.clickPlusHint')}</p>
                    <p className="text-[10px] text-muted-foreground">{t('emptyState.toCreateGood')}</p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-2">
                {goodHabitsAll.map(habit => (
                  <MemoizedHabitCard
                    key={habit.id}
                    habit={habit}
                    isCompleted={getHabitLog(habit.id, selectedDate)}
                    stats={getHabitStats(habit.id)}
                    recentLogs={getRecentHabitLogs(habit.id)}
                    onToggle={() => handleToggleHabit(habit.id, habit.name, habit.type)}
                    onUpdate={(updates) => updateHabit(habit.id, updates)}
                    onDelete={() => handleDeleteHabit(habit.id, habit.name)}
                    selectedDate={selectedDate}
                    isAnimating={animatingHabits.has(habit.id)}
                  />
                ))}
              </div>
            )}
            
            {/* Add Good Habit Button removed - use Bottom Nav instead */}
          </TabsContent>

          {/* Bad Habits Tab */}
          <TabsContent value="bad" className="space-y-4 mt-4 pb-32">
            <div className="flex justify-center px-4">
              <Card className="p-2.5 bg-rose-50/50 border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50 w-fit max-w-[90vw] sm:max-w-md">
                <p className="text-[11px] sm:text-xs text-rose-800 dark:text-rose-400 text-center sm:text-left leading-relaxed">
                  <BadHabitIcon className="h-3.5 w-3.5 inline mr-1 -translate-y-[1px]" />
                  {t('emptyState.badBanner')}
                </p>
              </Card>
            </div>

            {badHabitsAll.length === 0 ? (
              <Card className="p-8 text-center flex flex-col items-center border-dashed">
                <p className="text-muted-foreground text-sm">{t('emptyState.noBadHabits')}</p>
                <div className="mt-4 flex items-center gap-3 text-left max-w-xs p-3 rounded-xl bg-muted/40 border border-border/40">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <BadHabitIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{t('emptyState.clickPlusHint')}</p>
                    <p className="text-[10px] text-muted-foreground">{t('emptyState.toCreateBad')}</p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-2">
                {badHabitsAll.map(habit => (
                  <MemoizedHabitCard
                    key={habit.id}
                    habit={habit}
                    isCompleted={getHabitLog(habit.id, selectedDate)}
                    stats={getHabitStats(habit.id)}
                    recentLogs={getRecentHabitLogs(habit.id)}
                    onToggle={() => handleToggleHabit(habit.id, habit.name, habit.type)}
                    onUpdate={(updates) => updateHabit(habit.id, updates)}
                    onDelete={() => handleDeleteHabit(habit.id, habit.name)}
                    selectedDate={selectedDate}
                    isAnimating={animatingHabits.has(habit.id)}
                  />
                ))}
              </div>
            )}
            
            {/* Add Bad Habit Button removed - use Bottom Nav instead */}
          </TabsContent>
          </Tabs>
        )}

        {/* Stats Content - standalone without tabs wrapper */}
        {activeTab === 'stats' && (
          <div className="space-y-6 pb-32">
            <Suspense fallback={<StatsSkeleton />}>
              <StatsOverview habits={activeHabits} getHabitStats={getHabitStats} logs={logs} />
            </Suspense>

            <Card className="p-5 relative">
              <h2 className="text-sm font-medium mb-4">{t('stats.activityChart')}</h2>
              <Suspense fallback={<ShimmerSkeleton height="150px" borderRadius="6px" />}>
                <GitHubCalendar 
                  key={calendarKey} 
                  data={contributionData}
                  onDayClick={(date) => setDayDetailPopup({ isOpen: true, date })}
                />
              </Suspense>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="text-sm font-medium mb-3">{t('stats.performanceSummary')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('stats.totalHabits')}</span>
                    <span className="font-semibold">{activeHabits.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('stats.goodHabits')}</span>
                    <span className="font-semibold text-emerald-600">
                      {activeHabits.filter(h => h.type === 'good').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('stats.badHabits')}</span>
                    <span className="font-semibold text-rose-600">
                      {activeHabits.filter(h => h.type === 'bad').length}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

      </main>

      {/* Add Habit Dialog */}
      <Suspense fallback={null}>
        <AddHabitDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAdd={handleAddHabit}
          defaultType={addHabitType}
        />
      </Suspense>


      {/* Day Detail Popup */}
      <Suspense fallback={null}>
        <DayDetailPopup
          isOpen={dayDetailPopup.isOpen}
          onClose={() => setDayDetailPopup({ isOpen: false, date: null })}
          detail={dayDetailPopup.date ? {
            date: dayDetailPopup.date,
            goodHabits: activeHabits
              .filter(h => h.type === 'good')
              .map(h => ({
                id: h.id,
                name: h.name,
                completed: logs.some(l => l.habitId === h.id && l.date === dayDetailPopup.date && l.completed)
              })),
            badHabits: activeHabits
              .filter(h => h.type === 'bad')
              .map(h => ({
                id: h.id,
                name: h.name,
                completed: logs.some(l => l.habitId === h.id && l.date === dayDetailPopup.date && l.completed)
              }))
          } : null}
        />
      </Suspense>

      {/* Floating Bottom Navigation */}
      <FloatingBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        onAddClick={() => {
          // If we are on bad habits tab, default to bad habit, else good
          setAddHabitType(activeTab === 'bad' ? 'bad' : 'good');
          setIsAddDialogOpen(true);
        }}
      />

      {/* Delete All Habits Confirmation Dialog */}
      <Dialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl p-0 overflow-hidden border border-border/60 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_24px_rgba(0,0,0,0.4)]">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1 pt-0.5">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-lg font-semibold text-foreground">
                    Hapus Semua Kebiasaan?
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground leading-relaxed mt-1.5">
                    Tindakan ini tidak dapat dibatalkan. Seluruh data kebiasaan dan riwayatmu akan hilang permanen.
                  </DialogDescription>
                </DialogHeader>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 pb-6 pt-0">
            <button
              onClick={() => setIsDeleteAllDialogOpen(false)}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border/40 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={confirmDeleteAllHabits}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white transition-colors"
            >
              Ya, Hapus Semua
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default App;
