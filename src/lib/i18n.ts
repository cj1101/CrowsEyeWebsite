import { createContext, useContext } from 'react'

// Available languages - matching the Python program
export const AVAILABLE_LANGUAGES = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  pt: { name: 'Português', flag: '🇵🇹' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  ja: { name: '日本語', flag: '🇯🇵' },
  zh: { name: '中文', flag: '🇨🇳' },
  hi: { name: 'हिन्दी', flag: '🇮🇳' },
  ar: { name: 'العربية', flag: '🇸🇦' }
} as const

export type LanguageCode = keyof typeof AVAILABLE_LANGUAGES

// Translation context
export interface I18nContextType {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => Promise<void>
  t: (key: string, params?: Record<string, string | number>) => string
  isLoading?: boolean
  autoTranslate?: (sourceText: string, targetLang: LanguageCode) => Promise<string>
}

export const I18nContext = createContext<I18nContextType | null>(null)

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Translation function with parameter substitution
export const translateWithParams = (text: string, params?: Record<string, string | number>): string => {
  if (!params) return text
  
  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`{${key}}`, 'g'), String(value))
  }, text)
}

// Browser language detection
export const detectBrowserLanguage = (): LanguageCode => {
  if (typeof window === 'undefined') return 'en'
  
  const browserLang = navigator.language.split('-')[0] as LanguageCode
  return Object.keys(AVAILABLE_LANGUAGES).includes(browserLang) ? browserLang : 'en'
}

// Local storage helpers
export const saveLanguagePreference = (lang: LanguageCode) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('crowseye-language', lang)
  }
}

export const loadLanguagePreference = (): LanguageCode => {
  if (typeof window === 'undefined') return 'en'
  
  const saved = localStorage.getItem('crowseye-language') as LanguageCode
  return saved && Object.keys(AVAILABLE_LANGUAGES).includes(saved) ? saved : detectBrowserLanguage()
} 