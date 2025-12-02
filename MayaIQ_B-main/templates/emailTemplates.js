/**
 * Professional email templates for Pingbash automated communications
 * @author Pingbash Team
 */

const getEmailHeader = () => `
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-family: 'Arial', sans-serif; font-size: 24px;">
      🚀 Pingbash
    </h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">
      Real-time Group Communication Platform
    </p>
  </div>
`;

const getEmailFooter = () => `
  <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
    <p style="margin: 0; color: #6c757d; font-size: 12px; font-family: 'Arial', sans-serif;">
      This is an automated message from Pingbash. Please do not reply to this email.
    </p>
    <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 12px;">
      © 2024 Pingbash. All rights reserved.
    </p>
  </div>
`;

const getEmailWrapper = (content) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pingbash Notification</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      ${getEmailHeader()}
      <div style="padding: 30px;">
        ${content}
      </div>
      ${getEmailFooter()}
    </div>
  </body>
  </html>
`;

const emailTemplates = {
  // Account verification email
  verification: (otp) => {
    const content = `
      <h2 style="color: #333; margin-bottom: 20px; font-size: 20px;">Verify Your Email Address</h2>
      <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        Welcome to Pingbash! To complete your account setup and start enjoying real-time group communications, 
        please verify your email address using the code below:
      </p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 2px; font-family: monospace;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 10px;">
          This code expires in 5 minutes
        </p>
      </div>
      <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        Enter this code in the verification form to activate your account and start connecting with others.
      </p>
      <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; border-left: 4px solid #2196f3;">
        <p style="margin: 0; color: #1976d2; font-size: 14px;">
          <strong>Security tip:</strong> Never share this code with anyone. Pingbash will never ask for your verification code via phone or email.
        </p>
      </div>
    `;
    return getEmailWrapper(content);
  },

  // Group notification email
  groupNotification: (message, groupName) => {
    const content = `
      <h2 style="color: #333; margin-bottom: 20px; font-size: 20px;">New Group Activity</h2>
      <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
        You have new activity in your group <strong style="color: #667eea;">${groupName}</strong>:
      </p>
      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
        <div style="font-size: 16px; color: #856404; line-height: 1.5;">
          ${message}
        </div>
      </div>
      <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        <a href="https://pingbash.com" style="color: #667eea; text-decoration: none; font-weight: bold;">
          Click here to view and respond
        </a>
      </p>
    `;
    return getEmailWrapper(content);
  },

  // Direct message notification
  directMessage: (senderName, message, groupName) => {
    const content = `
      <h2 style="color: #333; margin-bottom: 20px; font-size: 20px;">New Direct Message</h2>
      <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
        <strong style="color: #667eea;">${senderName}</strong> sent you a message in <strong>${groupName}</strong>:
      </p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
        <div style="font-size: 16px; color: #333; line-height: 1.5; font-style: italic;">
          "${message}"
        </div>
      </div>
      <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        <a href="https://pingbash.com" style="color: #667eea; text-decoration: none; font-weight: bold;">
          Reply now
        </a>
      </p>
    `;
    return getEmailWrapper(content);
  },

  // Password reset email
  passwordReset: (resetLink) => {
    const content = `
      <h2 style="color: #333; margin-bottom: 20px; font-size: 20px;">Reset Your Password</h2>
      <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        We received a request to reset your Pingbash account password. Click the button below to create a new password:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #666; line-height: 1.6; margin-bottom: 20px; font-size: 14px;">
        If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
      <div style="background: #ffebee; padding: 15px; border-radius: 6px; border-left: 4px solid #f44336;">
        <p style="margin: 0; color: #c62828; font-size: 14px;">
          <strong>Security notice:</strong> This link expires in 1 hour for your security.
        </p>
      </div>
    `;
    return getEmailWrapper(content);
  },

  // Optional verification link email (widget signup)
  verification_link: (userName, verificationLink) => {
    const content = `
      <h2 style="color: #333; margin-bottom: 20px; font-size: 20px;">Verify Your Email (Optional)</h2>
      <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        Hi ${userName},
      </p>
      <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        Welcome to Pingbash! Your account is already active and you can start chatting right away.
      </p>
      <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        However, we recommend verifying your email address for added security and to ensure you can recover your account if needed.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #666; line-height: 1.6; margin-bottom: 20px; font-size: 14px;">
        If you didn't create an account at Pingbash, you can safely ignore this email.
      </p>
      <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; border-left: 4px solid #2196f3;">
        <p style="margin: 0; color: #1976d2; font-size: 14px;">
          <strong>Note:</strong> This verification is optional. You can continue using Pingbash without verifying your email.
        </p>
      </div>
    `;
    return getEmailWrapper(content);
  },

  // Welcome email for new users
  welcome: (userName) => {
    const content = `
      <h2 style="color: #333; margin-bottom: 20px; font-size: 20px;">Welcome to Pingbash! 🎉</h2>
      <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        Hi ${userName},
      </p>
      <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        Welcome to Pingbash, the premier platform for real-time group communication! We're excited to have you join our community.
      </p>
      <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2e7d32; margin-top: 0; font-size: 18px;">Getting Started</h3>
        <ul style="color: #2e7d32; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Create or join group chats</li>
          <li>Share messages, files, and media</li>
          <li>Customize your chat experience</li>
          <li>Connect with people worldwide</li>
        </ul>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://pingbash.com" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Start Chatting Now
        </a>
      </div>
      <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        If you have any questions or need help getting started, feel free to reach out to our support team.
      </p>
    `;
    return getEmailWrapper(content);
  }
};

module.exports = emailTemplates; 