interface EmailTemplateProps {
  ParentName?: string;
  StudentName: string;
  VerificationCode: string;
}

export const emailVerificationTemplate = ({
  ParentName = "Parent",
  StudentName,
  VerificationCode,
}: EmailTemplateProps): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Ganzaa - Verification Required</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Fredoka:wght@400;500;600&display=swap');
        
        :root {
          --background: #fef9e0;
          --foreground: #3d2a1a;
          --primary-50: #fffdf6;
          --primary-100: #fef9e0;
          --primary-200: #f9e6c5;
          --primary-300: #eac49e;
          --primary-400: #c88f66;
          --primary-500: #a9653d;
          --primary-600: #864620;
          --primary-700: #642300;
          --primary-800: #4a1a00;
          --primary-900: #2f0e00;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: var(--foreground);
          background: linear-gradient(135deg, var(--primary-100) 0%, var(--primary-200) 100%);
          margin: 0;
          padding: 20px 0;
        }
        
        .container {
          max-width: 650px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .email-wrapper {
          background: var(--primary-50);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 
            0 20px 40px rgba(100, 35, 0, 0.15),
            0 8px 16px rgba(100, 35, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 3px solid var(--primary-300);
          position: relative;
        }
        
        .email-wrapper::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, 
            #ff6b6b 0%, 
            #feca57 25%, 
            #48dbfb 50%, 
            #ff9ff3 75%, 
            #54a0ff 100%);
        }
        
        .email-header {
          padding: 40px 30px 30px;
          text-align: center;
          background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 50%, var(--primary-800) 100%);
          color: white;
          position: relative;
          overflow: hidden;
        }
        
        .email-header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
          animation: float 20s linear infinite;
        }
        
        @keyframes float {
          0% { transform: translateX(-60px) translateY(-60px); }
          100% { transform: translateX(0) translateY(0); }
        }
        
        .logo-container {
          position: relative;
          z-index: 2;
          margin-bottom: 20px;
        }
        
        .logo {
          max-width: 180px;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          border: 3px solid rgba(255, 255, 255, 0.2);
        }
        
        .brand-title {
          font-family: 'Fredoka', 'Roboto', sans-serif;
          font-size: 42px;
          font-weight: 600;
          margin: 15px 0 8px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          position: relative;
          z-index: 2;
        }
        
        .brand-tagline {
          font-size: 18px;
          font-weight: 300;
          opacity: 0.95;
          position: relative;
          z-index: 2;
        }
        
        .email-body {
          padding: 40px 30px;
          background: var(--primary-50);
          position: relative;
        }
        
        .greeting {
          font-family: 'Fredoka', 'Roboto', sans-serif;
          font-size: 32px;
          font-weight: 500;
          color: var(--primary-700);
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .wave-emoji {
          font-size: 36px;
          animation: wave 2s ease-in-out infinite;
        }
        
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-10deg); }
        }
        
        .paragraph {
          font-size: 18px;
          line-height: 1.7;
          margin-bottom: 24px;
          color: var(--primary-800);
        }
        
        .student-highlight {
          background: linear-gradient(120deg, var(--primary-300) 0%, var(--primary-400) 100%);
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 500;
          color: var(--primary-900);
        }
        
        .verification-section {
          background: linear-gradient(135deg, var(--primary-100) 0%, var(--primary-200) 100%);
          border-radius: 20px;
          padding: 30px;
          margin: 30px 0;
          text-align: center;
          border: 2px solid var(--primary-300);
          position: relative;
          overflow: hidden;
        }
        
        .verification-section::before {
          content: '🎉';
          position: absolute;
          top: 15px;
          right: 20px;
          font-size: 24px;
          opacity: 0.6;
        }
        
        .verification-title {
          font-family: 'Fredoka', 'Roboto', sans-serif;
          font-size: 24px;
          font-weight: 500;
          color: var(--primary-700);
          margin-bottom: 20px;
        }
        
        .code-container {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin: 20px 0;
          border: 3px dashed var(--primary-500);
          box-shadow: 0 4px 12px rgba(169, 101, 61, 0.15);
          position: relative;
        }
        
        .verification-code {
          font-family: 'Roboto Mono', 'Courier New', monospace;
          font-size: 36px;
          font-weight: 700;
          letter-spacing: 8px;
          color: var(--primary-700);
          margin-bottom: 16px;
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
          transition: all 0.2s ease;
        }
        
        .copy-button:hover {
          background: var(--primary-700);
          transform: translateY(-1px);
        }
        
        .copy-button:active {
          transform: translateY(0);
        }
        
        .copy-icon {
          width: 16px;
          height: 16px;
        }
        
        .important-notice {
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          border: 2px solid #f39c12;
          border-radius: 16px;
          padding: 20px;
          margin: 25px 0;
          position: relative;
        }
        
        .important-notice::before {
          content: '🔐';
          position: absolute;
          top: -10px;
          left: 20px;
          background: #f39c12;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        
        .notice-title {
          font-weight: 700;
          color: #e67e22;
          margin-bottom: 8px;
          margin-top: 8px;
        }
        
        .notice-text {
          color: #8b4513;
          font-size: 16px;
          line-height: 1.6;
          margin: 0;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 30px 0;
        }
        
        .feature-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          border: 2px solid var(--primary-300);
          transition: transform 0.2s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-2px);
        }
        
        .feature-emoji {
          font-size: 32px;
          margin-bottom: 8px;
          display: block;
        }
        
        .feature-title {
          font-weight: 600;
          color: var(--primary-700);
          font-size: 16px;
        }
        
        .cta-section {
          text-align: center;
          margin: 35px 0;
        }
        
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
          color: white;
          text-decoration: none;
          font-weight: 600;
          font-size: 18px;
          padding: 16px 32px;
          border-radius: 50px;
          border: 3px solid var(--primary-500);
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(169, 101, 61, 0.3);
        }
        
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(169, 101, 61, 0.4);
          background: linear-gradient(135deg, var(--primary-700) 0%, var(--primary-800) 100%);
        }
        
        .email-footer {
          background: var(--primary-200);
          padding: 30px;
          text-align: center;
          color: var(--primary-800);
          font-size: 14px;
        }
        
        .footer-brand {
          font-weight: 600;
          margin-bottom: 15px;
        }
        
        .social-links {
          margin: 20px 0;
        }
        
        .social-links a {
          display: inline-block;
          margin: 0 12px;
          color: var(--primary-700);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        
        .social-links a:hover {
          color: var(--primary-900);
        }
        
        .footer-disclaimer {
          margin-top: 20px;
          font-size: 12px;
          opacity: 0.8;
          line-height: 1.5;
        }
        
        /* Mobile Responsive */
        @media only screen and (max-width: 600px) {
          .container {
            padding: 0 10px;
          }
          
          .email-header {
            padding: 30px 20px 25px;
          }
          
          .email-body {
            padding: 30px 20px;
          }
          
          .brand-title {
            font-size: 32px;
          }
          
          .greeting {
            font-size: 28px;
          }
          
          .paragraph {
            font-size: 16px;
          }
          
          .verification-code {
            font-size: 28px;
            letter-spacing: 4px;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .cta-button {
            font-size: 16px;
            padding: 14px 28px;
          }
          
          .logo {
            max-width: 140px;
          }
        }
        
        /* Dark mode compatibility */
        @media (prefers-color-scheme: dark) {
          .code-container {
            background: var(--primary-100);
          }
          
          .feature-card {
            background: var(--primary-100);
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="email-header">
            <div class="logo-container">
              <img src="https://res.cloudinary.com/dn8vyfgnl/image/upload/v1750008049/Logo_gnwstm.png" alt="Ganzaa Logo" class="logo">
            </div>
            <h1 class="brand-title">Welcome to Ganzaa!</h1>
            <p class="brand-tagline">Smart Learning • Bright Futures • African Excellence</p>
          </div>
          
          <div class="email-body">
            <h2 class="greeting">
              Hello ${ParentName}!
              <span class="wave-emoji">👋</span>
            </h2>
            
            <p class="paragraph">
              Exciting news! <span class="student-highlight">${StudentName}</span> is joining the <strong>Ganzaa</strong> learning adventure! 🎉 Our interactive platform celebrates African culture while making learning fun, engaging, and effective.
            </p>
            
            <div class="verification-section">
              <h3 class="verification-title">📧 Email Verification Required</h3>
              <p class="paragraph" style="margin-bottom: 20px;">Please verify your email by entering this code:</p>
              
              <div class="code-container">
                <div class="verification-code" id="verificationCode">${VerificationCode}</div>
                <button class="copy-button" onclick="copyToClipboard('${VerificationCode}')">
                  <svg class="copy-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                  </svg>
                  Copy Code
                </button>
              </div>
            </div>
            
            <div class="important-notice">
              <p class="notice-title">🔒 IMPORTANT - Keep This Safe!</p>
              <p class="notice-text">
                This code will also serve as <strong>${StudentName}'s secret login code</strong> for future access. Please store it safely and help ${StudentName} remember it for easy logins.
              </p>
            </div>
            
            <p class="paragraph">
              ⏰ This verification code expires in <strong>24 hours</strong>. Please enter it on the verification page to activate ${StudentName}'s account and start the learning journey!
            </p>
            
            <div class="features-grid">
              <div class="feature-card">
                <span class="feature-emoji">🌍</span>
                <p class="feature-title">African Culture</p>
              </div>
              <div class="feature-card">
                <span class="feature-emoji">🎮</span>
                <p class="feature-title">Interactive Games</p>
              </div>
              <div class="feature-card">
                <span class="feature-emoji">🏆</span>
                <p class="feature-title">Achievement System</p>
              </div>
            </div>
            
            <p class="paragraph">
              At Ganzaa, we're committed to providing a safe, engaging, and culturally rich educational environment where African students can explore, learn, and grow while celebrating their heritage! 🌟
            </p>
            
            <div class="cta-section">
              <a href="#" class="cta-button">🚀 Explore Ganzaa Now</a>
            </div>
            
            <p class="paragraph">
              Need help? Our friendly support team is here for you! Simply reply to this email or contact us anytime.
            </p>
            
            <p class="paragraph" style="margin-bottom: 0;">
              <strong>Happy learning!</strong><br>
              The Ganzaa Team 📚✨
            </p>
          </div>
          
          <div class="email-footer">
            <p class="footer-brand">© 2025 Ganzaa.org - Empowering African Minds</p>
            
            <div class="social-links">
              <a href="#" aria-label="Follow us on Twitter">Twitter</a>
              <a href="#" aria-label="Like us on Facebook">Facebook</a>
              <a href="#" aria-label="Follow us on Instagram">Instagram</a>
              <a href="#" aria-label="Connect on LinkedIn">LinkedIn</a>
            </div>
            
            <p class="footer-disclaimer">
              This email was sent to verify a student account registration.<br>
              If you did not request this, please ignore this email.<br>
              <strong>Ganzaa.org</strong> - Celebrating African Excellence in Education
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