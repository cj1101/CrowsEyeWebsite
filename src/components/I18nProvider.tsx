'use client';

import { createContext, useContext, ReactNode } from 'react';

interface I18nContextType {
  locale: string;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  t: (key: string) => key,
});

export const useI18n = () => useContext(I18nContext);

interface I18nProviderProps {
  children: ReactNode;
  locale?: string;
}

export default function I18nProvider({ children, locale = 'en' }: I18nProviderProps) {
  const t = (key: string) => {
    // Simple implementation - just return the key for now
    // This can be extended with actual translations later
    return key;
  };

  return (
    <I18nContext.Provider value={{ locale, t }}>
      {children}
    </I18nContext.Provider>
  );
} 