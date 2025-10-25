interface TeacherInvitationTemplateProps {
  FullName: string;
  OrganizationName: string;
  Token: string;
}

export const teacherInvitationTemplate = ({
  FullName,
  OrganizationName,
  Token,
}: TeacherInvitationTemplateProps): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Join ${OrganizationName} on Ganzaa - Teacher Invitation</title>
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
          font-size: 14px;
          line-height: 1.4;
          margin-bottom: 14px;
          color: #7b481e;
        }
        
        .highlight {
          color: #a1622c;
          font-weight: 500;
        }
        
        .info-box {
          background: #f5d1a15d;
          border: 1px solid #d7954f;
          padding: 16px;
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
        
        .invitation-section {
          background: rgba(245, 209, 161, 0.3);
          border: 2px solid var(--primary-500);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          margin: 24px 0;
          position: relative;
        }
        
        .organization-name {
          font-size: 20px;
          font-weight: 600;
          color: #7b481e;
          margin-bottom: 8px;
        }
        
        .join-button {
            background: linear-gradient(135deg, #a1622c 0%, #7b481e 100%);
            color: white !important;
            text-decoration: none !important;
            border: none;
            border-radius: 12px;
            padding: 18px 36px;
            font-size: 20px;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 12px;
            transition: all 0.3s ease;
            box-shadow: 0 6px 20px rgba(123, 72, 30, 0.4);
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .join-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(123, 72, 30, 0.5);
          background: linear-gradient(135deg, #7b481e 0%, #5a3215 100%);
        }
        
        .join-icon {
          width: 24px;
          height: 24px;
          filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
        }
        
        .invitation-note {
          font-size: 14px;
          color: #7b481e;
          margin-top: 8px;
        }
        
        .features-section {
          margin: 28px 0;
        }
        
        .features-title {
          font-size: 18px;
          font-weight: 600;
          color: #7b481e;
          margin-bottom: 16px;
          text-align: center;
        }
        
        .features-list {
          margin-bottom: 20px;
        }
        
        .feature-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 16px;
          gap: 16px;
          padding: 16px;
          background: rgba(245, 209, 161, 0.4);
          border-radius: 8px;
          border-left: 4px solid #d7954f;
        }
        
        .feature-content {
          flex: 1;
          font-size: 15px;
          line-height: 1.5;
          color: #7b481e;
        }
        
        .steps-section {
          margin: 28px 0;
        }
        
        .steps-title {
          font-size: 16px;
          font-weight: 600;
          color: #7b481e;
          margin-bottom: 12px;
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
          
          .join-button {
            font-size: 16px;
            padding: 14px 24px;
          }
          
          .logo {
            max-width: 60px;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .invitation-section {
            padding: 24px 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="email-header">
            <img src="https://res.cloudinary.com/dn8vyfgnl/image/upload/v1750008049/Logo_gnwstm.png" alt="Ganzaa Logo" class="logo">
            <h1 class="brand-title">Teacher Invitation</h1>
            <p class="brand-tagline">Smart Learning • Bright Future</p>
          </div>
          
          <div class="email-body">
            <h2 class="greeting">Hello ${FullName}! <span class="emoji">👋</span></h2>
            
            <p class="paragraph">
              <strong><span class="highlight">${OrganizationName}</span> has invited you to be an educator on Ganzaa</strong> - our innovative learning platform! Join your colleagues in revolutionizing education through engaging, interactive teaching experiences that inspire students and make learning fun.
            </p>
            
            
            <div class="invitation-section">
              <div class="organization-name">${OrganizationName}</div>
              <p style="margin-bottom: 20px; color: #7b481e;">Join your organization on Ganzaa and start creating amazing learning experiences!</p>
              
              <a href="${
                process.env.NEXTAUTH_URL || "https://ganzaa.org"
              }/teacher?token=${Token}" class="join-button">
                <svg class="join-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Click Here to Join
              </a>
              
              <p class="invitation-note">This invitation link is secure and personalized for you</p>
            </div>
            
            
            <div class="steps-section">
              <h3 class="steps-title">Getting started is easy:</h3>
              
              <div class="step">
                <div class="step-number">1</div>
                <div class="step-text">Click the <span class="highlight">"Click Here to Join"</span> button above</div>
              </div>
              
              <div class="step">
                <div class="step-number">2</div>
                <div class="step-text">Complete your teacher profile setup</div>
              </div>
              
              <div class="step">
                <div class="step-number">3</div>
                <div class="step-text">Explore the platform and start creating your first course</div>
              </div>
              
              <div class="step">
                <div class="step-number">4</div>
                <div class="step-text">Invite your students and begin your teaching journey</div>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <p class="paragraph">
              ⏰ This invitation is valid for <strong>7 days</strong>. If you have any questions or need assistance, our support team is here to help you every step of the way.
            </p>
            
            <p class="paragraph">
              Join thousands of educators who are already transforming education with Ganzaa. Together, we're building the future of learning!
            </p>
            
            <p class="paragraph" style="margin-bottom: 0;">
              <strong>Welcome to the team,</strong><br>
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
              This invitation was sent to you by ${OrganizationName}.<br>
              If you believe this was sent in error, please contact support.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
