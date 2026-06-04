import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const { displayDate, isToday } = useMemo(() => {
    const date = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    const isToday = date.getTime() === today.getTime();
    
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    
    return {
      displayDate: date.toLocaleDateString('id-ID', options),
      isToday,
    };
  }, [selectedDate]);

  const goToPreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPreviousDay}
          className="h-9 w-9"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg min-w-[200px] justify-center">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{displayDate}</span>
          {isToday && (
            <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
              Hari Ini
            </span>
          )}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={goToNextDay}
          className="h-9 w-9"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {!isToday && (
        <Button
          variant="ghost"
          size="sm"
          onClick={goToToday}
          className="text-sm"
        >
          Ke Hari Ini
        </Button>
      )}
    </div>
  );
}
