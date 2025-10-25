interface VerifyUserTemplateProps {
  FullName: string;
  Token: string;
}

export const verifyUserTemplate = ({
  FullName,
  Token,
}: VerifyUserTemplateProps): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Ganzaa Account</title>
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
          max-width: 800px;
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
          padding: 24px;
          text-align: center;
          background: linear-gradient(135deg, #d7954f 0%, #a1622c 100%);
          color: white;
        }
        
        .logo {
          max-width: 80px;
          height: auto;
        }
        
        .brand-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 4px;
          margin-top: 4px;
        }
        
        .brand-tagline {
          font-size: 14px;
          font-weight: 300;
          opacity: 0.9;
        }
        
        .email-body {
          padding: 24px;
          background: #fcfaf8;
        }
        
        .greeting {
          font-size: 20px;
          font-weight: 500;
          color: #7b481e;
          margin-bottom: 16px;
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
        
        .copy-button {
          background: var(--primary-600);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s ease;
        }
        
        .copy-button:hover {
          background: var(--primary-700);
        }
        
        .copy-icon {
          width: 16px;
          height: 16px;
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
          display: flex !important;
          align-items: flex-start;
          margin-bottom: 10px;
          gap: 12px !important;
        }
        
        .step-number {
          color: #7b481e !important;
          text-align: center !important;
          padding: 2px !important;
          font-size: 14px;
          font-weight: 700;
        }
        
        .step-text {
          font-size: 15px;
          color: #7b481e;
          margin-left: 6px !important;
          line-height: 1.5;
        }
        
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, var(--primary-400), transparent);
          margin: 24px 0;
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
            <h1 class="brand-title">Account Verification</h1>
            <p class="brand-tagline">Smart Learning • Bright Future</p>
          </div>
          
          <div class="email-body">
            <h2 class="greeting">Hello ${FullName}! <span class="emoji">👋</span></h2>
            
            <p class="paragraph">
              Thank you for registering with <span class="highlight">Ganzaa</span>! We're excited to have you join our educational platform where learning is fun, engaging, and effective.
            </p>
            
            <div class="verification-section">
              <div class="verification-code" id="verificationCode">${Token}</div>
            </div>
            
            <div class="steps-section">
              <h3 class="steps-title">How to verify your account:</h3>
              
              <div class="step">
                <div class="step-number">1</div>
                <div class="step-text">Go to the <span class="highlight">Ganzaa login page</span></div>
              </div>
              
              <div class="step">
                <div class="step-number">2</div>
                <div class="step-text">Look for the "Verify Account" section</div>
              </div>
              
              <div class="step">
                <div class="step-number">3</div>
                <div class="step-text">Enter the verification code shown above</div>
              </div>
              
              <div class="step">
                <div class="step-number">4</div>
                <div class="step-text">Click "Verify" to complete your registration</div>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <p class="paragraph">
              ⏰ This verification code expires in <strong>24 hours</strong>. If you did not create an account with Ganzaa, please disregard this email.
            </p>
            
            <p class="paragraph">
              At Ganzaa, we're committed to providing a safe, engaging, and educational environment for everyone in our community. Need help? Contact our support team anytime.
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
              This email was sent to verify your account registration.<br>
              If you did not request this, please ignore this email.
            </p>
          </div>
        </div>
      </div>
      
      <script>
        function copyToClipboard(text) {
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
              const button = document.querySelector('.copy-button');
              const originalText = button.innerHTML;
              button.innerHTML = '<svg class="copy-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Copied!';
              button.style.background = '#27ae60';
              setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
              }, 2000);
            });
          } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            const button = document.querySelector('.copy-button');
            const originalText = button.innerHTML;
            button.innerHTML = '<svg class="copy-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Copied!';
            button.style.background = '#27ae60';
            setTimeout(() => {
              button.innerHTML = originalText;
              button.style.background = '';
            }, 2000);
          }
        }
      </script>
    </body>
    </html>
  `;
};
