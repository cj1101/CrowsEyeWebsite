'use client'

import React, { useState, useEffect, ReactNode } from 'react'
import { I18nContext, LanguageCode, translateWithParams, loadLanguagePreference, saveLanguagePreference } from '@/lib/i18n'

interface I18nProviderProps {
  children: ReactNode
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguage] = useState<LanguageCode>('en')
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load translations for a specific language
  const loadTranslations = async (lang: LanguageCode) => {
    try {
      const response = await fetch(`/translations/${lang}.json`)
      if (response.ok) {
        const data = await response.json()
        setTranslations(data)
      } else {
        console.warn(`Failed to load translations for ${lang}, falling back to English`)
        if (lang !== 'en') {
          const fallbackResponse = await fetch('/translations/en.json')
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            setTranslations(fallbackData)
          }
        }
      }
    } catch (error) {
      console.error(`Error loading translations for ${lang}:`, error)
      // Try to load English as fallback
      if (lang !== 'en') {
        try {
          const fallbackResponse = await fetch('/translations/en.json')
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            setTranslations(fallbackData)
          }
        } catch (fallbackError) {
          console.error('Failed to load fallback translations:', fallbackError)
        }
      }
    }
  }

  // Translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = translations[key] || key
    return translateWithParams(translation, params)
  }

  // Change language function
  const changeLanguage = async (newLang: LanguageCode) => {
    if (newLang === language) return
    
    setIsLoading(true)
    await loadTranslations(newLang)
    setLanguage(newLang)
    saveLanguagePreference(newLang)
    setIsLoading(false)
  }

  // Initialize on mount
  useEffect(() => {
    const initializeLanguage = async () => {
      const savedLang = loadLanguagePreference()
      await loadTranslations(savedLang)
      setLanguage(savedLang)
      setIsLoading(false)
    }

    initializeLanguage()
  }, [])

  const contextValue = {
    language,
    setLanguage: changeLanguage,
    t
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