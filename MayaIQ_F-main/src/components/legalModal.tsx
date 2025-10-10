"use client";

import React from "react";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "privacy" | "terms";
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const isPrivacy = type === "privacy";
  const title = isPrivacy ? "Privacy Policy" : "Terms and Conditions";

  const privacyContent = (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 mb-4">
        <strong>Effective Date:</strong> December 2024
      </div>
      
      <p className="text-gray-700 leading-relaxed">
        PingBash provides a community chat service that allows users to create, join, and embed chat groups. 
        We respect your privacy and are committed to protecting your personal information. This Privacy Policy 
        explains what information we collect, how we use it, and your rights.
      </p>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">1. The Golden Rule of Privacy</h3>
          <p className="text-gray-700 leading-relaxed">
            Remember that anything that you post online should be assumed to be seen by everyone. As a general rule 
            when interacting with any Internet service, you should not provide any personally identifiable information 
            unless you are confident of both the identity of the receiver and of the need for the information.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">2. Information We Collect</h3>
          <p className="text-gray-700 leading-relaxed mb-2">When you use our services, we may collect the following:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
            <li><strong>Account Information:</strong> If you sign up, we may collect your username, email address, or other registration details.</li>
            <li><strong>Chat Content:</strong> Messages, images, or other content you share in chat groups. Public chats are visible to anyone who joins or embeds the group.</li>
            <li><strong>Technical Data:</strong> IP addresses, browser type, device information, and cookies to help us secure and improve the service.</li>
            <li><strong>Usage Data:</strong> Information about how you use our platform (e.g., pages visited, groups joined).</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">3. How We Use Information</h3>
          <p className="text-gray-700 leading-relaxed mb-2">We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
            <li>Provide and operate the chat services.</li>
            <li>Moderate and enforce community guidelines.</li>
            <li>Improve performance and user experience.</li>
            <li>Protect against spam, abuse, and security threats.</li>
            <li>Comply with legal obligations.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">4. Sharing of Information</h3>
          <p className="text-gray-700 leading-relaxed mb-2">We do not sell or rent your personal information. We may share limited data only in these cases:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
            <li>With service providers who help us operate the platform.</li>
            <li>If required by law or legal process.</li>
            <li>To protect the rights, safety, and security of users and the platform.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">5. Cookies & Tracking</h3>
          <p className="text-gray-700 leading-relaxed mb-2">We may use cookies and similar technologies to:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
            <li>Remember user preferences.</li>
            <li>Analyze traffic and usage.</li>
            <li>Provide security features.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-2">You can manage cookies through your browser settings.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">6. Data Retention</h3>
          <p className="text-gray-700 leading-relaxed">
            We keep your information as long as necessary to provide the service and comply with legal obligations. 
            You may request deletion of your account or content by contacting us.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">7. Your Rights</h3>
          <p className="text-gray-700 leading-relaxed mb-2">Depending on your location, you may have the right to:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
            <li>Access, update, or delete your data.</li>
            <li>Object to certain uses of your data.</li>
            <li>Request a copy of your personal information.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-2">
            To exercise your rights, contact us at: <a href="mailto:contact@pingbash.com" className="text-blue-600 hover:underline">contact@pingbash.com</a>
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">8. Children's Privacy</h3>
          <p className="text-gray-700 leading-relaxed">
            Our services are not intended for children under 13 (or under 16 in the EU). If we learn we have collected 
            data from a child without parental consent, we will delete it.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">9. Security</h3>
          <p className="text-gray-700 leading-relaxed">
            We take reasonable measures to protect your data, but no system is 100% secure. Use the chat service at your own risk.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">10. Changes to This Policy</h3>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time. The latest version will always be available on our site.
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact Us</h3>
          <p className="text-gray-700 leading-relaxed">
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <p className="text-gray-700 mt-2">
            Email: <a href="mailto:contact@pingbash.com" className="text-blue-600 hover:underline">contact@pingbash.com</a>
          </p>
        </div>
      </div>
    </div>
  );

  const termsContent = (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 mb-4">
        <strong>Effective Date:</strong> December 2024
      </div>
      
      <p className="text-gray-700 leading-relaxed">
        Welcome to PingBash. These Terms and Conditions ("Terms") govern your access to and use of our website, 
        chat services, and any related features or tools (collectively, the "Service").
      </p>
      
      <p className="text-gray-700 leading-relaxed">
        By using or accessing the Service, you agree to be bound by these Terms. If you do not agree, please do not use our platform.
      </p>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">1. Eligibility</h3>
          <p className="text-gray-700 leading-relaxed">
            You must be at least 13 years old (or 16 if located in the EU) to use the Service. By using our platform, 
            you confirm that you meet this requirement.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">2. User Accounts</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
            <li>Some features may require you to register for an account.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You agree not to impersonate others or use misleading usernames.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">3. Chat Groups and User Content</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
            <li>You are responsible for all content you post, transmit, or share in any chat or group.</li>
            <li>You retain ownership of your content, but grant us a worldwide, non-exclusive, royalty-free license to host and display it for the purpose of operating the Service.</li>
            <li>Public chat groups and messages may be visible to anyone and may be indexed by search engines.</li>
          </ul>
          
          <p className="text-gray-700 leading-relaxed mt-3 mb-2">You agree not to post or share content that:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
            <li>Contains hate speech, harassment, or threats.</li>
            <li>Promotes violence, illegal activity, or self-harm.</li>
            <li>Includes explicit or pornographic material.</li>
            <li>Violates any laws, third-party rights, or our community guidelines.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-2">We may remove content or suspend accounts that violate these rules.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">4. Embedded Chat Groups</h3>
          <p className="text-gray-700 leading-relaxed mb-2">If you embed a chat group on your website or platform:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
            <li>You are responsible for how it is used and moderated on your site.</li>
            <li>You must not use the chat for spam, scams, or harmful activities.</li>
            <li>You must comply with all applicable laws and ensure your users do the same.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">5. Prohibited Uses</h3>
          <p className="text-gray-700 leading-relaxed mb-2">You agree not to:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
            <li>Use automated tools (bots, scrapers) to collect or misuse data.</li>
            <li>Interfere with or disrupt the Service.</li>
            <li>Attempt to hack, reverse-engineer, or access non-public areas of the system.</li>
            <li>Use the Service to impersonate or defraud others.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">6. Privacy</h3>
          <p className="text-gray-700 leading-relaxed">
            Your use of the Service is also governed by our Privacy Policy, which explains how we collect and handle your information.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">7. Termination</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
            <li>We reserve the right to suspend or terminate your account or access at any time if you violate these Terms or misuse the Service.</li>
            <li>You may delete your account or stop using the Service at any time.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">8. Disclaimer of Warranties</h3>
          <p className="text-gray-700 leading-relaxed">
            The Service is provided "as is" and "as available" without warranties of any kind, express or implied. 
            We do not guarantee uninterrupted or error-free operation.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">9. Limitation of Liability</h3>
          <p className="text-gray-700 leading-relaxed">
            To the maximum extent permitted by law, PingBash is not liable for any damages, losses, or claims arising 
            from your use of the Service, user content, or third-party interactions.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">10. Third-Party Links and Integrations</h3>
          <p className="text-gray-700 leading-relaxed">
            The Service may contain links or embedded features from third parties. We are not responsible for their 
            content, policies, or actions.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {isPrivacy ? privacyContent : termsContent}
          </div>
          
          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-[#0F00D4] to-[#B300C8] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
