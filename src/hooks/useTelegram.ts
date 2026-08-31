import { useEffect, useState, useCallback } from 'react';
import type { TelegramWebApp, TelegramWebAppUser } from '@/types/telegram';

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramWebAppUser | null>(null);
  const [initData, setInitData] = useState<string>('');
  const [isTelegram, setIsTelegram] = useState<boolean>(false);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tg = window.Telegram?.WebApp;
    if (tg && tg.initData) {
      setWebApp(tg);
      setInitData(tg.initData);
      setUser(tg.initDataUnsafe?.user || null);
      setIsTelegram(true);
      setColorScheme(tg.colorScheme || 'light');

      // Inform Telegram that the Mini App is ready and expanded
      tg.ready();
      tg.expand();

      const handleThemeChange = () => {
        setColorScheme(tg.colorScheme || 'light');
      };

      const handleSafeAreaChange = () => {
        if (typeof document !== 'undefined') {
          const topInset = tg.safeAreaInset?.top || tg.contentSafeAreaInset?.top || 0;
          const bottomInset = tg.safeAreaInset?.bottom || tg.contentSafeAreaInset?.bottom || 0;
          document.documentElement.style.setProperty('--tg-safe-area-inset-top', `${topInset}px`);
          document.documentElement.style.setProperty('--tg-safe-area-inset-bottom', `${bottomInset}px`);
        }
      };

      handleSafeAreaChange();

      tg.onEvent('themeChanged', handleThemeChange);
      tg.onEvent('safeAreaChanged', handleSafeAreaChange);
      tg.onEvent('contentSafeAreaChanged', handleSafeAreaChange);
      tg.onEvent('fullscreenChanged', handleSafeAreaChange);

      return () => {
        tg.offEvent('themeChanged', handleThemeChange);
        tg.offEvent('safeAreaChanged', handleSafeAreaChange);
        tg.offEvent('contentSafeAreaChanged', handleSafeAreaChange);
        tg.offEvent('fullscreenChanged', handleSafeAreaChange);
      };
    }
  }, []);

  const triggerHapticImpact = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred(style);
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
  }, [webApp]);

  const triggerHapticNotification = useCallback((type: 'error' | 'success' | 'warning') => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.notificationOccurred(type);
    }
  }, [webApp]);

  const triggerHapticSelection = useCallback(() => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.selectionChanged();
    }
  }, [webApp]);

  return {
    webApp,
    user,
    initData,
    isTelegram,
    colorScheme,
    triggerHapticImpact,
    triggerHapticNotification,
    triggerHapticSelection,
  };
}
