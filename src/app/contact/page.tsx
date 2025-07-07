'use client'

import React, { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, ArrowRight, Eye } from 'lucide-react'

const contactMethods = [
  {
    icon: <Mail className="h-6 w-6" />,
    title: "Email Us",
    details: "help@crowseye.tech",
    description: "Get in touch for support or inquiries",
    color: "text-blue-400"
  },
  {
    icon: <Phone className="h-6 w-6" />,
    title: "Call Us",
    details: "+1 (512) 987-4449",
    description: "Speak directly with our team",
    color: "text-green-400"
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: "Visit Us",
    details: "Austin, TX",
    description: "We operate remotely",
    color: "text-purple-400"
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Response Time",
    details: "< 24 hours",
    description: "We respond to all inquiries quickly",
    color: "text-orange-400"
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen darker-gradient-bg logo-bg-overlay">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"></div>
        
        {/* Logo Header */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-8">
            <img 
              src="/favicon.ico" 
              alt="Crow's Eye Logo" 
              className="h-16 w-16 md:h-20 md:w-20 opacity-90"
            />
            <div className="text-left">
              <h1 className="text-2xl md:text-4xl font-bold tech-heading gradient-text-animated">
                CROW'S EYE
              </h1>
              <p className="text-purple-300 text-sm md:text-base tech-subheading">
                AI Marketing Suite
              </p>
            </div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 tech-heading">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Get in Touch
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              We're Here to Help
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed tech-body">
            Have questions about Crow's Eye? Need support or want to discuss a custom solution? 
            Our team is ready to assist you with your AI-powered marketing journey.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {contactMethods.map((method, index) => (
              <div 
                key={method.title}
                className="vision-card rounded-xl p-6 hover:bg-white/5 transition-all duration-300 text-center group"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 vision-card rounded-full mb-4 ${method.color} group-hover:scale-110 transition-transform`}>
                  {method.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 tech-subheading">{method.title}</h3>
                <p className="text-white font-semibold mb-2 tech-body">{method.details}</p>
                <p className="text-gray-400 text-sm tech-body">{method.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-black/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 tech-heading">Send Us a Message</h2>
            <p className="text-xl text-gray-300 tech-body">
              Fill out the form below and we'll get back to you as soon as possible
            </p>
          </div>
          
          <div className="vision-card rounded-2xl p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 tech-subheading">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 vision-card rounded-lg bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all tech-body"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 tech-subheading">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 vision-card rounded-lg bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all tech-body"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 tech-subheading">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 vision-card rounded-lg bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all tech-body"
                  placeholder="What can we help you with?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 tech-subheading">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 vision-card rounded-lg bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none tech-body"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center gap-2 vision-button text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 tech-subheading ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Support Hours & Response Time */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="vision-card rounded-xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 vision-card rounded-full mb-6">
                <Clock className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 tech-heading">Support Hours</h3>
              <div className="space-y-2 text-gray-300">
                <p className="tech-body">Monday - Friday: 9:00 AM - 6:00 PM PST</p>
                <p className="tech-body">Saturday: 10:00 AM - 4:00 PM PST</p>
                <p className="tech-body">Sunday: Closed</p>
              </div>
              <p className="text-sm text-purple-300 mt-4 tech-body">
                Emergency support available 24/7 for Business plan customers
              </p>
            </div>
            
            <div className="vision-card rounded-xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 vision-card rounded-full mb-6">
                <Mail className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 tech-heading">Response Time</h3>
              <div className="space-y-2 text-gray-300">
                <p className="tech-body">Email: Within 24 hours</p>
                <p className="tech-body">Phone: Immediate during business hours</p>
                <p className="tech-body">Live Chat: Coming soon</p>
              </div>
              <p className="text-sm text-purple-300 mt-4 tech-body">
                Priority support for paid plan customers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 vision-card rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-white mb-6 tech-heading">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto tech-body">
              Don't wait—experience the power of AI-driven social media marketing today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/marketing-tool" 
                className="inline-flex items-center gap-2 vision-button text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 tech-subheading"
              >
                <Eye className="h-5 w-5" />
                Try Live Demo
              </a>
              <a 
                href="/download" 
                className="inline-flex items-center gap-2 vision-card text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 tech-subheading"
              >
                <ArrowRight className="h-5 w-5" />
                Download Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 