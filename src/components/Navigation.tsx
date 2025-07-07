'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

import { Bars3Icon, XMarkIcon, UserIcon, ChevronDownIcon, ArrowRightOnRectangleIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const { user, userProfile, logout, loading } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Download', href: '/download' },
    { name: 'Contact', href: '/contact' },
  ]

  // Developer and testing navigation items
  const devNavigation = [
    { name: 'API Testing', href: '/api-testing' },
    { name: 'Content Hub', href: '/content-hub' },
    { name: 'Analytics', href: '/analytics-dashboard' },
    { name: 'Test Functions', href: '/test-functions' },
  ]

  // Add Dashboard for all users (always visible)
  const userNavigation = [
    ...navigation,
    { name: 'Dashboard', href: '/dashboard' }
  ]

  // Helper to format plan label
  const getPlanLabel = (tier?: string) => {
    switch (tier) {
      case 'payg':
        return 'Pay-as-you-Go';
      case 'creator':
        return 'Creator';
      case 'growth':
        return 'Growth';
      case 'pro':
        return 'Pro';
      default:
        return 'Free';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      setIsUserDropdownOpen(false)
      // Optionally redirect to home page
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-vision-purple/30">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-12 sm:h-14 md:h-16">
          {/* Enhanced Logo with Brand Text */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="hover-float group">
              <div className="relative">
                <div className="absolute inset-0 bg-vision-gradient rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300 animate-pulse-slow blur-sm scale-110"></div>
                <div className="relative p-1 rounded-full glass-effect border border-vision-purple/30">
                  <img
                    src="/crows_eye_logo_transparent.png"
                    alt="Crow's Eye Logo"
                    width={40}
                    height={40}
                    className="relative z-10 group-hover:scale-110 transition-transform duration-300 filter drop-shadow-lg"
                  />
                </div>
              </div>
            </Link>
            <Link href="/" className="hidden sm:block">
              <div className="text-left">
                <h1 className="text-lg md:text-xl font-bold tech-heading gradient-text-animated">
                  CROW'S EYE
                </h1>
                <p className="text-purple-300 text-xs md:text-sm tech-subheading">
                  AI Marketing Suite
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-4 lg:ml-10 flex items-baseline space-x-2 lg:space-x-8">
              {userNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-vision-purple-light px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition-all duration-300 hover:bg-vision-purple/10 relative group"
                >
                  <span className="relative z-10">{item.name}</span>
                  <div className="absolute inset-0 bg-vision-gradient opacity-0 group-hover:opacity-10 rounded-md transition-opacity duration-300"></div>
                </Link>
              ))}
            </div>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-vision-purple/10"
                    >
                      {userProfile?.avatar_url ? (
                        <div className="relative">
                          <img
                            src={userProfile.avatar_url}
                            alt="Profile"
                            className="h-6 w-6 rounded-full border border-vision-purple/30"
                          />
                          <div className="absolute inset-0 rounded-full bg-vision-gradient opacity-20"></div>
                        </div>
                      ) : (
                        <div className="p-1 rounded-full bg-vision-gradient">
                          <UserIcon className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <span>{userProfile?.displayName || user.email?.split('@')[0] || 'Account'}</span>
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>

                    {/* Enhanced User Dropdown */}
                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 glass-card rounded-lg shadow-2xl border border-vision-purple/30">
                        <div className="py-1">
                          <Link
                            href="/account"
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-vision-purple/20 transition-all duration-200"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <UserIcon className="h-4 w-4 mr-2" />
                            Account Settings
                          </Link>
                          <Link
                            href="/account/subscription"
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-vision-purple/20 transition-all duration-200"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <CreditCardIcon className="h-4 w-4 mr-2" />
                            Subscription
                          </Link>
                          <hr className="my-1 border-vision-purple/30" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-vision-purple/20 transition-all duration-200"
                          >
                            <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link
                      href="/auth/signin"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-vision-purple/10"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="vision-button text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white inline-flex items-center justify-center p-1.5 sm:p-2 rounded-md focus:outline-none transition-colors duration-200"
            >
              {isOpen ? (
                <XMarkIcon className="block h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Bars3Icon className="block h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 glass-card">
            {userNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 hover:bg-vision-purple/20"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 pb-3 border-t border-vision-purple/30">
              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center px-3 pb-3">
                      {userProfile?.avatar_url ? (
                        <div className="relative">
                          <img
                            src={userProfile.avatar_url}
                            alt="Profile"
                            className="h-8 w-8 rounded-full border border-vision-purple/30"
                          />
                          <div className="absolute inset-0 rounded-full bg-vision-gradient opacity-20"></div>
                        </div>
                      ) : (
                        <div className="p-2 rounded-full bg-vision-gradient">
                          <UserIcon className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-white">
                          {userProfile?.displayName || user.email}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href="/auth/signin"
                        className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-vision-purple/20 transition-all duration-300"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/signup"
                        className="block w-full text-center vision-button text-white px-3 py-2 rounded-lg text-base font-medium"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </>
              )}
              <div className="mt-3 space-y-1">
                {user && (
                  <>
                    <Link
                      href="/account"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-vision-purple/20 transition-all duration-300"
                      onClick={() => setIsOpen(false)}
                    >
                      Account Settings
                    </Link>
                    <Link
                      href="/account/subscription"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-vision-purple/20 transition-all duration-300"
                      onClick={() => setIsOpen(false)}
                    >
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {getPlanLabel(userProfile?.subscription_tier)} Plan
                      </Badge>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsOpen(false)
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-vision-purple/20 transition-all duration-300"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navigation 