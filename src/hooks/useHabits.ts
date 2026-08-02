import { useState, useEffect, useCallback, useRef } from 'react';
import type { Habit, HabitType, HabitLog, HabitStats, DayActivityDetail } from '@/types/habit';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  type QuerySnapshot,
  type DocumentData,
  type FirestoreError,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

const LOCAL_CACHE_VERSION = 'v1';
const getCacheKey = (userId: string) => `habit-tracker:${LOCAL_CACHE_VERSION}:${userId}`;

// Dummy data for dev mode
const DEV_HABITS: Habit[] = [
  { id: 'dev-1', name: 'Minum Air 2L', type: 'good', createdAt: new Date().toISOString(), archived: false },
  { id: 'dev-2', name: 'Olahraga 30 Menit', type: 'good', createdAt: new Date().toISOString(), archived: false },
  { id: 'dev-3', name: 'Baca Buku 10 Halaman', type: 'good', createdAt: new Date().toISOString(), archived: false },
  { id: 'dev-4', name: 'Begadang', type: 'bad', createdAt: new Date().toISOString(), archived: false },
  { id: 'dev-5', name: 'Scroll Sosmed Berlebihan', type: 'bad', createdAt: new Date().toISOString(), archived: false },
];

const DEV_LOGS: HabitLog[] = [
  { habitId: 'dev-1', date: new Date().toISOString().split('T')[0], completed: true },
  { habitId: 'dev-2', date: new Date().toISOString().split('T')[0], completed: false },
  { habitId: 'dev-3', date: new Date().toISOString().split('T')[0], completed: true },
  { habitId: 'dev-4', date: new Date().toISOString().split('T')[0], completed: false },
  { habitId: 'dev-5', date: new Date().toISOString().split('T')[0], completed: true },
];

export function useHabits() {
  const { user, isPreviewMode, isDevMode } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Refs to avoid stale closures in snapshot callbacks
  const habitsRef = useRef<Habit[]>(habits);
  const logsRef = useRef<HabitLog[]>(logs);

  useEffect(() => {
    habitsRef.current = habits;
  }, [habits]);

  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);


  const persistCache = useCallback((nextHabits: Habit[], nextLogs: HabitLog[], userId?: string) => {
    if (!userId || typeof window === 'undefined') return;
    try {
      localStorage.setItem(getCacheKey(userId), JSON.stringify({ habits: nextHabits, logs: nextLogs }));
    } catch {
      // Ignore cache write failures
    }
  }, []);

  // Load from local cache first, then sync Firestore in background
  useEffect(() => {
    if (isDevMode) {
      setHabits(DEV_HABITS);
      setLogs(DEV_LOGS);
      setIsLoaded(true);
      return;
    }

    if (!user || isPreviewMode) {
      setHabits([]);
      setLogs([]);
      setIsLoaded(true);
      return;
    }

    // 1. Load from localStorage cache for instant display
    const userCacheKey = getCacheKey(user.uid);
    try {
      const cached = localStorage.getItem(userCacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as { habits?: Habit[]; logs?: HabitLog[] };
        if (Array.isArray(parsed.habits)) setHabits(parsed.habits);
        if (Array.isArray(parsed.logs)) setLogs(parsed.logs);
        setIsLoaded(true);
      } else {
        setIsLoaded(false);
      }
    } catch {
      setIsLoaded(false);
    }

    // 2. Setup real-time Firestore listeners (background sync)
    let habitsLoaded = false;
    let logsLoaded = false;
    const checkAllLoaded = () => {
      if (habitsLoaded && logsLoaded) {
        setIsLoaded(true);
      }
    };

    const habitsQuery = query(
      collection(db, 'habits'),
      where('userId', '==', user.uid)
    );

    const logsQuery = query(
      collection(db, 'logs'),
      where('userId', '==', user.uid)
    );

    const unsubscribeHabits = onSnapshot(habitsQuery, (snapshot: QuerySnapshot<DocumentData>) => {
      const habitsData = snapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
        id: d.id,
        ...d.data(),
      })) as Habit[];
      setHabits(habitsData);
      habitsLoaded = true;
      // Update cache with latest from server
      persistCache(habitsData, logsRef.current, user.uid);
      checkAllLoaded();
    }, (error: FirestoreError) => {
      console.error('Error loading habits:', error);
      habitsLoaded = true;
      checkAllLoaded();
    });

    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot: QuerySnapshot<DocumentData>) => {
      const logsData = snapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
        habitId: d.data().habitId as string,
        date: d.data().date as string,
        completed: d.data().completed as boolean,
      })) as HabitLog[];
      setLogs(logsData);
      logsLoaded = true;
      // Update cache with latest from server
      persistCache(habitsRef.current, logsData, user.uid);
      checkAllLoaded();
    }, (error: FirestoreError) => {
      console.error('Error loading logs:', error);
      logsLoaded = true;
      checkAllLoaded();
    });

    // Timeout fallback: show UI even if data not fully loaded
    const timeoutId = setTimeout(() => {
      setIsLoaded(true);
    }, 1200);

    return () => {
      clearTimeout(timeoutId);
      unsubscribeHabits();
      unsubscribeLogs();
    };
  }, [user, isPreviewMode, isDevMode, persistCache]);

  const addHabit = useCallback(async (name: string, type: HabitType) => {
    const id = crypto.randomUUID();
    const newHabit: Habit = {
      id,
      name: name.trim(),
      type,
      createdAt: new Date().toISOString(),
      archived: false,
    };
    
    if (isPreviewMode || isDevMode) {
      setHabits(prev => [...prev, newHabit]);
      return id;
    }

    if (!user) throw new Error('User not authenticated');
    
    await setDoc(doc(db, 'habits', id), {
      ...newHabit,
      userId: user.uid,
    });
    return id;
  }, [user, isPreviewMode, isDevMode]);

  const updateHabit = useCallback(async (id: string, updates: Partial<Habit>) => {
    if (isPreviewMode || isDevMode) {
      setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
      return;
    }

    if (!user) throw new Error('User not authenticated');
    
    const habitRef = doc(db, 'habits', id);
    await setDoc(habitRef, updates, { merge: true });
  }, [user, isPreviewMode, isDevMode]);

  const deleteHabit = useCallback(async (id: string) => {
    if (isPreviewMode || isDevMode) {
      setHabits(prev => prev.filter(h => h.id !== id));
      setLogs(prev => prev.filter(log => log.habitId !== id));
      return;
    }

    if (!user) throw new Error('User not authenticated');

    // Delete habit
    await deleteDoc(doc(db, 'habits', id));

    // Delete all logs for this habit
    const habitLogs = logs.filter(log => log.habitId === id);
    const batch = writeBatch(db);
    habitLogs.forEach(log => {
      const logId = `${log.habitId}_${log.date}`;
      batch.delete(doc(db, 'logs', logId));
    });
    await batch.commit();
  }, [user, logs, isPreviewMode, isDevMode]);

  const deleteAllHabits = useCallback(async () => {
    if (isPreviewMode || isDevMode) {
      setHabits([]);
      setLogs([]);
      return;
    }

    if (!user) throw new Error('User not authenticated');

    const batch = writeBatch(db);

    // Delete all habits
    habits.forEach(habit => {
      batch.delete(doc(db, 'habits', habit.id));
    });

    // Delete all logs
    logs.forEach(log => {
      const logId = `${log.habitId}_${log.date}`;
      batch.delete(doc(db, 'logs', logId));
    });

    await batch.commit();

    // Optimistic update
    setHabits([]);
    setLogs([]);
  }, [user, habits, logs, isPreviewMode, isDevMode]);

  const archiveHabit = useCallback(async (id: string) => {
    if (isPreviewMode || isDevMode) {
      setHabits(prev => prev.map(h => h.id === id ? { ...h, archived: true } : h));
      return;
    }

    if (!user) throw new Error('User not authenticated');
    
    const habitRef = doc(db, 'habits', id);
    await setDoc(habitRef, { archived: true }, { merge: true });
  }, [user, isPreviewMode, isDevMode]);

  const unarchiveHabit = useCallback(async (id: string) => {
    if (isPreviewMode || isDevMode) {
      setHabits(prev => prev.map(h => h.id === id ? { ...h, archived: false } : h));
      return;
    }

    if (!user) throw new Error('User not authenticated');
    
    const habitRef = doc(db, 'habits', id);
    await setDoc(habitRef, { archived: false }, { merge: true });
  }, [user, isPreviewMode, isDevMode]);

  const toggleHabitLog = useCallback(async (habitId: string, date: string): Promise<boolean> => {
    const existingLog = logs.find(log => log.habitId === habitId && log.date === date);
    const newCompleted = existingLog ? !existingLog.completed : true;

    // OPTIMISTIC UPDATE: Update local state immediately for responsive UI
    setLogs(prevLogs => {
      const existingIndex = prevLogs.findIndex(l => l.habitId === habitId && l.date === date);
      if (existingIndex >= 0) {
        // Update existing log
        return prevLogs.map((log, i) =>
          i === existingIndex ? { ...log, completed: newCompleted } : log
        );
      } else {
        // Add new log
        return [...prevLogs, { habitId, date, completed: newCompleted }];
      }
    });

    if (isPreviewMode || isDevMode) {
      return newCompleted;
    }

    if (!user) throw new Error('User not authenticated');

    const logId = `${habitId}_${date}`;
    await setDoc(doc(db, 'logs', logId), {
      habitId,
      date,
      completed: newCompleted,
      userId: user.uid,
    });

    return newCompleted;
  }, [user, logs, isPreviewMode, isDevMode]);

  const setHabitLog = useCallback(async (habitId: string, date: string, completed: boolean) => {
    if (isPreviewMode || isDevMode) {
      setLogs(prevLogs => {
        const existingIndex = prevLogs.findIndex(l => l.habitId === habitId && l.date === date);
        if (existingIndex >= 0) {
          return prevLogs.map((log, i) =>
            i === existingIndex ? { ...log, completed } : log
          );
        } else {
          return [...prevLogs, { habitId, date, completed }];
        }
      });
      return;
    }

    if (!user) throw new Error('User not authenticated');
    
    const logId = `${habitId}_${date}`;
    await setDoc(doc(db, 'logs', logId), {
      habitId,
      date,
      completed,
      userId: user.uid,
    });
  }, [user, isPreviewMode, isDevMode]);

  const getHabitLog = useCallback((habitId: string, date: string): boolean => {
    const log = logs.find(l => l.habitId === habitId && l.date === date);
    return log?.completed || false;
  }, [logs]);

  const getRecentHabitLogs = useCallback((habitId: string, days: number = 7): { date: string; completed: boolean }[] => {
    const recent = [];
    const today = new Date();
    
    // Create an array of the last N days (from oldest to newest)
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const log = logs.find(l => l.habitId === habitId && l.date === dateStr);
      recent.push({ date: dateStr, completed: log?.completed || false });
    }
    return recent;
  }, [logs]);

  const getHabitStats = useCallback((habitId: string): HabitStats => {
    const habitLogs = logs.filter(log => log.habitId === habitId && log.completed);
    const habit = habits.find(h => h.id === habitId);
    
    if (!habit || habitLogs.length === 0) {
      return {
        habitId,
        currentStreak: 0,
        longestStreak: 0,
        totalCompleted: 0,
        completionRate: 0,
      };
    }

    // Sort logs by date
    const sortedDates = habitLogs
      .map(log => log.date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if completed today or yesterday
    const lastCompletedDate = sortedDates[0];
    const lastDate = new Date(lastCompletedDate);
    lastDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      currentStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        prevDate.setHours(0, 0, 0, 0);
        currDate.setHours(0, 0, 0, 0);
        
        const dayDiff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    const allDates = [...new Set(sortedDates)].sort();
    
    for (let i = 1; i < allDates.length; i++) {
      const prevDate = new Date(allDates[i - 1]);
      const currDate = new Date(allDates[i]);
      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);
      
      const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate completion rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const daysSinceCreation = Math.max(1, Math.floor((today.getTime() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
    const relevantDays = Math.min(30, daysSinceCreation);
    
    const completedInPeriod = habitLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= thirtyDaysAgo;
    }).length;
    
    const completionRate = relevantDays > 0 ? Math.round((completedInPeriod / relevantDays) * 100) : 0;

    return {
      habitId,
      currentStreak,
      longestStreak,
      totalCompleted: habitLogs.length,
      completionRate,
    };
  }, [logs, habits]);

  const getAllLogsForDate = useCallback((date: string): Map<string, boolean> => {
    const result = new Map<string, boolean>();
    logs
      .filter(log => log.date === date)
      .forEach(log => result.set(log.habitId, log.completed));
    return result;
  }, [logs]);

  const getDayDetail = useCallback((date: string): DayActivityDetail => {
    const dayLogs = logs.filter(log => log.date === date && log.completed);
    const goodHabitsList = habits.filter(h => h.type === 'good' && !h.archived);
    const badHabitsList = habits.filter(h => h.type === 'bad' && !h.archived);
    
    const goodCompleted = dayLogs.filter(log => {
      const habit = habits.find(h => h.id === log.habitId);
      return habit?.type === 'good';
    }).length;
    
    const badCompleted = dayLogs.filter(log => {
      const habit = habits.find(h => h.id === log.habitId);
      return habit?.type === 'bad';
    }).length;
    
    return {
      goodCompleted,
      goodTotal: goodHabitsList.length,
      badCompleted,
      badTotal: badHabitsList.length,
      netScore: goodCompleted - badCompleted,
    };
  }, [logs, habits]);

  const getActivityLevel = useCallback((date: string): number => {
    const dayLogs = logs.filter(log => log.date === date && log.completed);
    const goodHabits = habits.filter(h => h.type === 'good' && !h.archived).length;
    const badHabits = habits.filter(h => h.type === 'bad' && !h.archived).length;
    
    if (goodHabits + badHabits === 0) return 0;
    
    const goodCompleted = dayLogs.filter(log => {
      const habit = habits.find(h => h.id === log.habitId);
      return habit?.type === 'good';
    }).length;
    
    const badCompleted = dayLogs.filter(log => {
      const habit = habits.find(h => h.id === log.habitId);
      return habit?.type === 'bad';
    }).length;
    
    // Calculate net score: good habits add, bad habits subtract
    const netScore = goodCompleted - badCompleted;
    const maxScore = goodHabits + badHabits;
    
    // Normalize to 0-4 scale
    if (netScore <= 0) return 0;
    const ratio = netScore / maxScore;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  }, [logs, habits]);

  const activeHabits = habits.filter(h => !h.archived);
  const archivedHabits = habits.filter(h => h.archived);

  return {
    habits,
    activeHabits,
    archivedHabits,
    logs,
    isLoaded,
    addHabit,
    updateHabit,
    deleteHabit,
    deleteAllHabits,
    archiveHabit,
    unarchiveHabit,
    toggleHabitLog,
    setHabitLog,
    getHabitLog,
    getRecentHabitLogs,
    getHabitStats,
    getAllLogsForDate,
    getActivityLevel,
    getDayDetail,
  };
}
