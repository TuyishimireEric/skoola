interface ForgotPasswordTemplateProps {
  FullName: string;
  Token: string;
}

export const forgotPasswordTemplate = ({
  FullName,
  Token,
}: ForgotPasswordTemplateProps): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Ganzaa Password</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
        
        :root {
          --background: #ffdfc1;
          --foreground: #5a3215;
          --primary-50: #fbeee0;
          --primary-100: #fbeee0;
          --primary-200: #f5d1a1;
          --primary-300: #eab77d;
          --primary-400: #d7954f;
          --primary-500: #d7954f;
          --primary-600: #a1622c;
          --primary-700: #7b481e;
          --primary-800: #7b481e;
          --primary-900: #5a3215;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          color: var(--foreground);
          background: #ffdfc1;
          margin: 0;
          padding: 20px 0;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .email-wrapper {
          background: #fbeee0;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(162, 98, 44, 0.2);
          border: 6px solid #d7954f;
        }
        
        .email-header {
          padding: 32px 24px;
          text-align: center;
          background: linear-gradient(135deg, #d7954f 0%, #a1622c 100%);
          color: white;
        }
        
        .logo {
          max-width: 80px;
          height: auto;
          margin-bottom: 16px;
          border-radius: 8px;
        }
        
        .brand-title {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .brand-tagline {
          font-size: 16px;
          font-weight: 300;
          opacity: 0.9;
        }
        
        .email-body {
          padding: 32px 24px;
          background: #fbeee0;
        }
        
        .greeting {
          font-size: 24px;
          font-weight: 500;
          color: #7b481e;
          margin-bottom: 20px;
        }
        
        .paragraph {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 20px;
          color: #7b481e;
        }
        
        .highlight {
          color: #a1622c;
          font-weight: 500;
        }
        
        .info-box {
          background: #f5d1a15d;
          border: 1px solid #d7954f;
          border-radius: 12px;
          padding: 16px 20px;
          margin: 24px 0;
          border-left: 6px solid #d7954f;
        }
        
        .info-text {
          margin: 0;
          font-weight: 500;
          color: var(--primary-800);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .verification-section {
          background: white;
          border: 2px dashed var(--primary-500);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          margin: 28px 0;
          position: relative;
        }
        
        .verification-code {
          font-family: 'Roboto Mono', 'Courier New', monospace;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 6px;
          color: var(--primary-700);
          margin-bottom: 12px;
          user-select: all;
        }
        
        .steps-section {
          margin: 28px 0;
        }
        
        .steps-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--primary-700);
          margin-bottom: 16px;
        }
        
        .step {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
          gap: 12px;
        }
        
        .step-number {
          background: var(--primary-600);
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          flex-shrink: 0;
        }
        
        .step-text {
          font-size: 15px;
          color: var(--primary-800);
          line-height: 1.5;
        }
        
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, var(--primary-400), transparent);
          margin: 24px 0;
        }
        
        .warning-box {
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 12px;
          padding: 16px 20px;
          margin: 24px 0;
          border-left: 6px solid #ffc107;
        }
        
        .warning-text {
          margin: 0;
          font-weight: 500;
          color: #856404;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .email-footer {
          background: var(--primary-200);
          padding: 24px;
          text-align: center;
          color: var(--primary-800);
          font-size: 14px;
        }
        
        .footer-brand {
          font-weight: 500;
          margin-bottom: 12px;
        }
        
        .social-links {
          margin: 16px 0;
        }
        
        .social-links a {
          display: inline-block;
          margin: 0 8px;
          color: var(--primary-700);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        
        .social-links a:hover {
          color: var(--primary-900);
        }
        
        .footer-disclaimer {
          margin-top: 16px;
          font-size: 12px;
          opacity: 0.8;
        }
        
        .emoji {
          font-size: 20px;
        }
        
        /* Mobile Responsive */
        @media only screen and (max-width: 600px) {
          .container {
            padding: 0 10px;
          }
          
          .email-header {
            padding: 24px 16px;
          }
          
          .email-body {
            padding: 24px 16px;
          }
          
          .brand-title {
            font-size: 24px;
          }
          
          .greeting {
            font-size: 20px;
          }
          
          .paragraph {
            font-size: 15px;
          }
          
          .verification-code {
            font-size: 24px;
            letter-spacing: 4px;
          }
          
          .logo {
            max-width: 60px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="email-header">
            <img src="https://res.cloudinary.com/dn8vyfgnl/image/upload/v1750008049/Logo_gnwstm.png" alt="Ganzaa Logo" class="logo">
            <h1 class="brand-title">Password Reset</h1>
            <p class="brand-tagline">Smart Learning • Bright Future</p>
          </div>
          
          <div class="email-body">
            <h2 class="greeting">Hello ${FullName}! <span class="emoji">🔐</span></h2>
            
            <p class="paragraph">
              We received a request to reset the password for your <span class="highlight">Ganzaa</span> account. Use the verification code below to create a new password.
            </p>
            
            <div class="info-box">
              <p class="info-text">
                <span class="emoji">🔑</span>
                <strong>Use this code to reset your password</strong>
              </p>
            </div>
            
            <div class="verification-section">
              <div class="verification-code" id="verificationCode">${Token}</div>
            </div>
            
            <div class="steps-section">
              <h3 class="steps-title">How to reset your password:</h3>
              
              <div class="step">
                <div class="step-number">1</div>
                <div class="step-text">Go to the <span class="highlight">Ganzaa password reset page</span></div>
              </div>
              
              <div class="step">
                <div class="step-number">2</div>
                <div class="step-text">Enter the verification code shown above</div>
              </div>
              
              <div class="step">
                <div class="step-number">3</div>
                <div class="step-text">Create your new secure password</div>
              </div>
              
              <div class="step">
                <div class="step-number">4</div>
                <div class="step-text">Click "Reset Password" to save your changes</div>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <p class="paragraph">
              ⏰ This password reset code expires in <strong>1 hour</strong> for your security.
            </p>
            
            <div class="warning-box">
              <p class="warning-text">
                <span style="display: flex; align-items: center; gap: 8px;">
                  <span class="emoji">⚠️</span>
                  <strong>Didn't request this password reset?</strong>
                </span>
                <span>If you didn't initiate this request, please contact our support team immediately at <a href="mailto:help@ganzaa.org" style="color: #856404; text-decoration: none; font-weight: 600;">help@ganzaa.org</a></span>
              </p>
            </div>
            
            <p class="paragraph" style="margin-bottom: 0;">
              <strong>Best regards,</strong><br>
              The Ganzaa Team <span class="emoji">🌟</span>
            </p>
          </div>
          
          <div class="email-footer">
            <p class="footer-brand">© 2025 Ganzaa.org - All rights reserved</p>
            
            <div class="social-links">
              <a href="#" aria-label="Follow us on Twitter">Twitter</a>
              <a href="#" aria-label="Like us on Facebook">Facebook</a>
              <a href="#" aria-label="Follow us on Instagram">Instagram</a>
            </div>
            
            <p class="footer-disclaimer">
              This email was sent in response to a password reset request.<br>
              If you did not request this, please contact help@ganzaa.org immediately.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

interface PasswordUpdatedTemplateProps {
  FullName: string;
}

export const passwordUpdatedTemplate = ({
  FullName,
}: PasswordUpdatedTemplateProps): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Updated Successfully - Ganzaa</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
        
        :root {
          --background: #ffdfc1;
          --foreground: #5a3215;
          --primary-50: #fbeee0;
          --primary-100: #fbeee0;
          --primary-200: #f5d1a1;
          --primary-300: #eab77d;
          --primary-400: #d7954f;
          --primary-500: #d7954f;
          --primary-600: #a1622c;
          --primary-700: #7b481e;
          --primary-800: #7b481e;
          --primary-900: #5a3215;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          color: var(--foreground);
          background: #ffdfc1;
          margin: 0;
          padding: 20px 0;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .email-wrapper {
          background: #fbeee0;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(162, 98, 44, 0.2);
          border: 6px solid #d7954f;
        }
        
        .email-header {
          padding: 32px 24px;
          text-align: center;
          background: linear-gradient(135deg, #27ae60 0%, #219a52 100%);
          color: white;
        }
        
        .logo {
          max-width: 80px;
          height: auto;
          margin-bottom: 16px;
          border-radius: 8px;
        }
        
        .brand-title {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .brand-tagline {
          font-size: 16px;
          font-weight: 300;
          opacity: 0.9;
        }
        
        .email-body {
          padding: 32px 24px;
          background: #fbeee0;
        }
        
        .greeting {
          font-size: 24px;
          font-weight: 500;
          color: #7b481e;
          margin-bottom: 20px;
        }
        
        .paragraph {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 20px;
          color: #7b481e;
        }
        
        .highlight {
          color: #a1622c;
          font-weight: 500;
        }
        
        .success-box {
          background: #d4edda;
          border: 1px solid #27ae60;
          border-radius: 12px;
          padding: 16px 20px;
          margin: 24px 0;
          border-left: 6px solid #27ae60;
          text-align: center;
        }
        
        .success-text {
          margin: 0;
          font-weight: 500;
          color: #155724;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 18px;
        }
        
        .security-tips {
          background: #e7f3ff;
          border: 1px solid #2196f3;
          border-radius: 12px;
          padding: 20px;
          margin: 24px 0;
          border-left: 6px solid #2196f3;
        }
        
        .tips-title {
          font-size: 16px;
          font-weight: 600;
          color: #1565c0;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .tips-list {
          margin: 0;
          padding-left: 16px;
          color: #1565c0;
        }
        
        .tips-list li {
          margin-bottom: 8px;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, var(--primary-400), transparent);
          margin: 24px 0;
        }
        
        .warning-box {
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 12px;
          padding: 16px 20px;
          margin: 24px 0;
          border-left: 6px solid #ffc107;
        }
        
        .warning-text {
          margin: 0;
          font-weight: 500;
          color: #856404;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .email-footer {
          background: var(--primary-200);
          padding: 24px;
          text-align: center;
          color: var(--primary-800);
          font-size: 14px;
        }
        
        .footer-brand {
          font-weight: 500;
          margin-bottom: 12px;
        }
        
        .social-links {
          margin: 16px 0;
        }
        
        .social-links a {
          display: inline-block;
          margin: 0 8px;
          color: var(--primary-700);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        
        .social-links a:hover {
          color: var(--primary-900);
        }
        
        .footer-disclaimer {
          margin-top: 16px;
          font-size: 12px;
          opacity: 0.8;
        }
        
        .emoji {
          font-size: 20px;
        }
        
        /* Mobile Responsive */
        @media only screen and (max-width: 600px) {
          .container {
            padding: 0 10px;
          }
          
          .email-header {
            padding: 24px 16px;
          }
          
          .email-body {
            padding: 24px 16px;
          }
          
          .brand-title {
            font-size: 24px;
          }
          
          .greeting {
            font-size: 20px;
          }
          
          .paragraph {
            font-size: 15px;
          }
          
          .logo {
            max-width: 60px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="email-header">
            <img src="https://res.cloudinary.com/dn8vyfgnl/image/upload/v1750008049/Logo_gnwstm.png" alt="Ganzaa Logo" class="logo">
            <h1 class="brand-title">Password Updated</h1>
            <p class="brand-tagline">Smart Learning • Bright Future</p>
          </div>
          
          <div class="email-body">
            <h2 class="greeting">Hello ${FullName}! <span class="emoji">✅</span></h2>
            
            <div class="success-box">
              <p class="success-text">
                <span class="emoji">🎉</span>
                <strong>Your password has been successfully updated!</strong>
              </p>
            </div>
            
            <p class="paragraph">
              Great news! Your <span class="highlight">Ganzaa</span> account password has been changed successfully. Your account is now secured with your new password.
            </p>
            
            <p class="paragraph">
              You can now log in to your account using your new password and continue your learning journey with us.
            </p>
            
            <div class="security-tips">
              <div class="tips-title">
                <span class="emoji">🛡️</span>
                <strong>Security Tips for Your Account:</strong>
              </div>
              <ul class="tips-list">
                <li>Keep your password private and don't share it with anyone</li>
                <li>Use a unique password that you don't use for other accounts</li>
                <li>Consider using a password manager for added security</li>
                <li>Log out of shared or public devices after use</li>
              </ul>
            </div>
            
            <div class="divider"></div>
            
            <div class="warning-box">
              <p class="warning-text">
                <span style="display: flex; align-items: center; gap: 8px;">
                  <span class="emoji">⚠️</span>
                  <strong>Didn't make this change?</strong>
                </span>
                <span>If you didn't update your password, please contact our support team immediately at <a href="mailto:help@ganzaa.org" style="color: #856404; text-decoration: none; font-weight: 600;">help@ganzaa.org</a> to secure your account.</span>
              </p>
            </div>
            
            <p class="paragraph">
              Thank you for keeping your account secure! If you have any questions or need assistance, our support team is always here to help.
            </p>
            
            <p class="paragraph" style="margin-bottom: 0;">
              <strong>Best regards,</strong><br>
              The Ganzaa Team <span class="emoji">🌟</span>
            </p>
          </div>
          
          <div class="email-footer">
            <p class="footer-brand">© 2025 Ganzaa.org - All rights reserved</p>
            
            <div class="social-links">
              <a href="#" aria-label="Follow us on Twitter">Twitter</a>
              <a href="#" aria-label="Like us on Facebook">Facebook</a>
              <a href="#" aria-label="Follow us on Instagram">Instagram</a>
            </div>
            
            <p class="footer-disclaimer">
              This email was sent to confirm your password update.<br>
              If you did not make this change, please contact help@ganzaa.org immediately.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};