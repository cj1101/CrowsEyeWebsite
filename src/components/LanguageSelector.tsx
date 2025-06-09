'use client'

import React, { useState } from 'react'
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { useI18n, AVAILABLE_LANGUAGES, LanguageCode } from '@/lib/i18n'

export default function LanguageSelector() {
  const { language, setLanguage, t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLanguage(newLang)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200 rounded-md hover:bg-gray-800"
        aria-label={t('language.selector') || 'Language Selector'}
      >
        <GlobeAltIcon className="h-5 w-5" />
        <span className="hidden sm:inline">
          {AVAILABLE_LANGUAGES[language].flag} {AVAILABLE_LANGUAGES[language].name}
        </span>
        <span className="sm:hidden">
          {AVAILABLE_LANGUAGES[language].flag}
        </span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-20 max-h-80 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs text-gray-400 px-3 py-2 border-b border-gray-700 mb-2">
                {t('language.selector') || 'Select Language'}
              </div>
              
              {Object.entries(AVAILABLE_LANGUAGES).map(([code, info]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code as LanguageCode)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors duration-200 ${
                    language === code
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{info.flag}</span>
                  <span className="flex-1">{info.name}</span>
                  {language === code && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
} 