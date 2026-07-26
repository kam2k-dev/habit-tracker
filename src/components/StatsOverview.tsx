import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { StreakIcon } from '@/components/icons/StreakIcon';
import { CalendarCheckIcon } from '@/components/icons/CalendarCheckIcon';
import { TrendingIcon } from '@/components/icons/TrendingIcon';
import { TargetIcon } from '@/components/icons/TargetIcon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Flame } from 'lucide-react';
import { Odometer } from '@/components/ui/odometer';
import type { Habit, HabitStats, HabitLog } from '@/types/habit';
import { useLanguage } from '@/context/language-context';

interface StatsOverviewProps {
  habits: Habit[];
  getHabitStats: (habitId: string) => HabitStats;
  logs: HabitLog[];
}

export function StatsOverview({ habits, getHabitStats, logs }: StatsOverviewProps) {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStreakDialogOpen, setIsStreakDialogOpen] = useState(false);

  const stats = useMemo(() => {
    const goodHabits = habits.filter(h => h.type === 'good');
    const badHabits = habits.filter(h => h.type === 'bad');

    let totalGoodStreak = 0;
    let maxGoodStreak = 0;
    let totalGoodCompleted = 0;
    let goodCompletionRate = 0;

    let totalBadStreak = 0;
    let maxBadStreak = 0;
    let totalBadCompleted = 0;
    let badCompletionRate = 0;

    goodHabits.forEach(habit => {
      const habitStats = getHabitStats(habit.id);
      totalGoodStreak += habitStats.currentStreak;
      maxGoodStreak = Math.max(maxGoodStreak, habitStats.currentStreak);
      totalGoodCompleted += habitStats.totalCompleted;
      goodCompletionRate += habitStats.completionRate;
    });

    badHabits.forEach(habit => {
      const habitStats = getHabitStats(habit.id);
      totalBadStreak += habitStats.currentStreak;
      maxBadStreak = Math.max(maxBadStreak, habitStats.currentStreak);
      totalBadCompleted += habitStats.totalCompleted;
      badCompletionRate += habitStats.completionRate;
    });

    const avgGoodCompletionRate = goodHabits.length > 0
      ? Math.round(goodCompletionRate / goodHabits.length)
      : 0;

    const avgBadCompletionRate = badHabits.length > 0
      ? Math.round(badCompletionRate / badHabits.length)
      : 0;

    return {
      goodHabitsCount: goodHabits.length,
      badHabitsCount: badHabits.length,
      avgGoodStreak: goodHabits.length > 0 ? Math.round(totalGoodStreak / goodHabits.length) : 0,
      maxGoodStreak,
      totalGoodCompleted,
      avgGoodCompletionRate,
      avgBadStreak: badHabits.length > 0 ? Math.round(totalBadStreak / badHabits.length) : 0,
      totalBadCompleted,
      avgBadCompletionRate,
    };
  }, [habits, getHabitStats]);

  const habitDetails = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const fifteenDaysAgo = new Date(today);
    fifteenDaysAgo.setDate(today.getDate() - 15);

    const goodHabits = habits.filter(h => h.type === 'good');
    const badHabits = habits.filter(h => h.type === 'bad');

    const calculateTrend = (habitId: string) => {
      const habitLogs = logs.filter(l => l.habitId === habitId && new Date(l.date) >= thirtyDaysAgo);

      const firstHalfLogs = habitLogs.filter(l => new Date(l.date) < fifteenDaysAgo);
      const secondHalfLogs = habitLogs.filter(l => new Date(l.date) >= fifteenDaysAgo);

      const firstHalfRate = firstHalfLogs.length > 0
        ? firstHalfLogs.filter(l => l.completed).length / 15 * 100
        : 0;
      const secondHalfRate = secondHalfLogs.length > 0
        ? secondHalfLogs.filter(l => l.completed).length / 15 * 100
        : 0;

      return {
        firstHalfRate: Math.round(firstHalfRate),
        secondHalfRate: Math.round(secondHalfRate),
        diff: Math.round(secondHalfRate - firstHalfRate),
      };
    };

    const goodWithTrends = goodHabits.map(h => ({
      ...h,
      stats: getHabitStats(h.id),
      trend: calculateTrend(h.id),
    }));

    const badWithTrends = badHabits.map(h => ({
      ...h,
      stats: getHabitStats(h.id),
      trend: calculateTrend(h.id),
    }));

    return {
      goodRunning: goodWithTrends.filter(h => h.trend.secondHalfRate >= 50),
      goodStopped: goodWithTrends.filter(h => h.trend.secondHalfRate < 50),
      badAvoided: badWithTrends.filter(h => h.trend.secondHalfRate >= 50),
      badOccurred: badWithTrends.filter(h => h.trend.secondHalfRate < 50),
    };
  }, [habits, logs, getHabitStats]);

  const streakDetails = useMemo(() => {
    const goodHabits = habits.filter(h => h.type === 'good').map(h => ({
      ...h,
      stats: getHabitStats(h.id),
    })).sort((a, b) => b.stats.currentStreak - a.stats.currentStreak);

    const badHabits = habits.filter(h => h.type === 'bad').map(h => ({
      ...h,
      stats: getHabitStats(h.id),
    })).sort((a, b) => b.stats.currentStreak - a.stats.currentStreak);

    return {
      goodStreaks: goodHabits,
      badStreaks: badHabits,
    };
  }, [habits, getHabitStats]);

  const statCards = [
    {
      id: 'goodHabits',
      title: t('stats.goodHabits'),
      value: stats.goodHabitsCount,
      subtitle: t('stats.totalHabits'),
      icon: TargetIcon,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      id: 'activeStreak',
      title: t('stats.activeStreak'),
      value: stats.maxGoodStreak,
      subtitle: t('hero.days'),
      icon: StreakIcon,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    },
    {
      id: 'completionRate',
      title: t('stats.completionRate'),
      value: `${stats.avgGoodCompletionRate}%`,
      subtitle: t('stats.weeklyProgress'),
      icon: TrendingIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      id: 'totalCompleted',
      title: t('stats.bestStreak'),
      value: stats.totalGoodCompleted + stats.totalBadCompleted,
      subtitle: t('stats.totalHabits'),
      icon: CalendarCheckIcon,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, index) => (
          <Card
            key={index}
            className={`p-4 ${card.id === 'completionRate' || card.id === 'activeStreak' ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}
            onClick={card.id === 'completionRate' ? () => setIsDialogOpen(true) : card.id === 'activeStreak' ? () => setIsStreakDialogOpen(true) : undefined}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{card.title}</p>
                <div className="text-2xl font-semibold flex items-center">
                  {typeof card.value === 'number' ? (
                    <Odometer value={card.value} />
                  ) : (
                    card.value
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">{card.subtitle}</p>
              </div>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Completion Rate Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[420px] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl bg-card border border-border/50 shadow-lg">
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
            <DialogHeader className="mb-6">
              <DialogTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2.5 rounded-2xl bg-muted/20 dark:bg-muted/30">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400 relative z-10" />
                </div>
                <div>
                  <span className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">{t('stats.completionRate')}</span>
                  <p className="text-xs font-normal text-muted-foreground mt-0.5">{t('stats.last30DaysSummary')}</p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Bento Grid Layout */}
              <div className="grid grid-cols-2 gap-3">
                {/* Good Habits Summary Card */}
                <div className="p-4 rounded-xl border border-border/50 bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 rounded-lg bg-muted/20 dark:bg-muted/30 flex items-center justify-center">
                      <TargetIcon className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                    </div>
                    <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.avgGoodCompletionRate}%</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{t('stats.goodHabits')}</h4>
                    <Progress value={stats.avgGoodCompletionRate} className="h-1.5 mt-2 bg-emerald-200/50 dark:bg-emerald-900/50" />
                  </div>
                </div>

                {/* Bad Habits Summary Card */}
                <div className="p-4 rounded-xl border border-border/50 bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 rounded-lg bg-muted/20 dark:bg-muted/30 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                    </div>
                    <span className="text-2xl font-bold text-rose-700 dark:text-rose-300">{stats.avgBadCompletionRate}%</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-rose-800 dark:text-rose-200">{t('stats.badHabits')}</h4>
                    <Progress value={stats.avgBadCompletionRate} className="h-1.5 mt-2 bg-rose-200/50 dark:bg-rose-900/50" />
                  </div>
                </div>
              </div>

              {/* Detailed Lists */}
              <div className="space-y-4">
                {/* Good Habits Running Well */}
                {habitDetails.goodRunning.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">{t('stats.positiveTrend')}</p>
                    <div className="space-y-2">
                      {habitDetails.goodRunning.map(h => (
                        <div key={h.id} className="group p-3 rounded-xl border border-border/50 bg-muted/20 dark:bg-muted/30 hover:bg-muted/30 transition-all duration-300">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-medium text-foreground truncate">{h.name}</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100/50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">
                              {h.trend.secondHalfRate}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${h.trend.secondHalfRate}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-emerald-500/20 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Good Habits Stopped */}
                {habitDetails.goodStopped.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">{t('stats.needsAttention')}</p>
                    <div className="space-y-2">
                      {habitDetails.goodStopped.map(h => (
                        <div key={h.id} className="group p-3 rounded-xl border border-border/50 bg-muted/20 dark:bg-muted/30 hover:bg-muted/30 transition-all duration-300">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-medium text-foreground truncate">{h.name}</span>
                            <span className="text-amber-600 font-bold bg-amber-100/50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">
                              {h.trend.secondHalfRate}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${h.trend.secondHalfRate}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-amber-500/20 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Footer */}
              <div className="mt-6 p-4 rounded-xl bg-muted/20 dark:bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">{t('stats.overallAverage')}</span>
                  <span className="font-bold text-xl text-foreground">
                    {Math.round((stats.avgGoodCompletionRate + stats.avgBadCompletionRate) / 2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Streak Details Dialog */}
      <Dialog open={isStreakDialogOpen} onOpenChange={setIsStreakDialogOpen}>
        <DialogContent className="sm:max-w-[420px] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl bg-card border border-border/50 shadow-lg">
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
            <DialogHeader className="mb-6">
              <DialogTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2.5 rounded-2xl bg-muted/20 dark:bg-muted/30">
                  <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400 relative z-10" />
                </div>
                <div>
                  <span className="bg-gradient-to-br from-orange-500 to-red-500 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">{t('stats.streakDetails')}</span>
                  <p className="text-xs font-normal text-muted-foreground mt-0.5">{t('stats.streakRecordDesc')}</p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Streak Bento Header */}
              <div className="p-4 rounded-xl border border-border/50 bg-card flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800/70 dark:text-orange-200/70">{t('stats.highestStreak')}</p>
                  <div className="text-3xl font-black text-orange-600 dark:text-orange-400 mt-1 flex items-baseline gap-1">
                    {Math.max(stats.maxGoodStreak, streakDetails.badStreaks[0]?.stats.currentStreak || 0)} <span className="text-base font-medium text-orange-600/60 dark:text-orange-400/60">{t('hero.days')}</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-muted/20 dark:bg-muted/30 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
              </div>

              {/* Good Habits Streaks */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 px-1">
                  <TargetIcon className="h-4 w-4" />
                  {t('stats.goodHabits')}
                </div>
                {streakDetails.goodStreaks.length > 0 ? (
                  <div className="space-y-2">
                    {streakDetails.goodStreaks.map(h => (
                      <div key={h.id} className="group relative p-3 rounded-xl border border-border/50 bg-muted/20 dark:bg-muted/30 transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                          <Flame className="h-16 w-16" />
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground z-10">{h.name}</span>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-orange-400/10 to-red-400/10 text-orange-600 dark:text-orange-400 text-xs font-bold z-10 border border-orange-200/20 dark:border-orange-800/30">
                            <Flame className="h-3 w-3" />
                            {h.stats.currentStreak} {t('hero.days')}
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((h.stats.currentStreak / 30) * 100, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-emerald-500/20 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center rounded-xl border border-dashed border-border/50 bg-background/20">
                    <p className="text-xs text-muted-foreground">{t('stats.noActiveStreak')}</p>
                  </div>
                )}
              </div>

              {/* Bad Habits Streaks */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400 px-1">
                  <TrendingUp className="h-4 w-4" />
                  {t('stats.badHabits')}
                </div>
                {streakDetails.badStreaks.length > 0 ? (
                  <div className="space-y-2">
                    {streakDetails.badStreaks.map(h => (
                      <div key={h.id} className="group relative p-3 rounded-xl border border-border/50 bg-muted/20 dark:bg-muted/30 transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                          <Flame className="h-16 w-16" />
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground z-10">{h.name}</span>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-orange-400/10 to-red-400/10 text-orange-600 dark:text-orange-400 text-xs font-bold z-10 border border-orange-200/20 dark:border-orange-800/30">
                            <Flame className="h-3 w-3" />
                            {h.stats.currentStreak} {t('hero.days')}
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((h.stats.currentStreak / 30) * 100, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-rose-500/20 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center rounded-xl border border-dashed border-border/50 bg-background/20">
                    <p className="text-xs text-muted-foreground">{t('stats.noActiveStreak')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default StatsOverview;
