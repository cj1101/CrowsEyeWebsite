'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline'
import { Eye } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/contexts/AuthContext'
import LanguageSelector from './LanguageSelector'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useI18n()
  const { user, loading } = useAuth()

  const navigation = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.demo'), href: '/demo' },
    { name: t('nav.features'), href: '/features' },
    { name: t('nav.pricing'), href: '/pricing' },
    { name: t('nav.download'), href: '/download' },
    { name: t('nav.contact'), href: '/contact' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-primary-600/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative">
                <Eye className="h-8 w-8 text-primary-500 crow-eye-animation" />
                <div className="absolute inset-0 h-8 w-8 rounded-full bg-primary-500/20 animate-ping"></div>
              </div>
              <span className="text-xl font-bold gradient-text">Crow&apos;s Eye</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSelector />
            <Link
              href="/demo"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              {t('nav.try_demo')}
            </Link>
            {!loading && (
              <>
                {user ? (
                  <Link
                    href="/account"
                    className="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <UserIcon className="h-5 w-5" />
                    )}
                    <span>Account</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/signin"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover-glow transition-all duration-200"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}
            <Link
              href="/download"
              className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover-glow transition-all duration-200"
            >
              {t('nav.download_free')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white inline-flex items-center justify-center p-2 rounded-md focus:outline-none"
            >
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/90 backdrop-blur-md">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-gray-700 pt-4">
              <div className="px-3 py-2">
                <LanguageSelector />
              </div>
              <Link
                href="/demo"
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                {t('nav.try_demo')}
              </Link>
              {!loading && (
                <>
                  {user ? (
                    <Link
                      href="/account"
                      className="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="Profile"
                          className="h-6 w-6 rounded-full"
                        />
                      ) : (
                        <UserIcon className="h-5 w-5" />
                      )}
                      <span>Account</span>
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/auth/signin"
                        className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/signup"
                        className="bg-gradient-to-r from-primary-600 to-primary-500 text-white block px-3 py-2 rounded-lg text-base font-medium mt-2 mx-3"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </>
              )}
              <Link
                href="/download"
                className="bg-gradient-to-r from-primary-600 to-primary-500 text-white block px-3 py-2 rounded-lg text-base font-medium mt-2 mx-3"
                onClick={() => setIsOpen(false)}
              >
                {t('nav.download_free')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navigation 