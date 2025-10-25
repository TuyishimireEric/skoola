import { ContactFormData } from "@/types";

// Generate simple HTML email template for contact form
function generateContactEmailHTML(data: ContactFormData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Contact Form Submission</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 20px; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
        }
        .header { 
          margin-bottom: 20px; 
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
        }
        .field { 
          margin-bottom: 12px; 
        }
        .label { 
          font-weight: bold; 
          margin-bottom: 4px;
        }
        .value { 
          margin-left: 10px;
        }
        .message-content {
          white-space: pre-line;
          margin-left: 10px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 14px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Contact Form Submission</h2>
          <p>A new message has been received from the Ganzaa website contact form.</p>
        </div>
        
        <div class="content">
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${data.name}</div>
          </div>
          
          <div class="field">
            <div class="label">Email:</div>
            <div class="value">${data.email}</div>
          </div>
          
          <div class="field">
            <div class="label">User Type:</div>
            <div class="value">${data.userType}</div>
          </div>
          
          <div class="field">
            <div class="label">Subject:</div>
            <div class="value">${data.subject}</div>
          </div>
          
          <div class="field">
            <div class="label">Message:</div>
            <div class="message-content">${data.message}</div>
          </div>
        </div>
        
        <div class="footer">
          <p>This email was automatically generated from the Ganzaa contact form.</p>
          <p>To reply to this inquiry, please respond directly to: ${data.email}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default generateContactEmailHTML;
