'use client'

import React from 'react'
import Link from 'next/link'
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  TrashIcon, 
  ArrowDownTrayIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'

export default function Privacy() {
  const complianceFeatures = [
    {
      icon: TrashIcon,
      title: "Data Deletion Requests",
      description: "We provide robust mechanisms for users to request the deletion of their data. Our application includes a Data Deletion Request Callback to process requests initiated by Meta when users remove the app or request data deletion. Users can also perform a complete Factory Reset of all their data from within the application's compliance settings."
    },
    {
      icon: ArrowDownTrayIcon,
      title: "User Data Export",
      description: "You have the right to export your data. Crow's Eye provides a GDPR/CCPA compliant data export feature, allowing you to download your information in a comprehensive JSON format. This includes media metadata, file information, presets, settings, and knowledge base content."
    },
    {
      icon: LockClosedIcon,
      title: "Data Security",
      description: "We implement industry-standard security measures to protect data accessed via Meta APIs and all user-generated content within Crow's Eye. This includes secure storage of access tokens and encrypted data transmission."
    },
    {
      icon: DocumentTextIcon,
      title: "Transparent Permissions Usage",
      description: "Crow's Eye requests permissions transparently and only for features essential to its functionality. These include instagram_basic, instagram_content_publish, instagram_manage_comments, instagram_manage_insights, pages_read_engagement, and instagram_business_manage_messages."
    }
  ]

  const dataRights = [
    "Right to Access: Export your data at any time through the app",
    "Right to Erasure (Deletion): Delete your data using the Factory Reset feature or by requesting deletion via Meta's channels",
    "Right to Portability: Receive your data in a common, machine-readable JSON format",
    "Right to Correction: Update and correct your personal information",
    "Right to Restriction: Limit how your data is processed",
    "Right to Object: Withdraw consent for data processing"
  ]

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Your Privacy & Data Compliance at Crow's Eye
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            At Crow's Eye, we are deeply committed to protecting your privacy and ensuring our 
            practices align with all relevant regulations, including the Meta Developer Platform policies.
          </p>
        </div>

        {/* Our Commitment */}
        <div className="mb-16">
          <div className="feature-card rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Our Commitment to Your Privacy</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Your trust is paramount. Our comprehensive Privacy Policy details how we collect, use, store, 
              and protect your personal information. It also outlines your rights concerning your data and 
              our responsibilities as a service provider.
            </p>
            <Link
              href="/privacy-policy-details"
              className="inline-flex items-center text-primary-400 hover:text-primary-300 font-medium"
            >
              View Our Full Privacy Policy
              <DocumentTextIcon className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>

        {/* Meta Platform Compliance */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Meta Platform Compliance
          </h2>
          <p className="text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            Crow's Eye is designed and maintained to be fully compliant with Meta Developer Platform requirements.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {complianceFeatures.map((feature, index) => (
              <div key={index} className="feature-card rounded-lg p-6">
                <div className="flex items-start mb-4">
                  <feature.icon className="h-8 w-8 text-primary-500 mr-4 mt-1 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Data Retention & Sharing */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-primary-900/20 to-primary-600/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white text-center mb-6">
              Data Retention & Sharing
            </h3>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-gray-300 mb-4">
                Our data retention policies are detailed in our full Privacy Policy. We confirm 
                <strong className="text-white"> no third-party data sharing</strong> of Meta platform data.
              </p>
              <p className="text-gray-300">
                All data retrieved via Meta APIs is used solely for app functionality and is not sold or shared.
              </p>
            </div>
          </div>
        </div>

        {/* Your Data Rights */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Your Data Rights (GDPR/CCPA & Other Regulations)
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-300 text-center mb-8">
              We uphold your rights over your personal data:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataRights.map((right, index) => (
                <div key={index} className="flex items-start">
                  <ShieldCheckIcon className="h-5 w-5 text-primary-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{right}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Contact Us About Privacy
          </h2>
          <div className="max-w-2xl mx-auto feature-card rounded-lg p-8">
            <p className="text-gray-300 mb-6">
              For any questions, concerns, or requests regarding your privacy or our data practices:
            </p>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Email:</p>
                <a 
                  href="mailto:privacy@crowseyeapp.com"
                  className="text-primary-400 hover:text-primary-300 font-medium"
                >
                  privacy@crowseyeapp.com
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Phone:</p>
                <a 
                  href="tel:+15551234567"
                  className="text-primary-400 hover:text-primary-300 font-medium"
                >
                  (555) 123-4567
                </a>
              </div>
              <div className="pt-4">
                <Link
                  href="/privacy-policy-details"
                  className="text-primary-400 hover:text-primary-300 underline"
                >
                  View Full Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 