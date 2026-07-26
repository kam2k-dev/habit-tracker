"use client";

import { useEffect, useRef, useState } from "react";
import { format, subDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { useLanguage } from "@/context/language-context";

interface ContributionDay {
  date: string;
  goodCount: number;
  badCount: number;
}

interface GitHubCalendarProps {
  data: ContributionDay[];
  onDayClick?: (date: string) => void;
}

// Colors - GitHub-style contribution graph colors
// Light mode colors
const lightColors = {
  gray: "#ebedf0",
  // Good habits - Green (GitHub style)
  green1: "#9be9a8",
  green2: "#40c463",
  green3: "#30a14e",
  green4: "#216e39",
  // Bad habits - Red
  red1: "#ff7b72",
  red2: "#f85149",
  red3: "#da3633",
  red4: "#b42318",
};

// Dark mode colors (GitHub dark theme style)
const darkColors = {
  gray: "#161b22",
  // Good habits - Green (brighter for dark mode)
  green1: "#0e4429",
  green2: "#006d32",
  green3: "#238636",
  green4: "#39d353",
  // Bad habits - Red
  red1: "#3d1618",
  red2: "#6e2c2f",
  red3: "#b3383b",
  red4: "#ff6b6b",
};

// Helper to blend colors based on good vs bad ratio
const blendColors = (good: number, bad: number, isDark: boolean): string => {
  const total = good + bad;
  if (total === 0) return isDark ? darkColors.gray : lightColors.gray;

  // Calculate intensity (0-1) based on total activity
  const intensity = Math.min(total / 4, 1);

  // Good dominance (greenish)
  if (good > bad) {
    if (intensity <= 0.25) {
      return isDark ? darkColors.green1 : lightColors.green1;
    } else if (intensity <= 0.5) {
      return isDark ? darkColors.green2 : lightColors.green2;
    } else if (intensity <= 0.75) {
      return isDark ? darkColors.green3 : lightColors.green3;
    } else {
      return isDark ? darkColors.green4 : lightColors.green4;
    }
  }

  // Bad dominance (reddish)
  if (bad > good) {
    if (intensity <= 0.25) {
      return isDark ? darkColors.red1 : lightColors.red1;
    } else if (intensity <= 0.5) {
      return isDark ? darkColors.red2 : lightColors.red2;
    } else if (intensity <= 0.75) {
      return isDark ? darkColors.red3 : lightColors.red3;
    } else {
      return isDark ? darkColors.red4 : lightColors.red4;
    }
  }

  // Perfect balance (mix - use green as base with higher intensity)
  if (intensity <= 0.25) return isDark ? darkColors.green1 : lightColors.green1;
  if (intensity <= 0.5) return isDark ? darkColors.green2 : lightColors.green2;
  if (intensity <= 0.75) return isDark ? darkColors.green3 : lightColors.green3;
  return isDark ? darkColors.green4 : lightColors.green4;
};

const GitHubCalendar = ({ data, onDayClick }: GitHubCalendarProps) => {
  const { language, t } = useLanguage();
  const today = new Date();
  const startDate = subDays(today, 364);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  // Listen for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Drag to scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Build lookup from data
  const lookup = new Map<string, { good: number; bad: number }>();
  for (const item of data) {
    lookup.set(item.date, { good: item.goodCount, bad: item.badCount });
  }

  // Get color using smooth gradient system
  const getColor = (good: number, bad: number): string => {
    return blendColors(good, bad, isDark);
  };

  const monthNames = language === 'id'
    ? ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const dayNames = language === 'id'
    ? ['Sen','Sel','Rab','Kam','Jum','Sab','Min']
    : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  const goodText = t('stats.good');
  const badText = t('stats.bad');
  const emptyText = t('stats.empty');

  // Generate weeks - use 53 weeks to ensure today is covered (365 days can span 53 weeks)
  const weeks: React.ReactElement[] = [];
  let weekStart = startOfWeek(startDate, { weekStartsOn: 1 });

  for (let w = 0; w < 53; w++) {
    const days = eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(weekStart, { weekStartsOn: 1 }),
    });

    const dayCells = days.map((day, d) => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const val = lookup.get(dayStr) || { good: 0, bad: 0 };
      const bg = getColor(val.good, val.bad);
      const isFuture = day > today;

      return (
        <button
          key={d}
          onClick={() => onDayClick?.(dayStr)}
          disabled={isFuture}
          className={`w-3 h-3 rounded-[4px] transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
            isFuture ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:ring-2 hover:ring-primary/50'
          }`}
          style={{ backgroundColor: bg }}
          title={`${dayStr}: ${val.good > 0 ? `${val.good} ${goodText}` : ''}${val.good > 0 && val.bad > 0 ? ', ' : ''}${val.bad > 0 ? `${val.bad} ${badText}` : ''}${val.good === 0 && val.bad === 0 ? emptyText : ''}`}
        />
      );
    });

    weeks.push(<div key={w} className="flex flex-col gap-1">{dayCells}</div>);
    weekStart = addDays(weekStart, 7);
  }

  // Month labels
  const months: React.ReactElement[] = [];
  for (let m = 0; m < 12; m++) {
    const mDate = addDays(startDate, m * 30);
    months.push(
      <span key={m} className="text-[10px] text-muted-foreground" style={{ width: '8.33%', textAlign: 'center' }}>
        {monthNames[mDate.getMonth()]}
      </span>
    );
  }

  // Scroll to end on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  return (
    <div className="w-full">
      <div 
        ref={scrollRef} 
        className={`overflow-x-auto pb-2 scrollbar-hover ${isDragging ? 'dragging cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className="min-w-max">
          {/* Month labels */}
          <div className="flex mb-2">
            <div className="w-8 shrink-0" />
            <div className="flex w-full justify-between px-1" style={{ minWidth: '832px' }}>
              {months}
            </div>
          </div>

          <div className="flex">
            {/* Day labels - all 7 days, aligned with grid (12px + 4px gap = 16px per row) */}
            <div className="flex flex-col w-8 shrink-0 pr-2" style={{ height: '108px' }}>
              <div className="flex flex-col gap-1">
                {dayNames.map((dayLabel, idx) => (
                  <span key={idx} className="text-[10px] text-muted-foreground h-3 leading-[12px]">{dayLabel}</span>
                ))}
              </div>
            </div>
            
            {/* Calendar grid */}
            <div className="flex gap-1">
              {weeks}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export { GitHubCalendar };
export type { ContributionDay, GitHubCalendarProps };
