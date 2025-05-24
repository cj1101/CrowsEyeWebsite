'use client'

import React from 'react'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export default function Contact() {
  const contactSections = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: "General Support & Feature Inquiries",
      description: "For assistance with using Crow's Eye, feature suggestions, or general questions:",
      contacts: [
        { type: "Email", value: "support@crowseyeapp.com", href: "mailto:support@crowseyeapp.com" },
        { type: "Community Forum", value: "Join our Discord server", href: "#" }
      ]
    },
    {
      icon: BuildingOfficeIcon,
      title: "Sales & Agency Plans",
      description: "For information on our Agent Tier, custom agency solutions, or volume pricing:",
      contacts: [
        { type: "Email", value: "sales@crowseyeapp.com", href: "mailto:sales@crowseyeapp.com" },
        { type: "Book a Demo", value: "Schedule a consultation", href: "#" }
      ]
    },
    {
      icon: ShieldCheckIcon,
      title: "Privacy & Data Compliance Inquiries",
      description: "For questions specifically related to your privacy, data rights, or our compliance practices:",
      contacts: [
        { type: "Email", value: "privacy@crowseyeapp.com", href: "mailto:privacy@crowseyeapp.com" },
        { type: "Phone", value: "(555) 123-4567", href: "tel:+15551234567" }
      ]
    }
  ]

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Get in Touch with Crow's Eye
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We're here to help! Whether you have a question, feedback, or need support, please reach out.
          </p>
        </div>

        {/* Contact Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {contactSections.map((section, index) => (
            <div key={index} className="feature-card rounded-lg p-8 text-center">
              <div className="flex justify-center mb-6">
                <section.icon className="h-12 w-12 text-primary-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-4">
                {section.title}
              </h2>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                {section.description}
              </p>
              <div className="space-y-3">
                {section.contacts.map((contact, contactIndex) => (
                  <div key={contactIndex}>
                    <p className="text-sm text-gray-500 mb-1">{contact.type}:</p>
                    <a
                      href={contact.href}
                      className="text-primary-400 hover:text-primary-300 transition-colors font-medium"
                    >
                      {contact.value}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Response Time */}
        <div className="text-center mb-16">
          <div className="bg-gradient-to-r from-primary-900/20 to-primary-600/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4">
              Response Time
            </h3>
            <p className="text-gray-300">
              We aim to respond to all inquiries within 24-48 business hours.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <div className="feature-card rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Send us a Message
            </h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="w-full px-4 py-3 bg-black/50 border border-primary-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="w-full px-4 py-3 bg-black/50 border border-primary-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 bg-black/50 border border-primary-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 bg-black/50 border border-primary-600/30 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
                >
                  <option value="">Select a topic</option>
                  <option value="support">General Support</option>
                  <option value="feature">Feature Request</option>
                  <option value="sales">Sales Inquiry</option>
                  <option value="privacy">Privacy/Compliance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="w-full px-4 py-3 bg-black/50 border border-primary-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-4 px-6 rounded-lg font-semibold hover-glow transition-all duration-300"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">
            For urgent technical issues, please include your account email and a detailed description of the problem.
          </p>
          <p className="text-sm text-gray-500">
            We value your feedback and are committed to providing exceptional support to our creative community.
          </p>
        </div>
      </div>
    </div>
  )
} 