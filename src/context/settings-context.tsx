import React, { createContext, useContext, useState } from 'react';

export type SwipeDirection = 'left' | 'right';

interface SettingsContextType {
  swipeDirection: SwipeDirection;
  setSwipeDirection: (direction: SwipeDirection) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [swipeDirection, setSwipeDirectionState] = useState<SwipeDirection>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_swipe_direction') as SwipeDirection;
      if (saved === 'left' || saved === 'right') {
        return saved;
      }
    }
    return 'left'; // Default to left as requested
  });

  const setSwipeDirection = (direction: SwipeDirection) => {
    setSwipeDirectionState(direction);
    localStorage.setItem('app_swipe_direction', direction);
  };

  return (
    <SettingsContext.Provider value={{ swipeDirection, setSwipeDirection }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
