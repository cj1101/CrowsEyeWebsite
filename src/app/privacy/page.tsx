import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Crow\'s Eye',
  description: 'Privacy Policy for Crow\'s Eye. Understand how we collect, use, and protect your data.',
};

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-center text-gray-400 mb-8">Last Updated: July 7, 2025</p>

          <div className="bg-gray-800/50 p-6 sm:p-8 rounded-lg shadow-lg prose prose-invert prose-lg max-w-none">
            <p className="text-gray-400">
              This Privacy Policy describes how Crow's Eye ("we," "us," or "our") collects, uses, and discloses your information when you use our website and services (the "Services"). By using our Services, you agree to the collection and use of information in accordance with this policy. This document is intended to be a clear and transparent explanation of our data practices; for full legal compliance, we recommend consulting with a legal professional.
            </p>

            <h2>1. Information We Collect</h2>
            <p>We collect several different types of information for various purposes to provide and improve our Services to you.</p>
            
            <h4>a. Information You Provide to Us</h4>
            <ul>
              <li>
                <strong>Account Information:</strong> When you register for an account, we collect your first name, last name, email address, and password.
              </li>
              <li>
                <strong>Google Account Information:</strong> If you register or log in using Google, we collect the name, email address, and profile picture associated with your Google account, as authorized by you during the sign-in process.
              </li>
              <li>
                <strong>Payment and Subscription Information:</strong> When you subscribe to a paid plan, our third-party payment processor, Stripe, will collect your payment details. We do not store your full credit card information. We do receive and store subscription-related information, such as your plan type, subscription status, and a unique Stripe customer identifier.
              </li>
              <li>
                <strong>User-Generated Content:</strong> We collect the content you create, upload, or post while using our Services. This includes text, images, videos, audio files, and any other media or data you submit ("Content").
              </li>
            </ul>

            <h4>b. Information We Collect Automatically</h4>
            <ul>
              <li>
                <strong>Usage Data:</strong> We automatically collect information about how you access and use the Services. This may include your IP address, browser type, device type, operating system, pages viewed, and the dates/times of your visits.
              </li>
              <li>
                <strong>Cookies and Local Storage:</strong> We use cookies and similar tracking technologies like browser local storage to track activity on our Services and hold certain information. For example, we may use local storage to remember if you have used a promotional code. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Services.
              </li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the collected data for various purposes:</p>
            <ul>
              <li>To provide, operate, and maintain our Services.</li>
              <li>To create and manage your account and subscriptions.</li>
              <li>To process your payments through our third-party service provider, Stripe.</li>
              <li>To enable the functionality of our AI-powered tools.</li>
              <li>To notify you about changes to our Services or your account.</li>
              <li>To provide customer support and respond to your inquiries.</li>
              <li>To monitor and analyze usage to improve the user experience and functionality of our Services.</li>
              <li>To prevent, detect, and address technical issues or fraudulent activity.</li>
            </ul>

            <h2>3. How We Share Your Information</h2>
            <p>We do not sell your personal information. We may share your information in the following limited circumstances:</p>
            <ul>
              <li>
                <strong>With Service Providers:</strong> We share information with third-party vendors who perform services on our behalf. These include:
                <ul>
                  <li><strong>Stripe:</strong> For payment processing.</li>
                  <li><strong>Google (Firebase):</strong> For cloud hosting, database storage, file storage, and user authentication.</li>
                  <li><strong>Google (Gemini):</strong> To power our AI content generation features.</li>
                </ul>
              </li>
              <li>
                <strong>For Legal Reasons:</strong> We may disclose your information if we are required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).
              </li>
              <li>
                <strong>To Protect Rights:</strong> We may disclose your information if we believe it is necessary to investigate, prevent, or take action regarding potential violations of our policies, suspected fraud, or situations involving potential threats to the safety of any person.
              </li>
            </ul>

            <h2>4. Data Security and Retention</h2>
            <p>
              The security of your data is important to us. We use commercially reasonable administrative, technical, and physical security measures to protect your personal information. We will retain your personal information for as long as your account is active or as needed to provide you with the Services and to comply with our legal obligations.
            </p>

            <h2>5. Children's Privacy</h2>
            <p>
              Our Services are not intended for use by children under the age of 13. We do not knowingly collect personally identifiable information from children under 13.
            </p>

            <h2>6. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at: support@crowseye.tech
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
