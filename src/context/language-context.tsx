import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, type Language, type Translations } from '@/locales/translations';
import { toast } from 'sonner';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string, params?: Record<string, string | number>) => string;
  currentTranslations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_language') as Language;
      if (saved === 'id' || saved === 'en') {
        return saved;
      }
      // Check browser navigator language
      if (navigator.language.startsWith('en')) {
        return 'en';
      }
    }
    return 'id';
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem('app_language', newLang);
    const toastMsg = translations[newLang].toast.languageChanged;
    toast.success(toastMsg, { duration: 3000 });
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const currentTranslations = translations[language];

  // Helper function to resolve nested keys like "hero.progressText"
  const t = (keyPath: string, params?: Record<string, string | number>): string => {
    const keys = keyPath.split('.');
    let obj: any = currentTranslations;
    
    for (const key of keys) {
      if (obj && typeof obj === 'object' && key in obj) {
        obj = obj[key];
      } else {
        // Fallback to Indonesian if key missing
        let fallbackObj: any = translations['id'];
        for (const fKey of keys) {
          if (fallbackObj && typeof fallbackObj === 'object' && fKey in fallbackObj) {
            fallbackObj = fallbackObj[fKey];
          } else {
            return keyPath; // Return key path if not found anywhere
          }
        }
        obj = fallbackObj;
        break;
      }
    }

    if (typeof obj !== 'string') {
      return keyPath;
    }

    let result = obj;
    if (params) {
      Object.entries(params).forEach(([pKey, pValue]) => {
        result = result.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pValue));
      });
    }

    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
