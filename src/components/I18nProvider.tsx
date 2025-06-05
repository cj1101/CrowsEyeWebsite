'use client'

import React, { useState, useEffect, ReactNode, useCallback } from 'react'
import { I18nContext, LanguageCode, translateWithParams, loadLanguagePreference, saveLanguagePreference } from '@/lib/i18n'

interface I18nProviderProps {
  children: ReactNode
}

// Cache for loaded translations
const translationCache = new Map<LanguageCode, Record<string, string>>()

// Google Translate integration for real-time translation
class RealTimeTranslator {
  private cache = new Map<string, string>()
  
  async translateText(text: string, targetLang: LanguageCode): Promise<string> {
    const cacheKey = `${text}-${targetLang}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }
    
    // For now, return the original text if no translation service is available
    // In a production environment, you'd integrate with Google Translate API here
    this.cache.set(cacheKey, text)
    return text
  }
}

const realTimeTranslator = new RealTimeTranslator()

export default function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<LanguageCode>('en')
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load translations for a specific language
  const loadTranslations = useCallback(async (lang: LanguageCode): Promise<Record<string, string>> => {
    // Check cache first
    if (translationCache.has(lang)) {
      return translationCache.get(lang)!
    }

    try {
      const response = await fetch(`/translations/${lang}.json`)
      if (response.ok) {
        const translations = await response.json()
        translationCache.set(lang, translations)
        return translations
      }
    } catch (error) {
      console.warn(`Failed to load translations for ${lang}:`, error)
    }

    // Fallback to empty object
    const fallback = {}
    translationCache.set(lang, fallback)
    return fallback
  }, [])

  // Change language and load new translations
  const setLanguage = useCallback(async (newLang: LanguageCode) => {
    setIsLoading(true)
    
    try {
      const newTranslations = await loadTranslations(newLang)
      setTranslations(newTranslations)
      setLanguageState(newLang)
      saveLanguagePreference(newLang)
    } catch (error) {
      console.error('Error changing language:', error)
    } finally {
      setIsLoading(false)
    }
  }, [loadTranslations])

  // Translation function with fallback support
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let translation = translations[key]
    
    // If translation doesn't exist, try to get it from English fallback
    if (!translation && language !== 'en') {
      const englishTranslations = translationCache.get('en')
      if (englishTranslations && englishTranslations[key]) {
        translation = englishTranslations[key]
        
        // In a real implementation, you could trigger automatic translation here
        // For now, we'll just use the English text as fallback
      }
    }
    
    // Final fallback to the key itself if no translation found
    if (!translation) {
      translation = key
      console.warn(`Missing translation for key: ${key} (language: ${language})`)
    }
    
    return translateWithParams(translation, params)
  }, [translations, language])

  // Auto-translate missing content
  const autoTranslate = useCallback(async (sourceText: string, targetLang: LanguageCode): Promise<string> => {
    if (targetLang === 'en') return sourceText
    
    try {
      return await realTimeTranslator.translateText(sourceText, targetLang)
    } catch (error) {
      console.warn('Auto-translation failed:', error)
      return sourceText
    }
  }, [])

  // Initialize language and translations on mount
  useEffect(() => {
    const initializeLanguage = async () => {
      setIsLoading(true)
      
      try {
        const savedLang = loadLanguagePreference()
        const initialTranslations = await loadTranslations(savedLang)
        
        setLanguageState(savedLang)
        setTranslations(initialTranslations)
      } catch (error) {
        console.error('Error initializing language:', error)
        // Fallback to English
        setLanguageState('en')
        setTranslations({})
      } finally {
        setIsLoading(false)
      }
    }

    initializeLanguage()
  }, [loadTranslations])

  const contextValue = {
    language,
    setLanguage,
    t,
    isLoading,
    autoTranslate
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crowseye-dark via-crowseye-dark-light to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  )
} 