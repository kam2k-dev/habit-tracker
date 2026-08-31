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

      tg.onEvent('themeChanged', handleThemeChange);
      return () => {
        tg.offEvent('themeChanged', handleThemeChange);
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
