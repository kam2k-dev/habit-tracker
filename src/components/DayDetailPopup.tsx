import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { XCircle, CheckCircle2 } from 'lucide-react';
import { GoodHabitIcon } from '@/components/icons/GoodHabitIcon';
import { BadHabitIcon } from '@/components/icons/BadHabitIcon';
import { format, parseISO } from 'date-fns';
import { id, enUS } from 'date-fns/locale';
import { useLanguage } from '@/context/language-context';

interface DayDetail {
  date: string;
  goodHabits: { id: string; name: string; completed: boolean }[];
  badHabits: { id: string; name: string; completed: boolean }[];
}

interface DayDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  detail: DayDetail | null;
}

export function DayDetailPopup({ isOpen, onClose, detail }: DayDetailPopupProps) {
  const { t, language } = useLanguage();
  if (!detail) return null;

  const goodCompleted = detail.goodHabits.filter(h => h.completed).length;
  const badCompleted = detail.badHabits.filter(h => h.completed).length;
  const netScore = goodCompleted - badCompleted;
  const dateLocale = language === 'id' ? id : enUS;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {format(parseISO(detail.date), 'EEEE, d MMMM yyyy', { locale: dateLocale })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Score Summary */}
          <div className={`text-center p-4 rounded-lg ${
            netScore > 0 ? 'bg-emerald-50 border border-emerald-100' : 
            netScore < 0 ? 'bg-rose-50 border border-rose-100' : 
            'bg-muted'
          }`}>
            <p className="text-sm text-muted-foreground mb-1">{t('dayDetail.title')}</p>
            <p className={`text-3xl font-bold ${
              netScore > 0 ? 'text-emerald-600' : 
              netScore < 0 ? 'text-rose-600' : 
              'text-muted-foreground'
            }`}>
              {netScore > 0 ? '+' : ''}{netScore}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {goodCompleted} {t('tabs.good')} - {badCompleted} {t('tabs.bad')}
            </p>
          </div>

          {/* Good Habits */}
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
              <GoodHabitIcon className="h-4 w-4 text-emerald-500" />
              {t('stats.goodHabits')}
              <span className="text-xs text-muted-foreground">
                ({goodCompleted}/{detail.goodHabits.length})
              </span>
            </h4>
            {detail.goodHabits.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">{t('emptyState.noGoodHabits')}</p>
            ) : (
              <div className="space-y-2">
                {detail.goodHabits.map(habit => (
                  <div
                    key={habit.id}
                    className={`flex items-center justify-between p-2 rounded-md text-sm ${
                      habit.completed ? 'bg-emerald-50' : 'bg-muted/50'
                    }`}
                  >
                    <span className={habit.completed ? 'text-emerald-700' : 'text-muted-foreground'}>
                      {habit.name}
                    </span>
                    {habit.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bad Habits */}
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
              <BadHabitIcon className="h-4 w-4 text-rose-500" />
              {t('stats.badHabits')}
              <span className="text-xs text-muted-foreground">
                ({badCompleted}/{detail.badHabits.length})
              </span>
            </h4>
            {detail.badHabits.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">{t('emptyState.noBadHabits')}</p>
            ) : (
              <div className="space-y-2">
                {detail.badHabits.map(habit => (
                  <div
                    key={habit.id}
                    className={`flex items-center justify-between p-2 rounded-md text-sm ${
                      habit.completed ? 'bg-rose-50' : 'bg-muted/50'
                    }`}
                  >
                    <span className={habit.completed ? 'text-rose-700' : 'text-muted-foreground'}>
                      {habit.name}
                    </span>
                    {habit.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-rose-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DayDetailPopup;
