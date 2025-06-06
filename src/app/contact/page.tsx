'use client'

import React, { useState } from 'react'
import { 
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  PaperAirplaneIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
    // You can add actual form submission logic here
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const contactSections = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: "General Support",
      subtitle: "Feature Inquiries & Assistance",
      description: "Get help with Crow's Eye features, troubleshooting, or general questions about our platform.",
      contacts: [
        { type: "Email", value: "support@crowseyeapp.com", href: "mailto:support@crowseyeapp.com" },
        { type: "Phone", value: "(512) 987-4449", href: "tel:+15129874449" }
      ],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: BuildingOfficeIcon,
      title: "Sales & Enterprise",
      subtitle: "Custom Solutions & Pricing",
      description: "Explore our Agency Tier, custom enterprise solutions, or discuss volume pricing for your organization.",
      contacts: [
        { type: "Email", value: "support@crowseyeapp.com", href: "mailto:support@crowseyeapp.com" },
        { type: "Phone", value: "(512) 987-4449", href: "tel:+15129874449" }
      ],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: ShieldCheckIcon,
      title: "Privacy & Compliance",
      subtitle: "Data Rights & Security",
      description: "Questions about privacy, data rights, GDPR compliance, or our security practices and policies.",
      contacts: [
        { type: "Email", value: "support@crowseyeapp.com", href: "mailto:support@crowseyeapp.com" },
        { type: "Phone", value: "(512) 987-4449", href: "tel:+15129874449" }
      ],
      color: "from-green-500 to-emerald-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">We're Here to Help</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Get in Touch
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              With Crow's Eye
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Whether you have questions, need support, or want to explore custom solutions, 
            our team is ready to help you succeed.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {contactSections.map((section, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className={`w-16 h-16 bg-gradient-to-r ${section.color} rounded-2xl mb-6 flex items-center justify-center`}>
                  <section.icon className="h-8 w-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">
                  {section.title}
                </h2>
                <p className="text-purple-300 font-medium mb-4">
                  {section.subtitle}
                </p>
                <p className="text-gray-300 leading-relaxed mb-8">
                  {section.description}
                </p>
                
                <div className="space-y-4">
                  {section.contacts.map((contact, contactIndex) => (
                    <a
                      key={contactIndex}
                      href={contact.href}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                    >
                      {contact.type === 'Email' ? (
                        <EnvelopeIcon className="h-5 w-5 text-purple-400" />
                      ) : (
                        <PhoneIcon className="h-5 w-5 text-purple-400" />
                      )}
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">{contact.type}</p>
                        <p className="text-white font-medium group-hover:text-purple-300 transition-colors">
                          {contact.value}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Response Time */}
      <section className="py-16 bg-black/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 rounded-3xl p-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <ClockIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">
              Response Time
            </h3>
            <p className="text-xl text-gray-300 mb-4">
              We aim to respond to all inquiries within 24-48 business hours.
            </p>
            <p className="text-gray-400">
              For urgent technical issues, please include your account email and detailed problem description.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Send us a Message</h2>
            <p className="text-xl text-gray-300">
              Prefer to reach out directly? Fill out the form below and we'll get back to you soon.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-3">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="Your first name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-3">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="Your last name"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-3">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-3">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  required
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
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-3">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-vertical"
                  placeholder="Tell us how we can help you..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-8 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-16 bg-black/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-6">
            We Value Your Feedback
          </h3>
          <p className="text-gray-300 mb-4 leading-relaxed">
            Your input helps us improve Crow's Eye and better serve our creative community. 
            We're committed to providing exceptional support and building tools that truly make a difference.
          </p>
          <p className="text-sm text-gray-400">
            For the fastest support, include your account email and a detailed description of any issues.
          </p>
        </div>
      </section>
    </div>
  )
} 