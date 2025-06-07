'use client'

import React, { useState, useEffect, ReactNode, useCallback } from 'react'
import { I18nContext, LanguageCode, translateWithParams, loadLanguagePreference, saveLanguagePreference } from '@/lib/i18n'

interface I18nProviderProps {
  children: ReactNode
}

// Cache for loaded translations
const translationCache = new Map<LanguageCode, Record<string, string>>()

// Fallback translations to prevent errors
const fallbackTranslations: Record<string, string> = {
  'hero.title': "Crow's Eye",
  'hero.subtitle': 'AI-Powered Marketing Automation',
  'hero.description': 'Effortlessly organize, create, and publish stunning visual content for Instagram and Facebook.',
  'hero.try_demo': 'Try Demo',
  'hero.download_app': 'Download App',
  'hero.view_pricing': 'View Pricing',
  'features.ai_content.title': 'AI Content Creation',
  'features.ai_content.description': 'Generate compelling content with advanced AI',
  'features.multi_platform.title': 'Multi-Platform Publishing',
  'features.multi_platform.description': 'Publish to all major social media platforms',
  'features.media_editing.title': 'Advanced Media Editing',
  'features.media_editing.description': 'Professional editing tools at your fingertips',
  'features.productivity.title': 'Boost Productivity',
  'features.productivity.description': 'Streamline your content creation workflow'
}

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
  const [translations, setTranslations] = useState<Record<string, string>>(fallbackTranslations)
  const [isLoading, setIsLoading] = useState(false)

  // Load translations for a specific language
  const loadTranslations = useCallback(async (lang: LanguageCode): Promise<Record<string, string>> => {
    // Check cache first
    if (translationCache.has(lang)) {
      return translationCache.get(lang)!
    }

    // For static exports, we need to handle this differently
    try {
      // Only attempt to fetch if we're in a browser environment
      if (typeof window === 'undefined') {
        console.warn('Translation loading attempted on server side')
        return fallbackTranslations
      }

      // Check if we're running in a static export environment
      const isStaticExport = window.location.protocol === 'file:' || 
                           (window.location.hostname === 'localhost' && window.location.pathname.includes('.html'))

      if (isStaticExport) {
        console.info(`Running in static export mode, using fallback translations for ${lang}`)
        translationCache.set(lang, fallbackTranslations)
        return fallbackTranslations
      }

      const response = await fetch(`/translations/${lang}.json`)
      if (response.ok) {
        const translations = await response.json()
        translationCache.set(lang, translations)
        return translations
      } else {
        console.warn(`Failed to fetch translations for ${lang}: ${response.status}`)
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.warn(`Failed to load translations for ${lang}:`, error)
      // Use fallback translations to prevent errors
      translationCache.set(lang, fallbackTranslations)
      return fallbackTranslations
    }
  }, [])

  // Change language and load new translations
  const setLanguage = useCallback(async (newLang: LanguageCode) => {
    setIsLoading(true)
    
    try {
      const newTranslations = await loadTranslations(newLang)
      setTranslations(newTranslations)
      setLanguageState(newLang)
      
      // Safely save language preference
      try {
        saveLanguagePreference(newLang)
      } catch (err) {
        console.warn('Could not save language preference:', err)
      }
    } catch (error) {
      console.error('Error changing language:', error)
      // Don't leave the user in a broken state
      setTranslations(fallbackTranslations)
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
      }
    }
    
    // Try fallback translations
    if (!translation && fallbackTranslations[key]) {
      translation = fallbackTranslations[key]
    }
    
    // Final fallback to the key itself if no translation found
    if (!translation) {
      translation = key
      // Only log warning in development to avoid console spam
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation for key: ${key} (language: ${language})`)
      }
    }
    
    try {
      return translateWithParams(translation, params)
    } catch (error) {
      console.warn('Error in translation parameter substitution:', error)
      return translation
    }
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
        let savedLang: LanguageCode = 'en'
        
        // Safely load language preference
        try {
          savedLang = loadLanguagePreference()
        } catch (err) {
          console.warn('Could not load language preference:', err)
        }
        
        const initialTranslations = await loadTranslations(savedLang)
        
        setLanguageState(savedLang)
        setTranslations(initialTranslations)
      } catch (error) {
        console.error('Error initializing language:', error)
        // Fallback to English with fallback translations
        setLanguageState('en')
        setTranslations(fallbackTranslations)
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

  // Don't show loading screen to prevent flash
  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  )
} 