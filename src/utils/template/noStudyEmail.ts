/**
 * Generates a formatted HTML email for days when student had no study activity
 * @param {Object} student - The student information
 * @param {string} student.studentName - Name of the student
 * @return {string} Formatted HTML email
 */
export function generateNoStudyReportHTML(student: { studentName: string }) {
  // Format the current date
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Daily Student Activity Notice</title>
      <style>
          body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
          }
          .header {
              text-align: center;
              margin-bottom: 20px;
          }
          .logo {
              max-width: 150px;
              margin-bottom: 15px;
          }
          .notice-card {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 25px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              border-top: 5px solid #f2994a;
          }
          .student-name {
              color: #4a86e8;
              font-size: 22px;
              margin-top: 0;
              margin-bottom: 15px;
          }
          .report-date {
              color: #777777;
              font-size: 14px;
              margin-bottom: 20px;
          }
          .notice-icon {
              text-align: center;
              margin: 15px 0;
              font-size: 48px;
          }
          .notice-message {
              text-align: center;
              font-size: 18px;
              color: #f2994a;
              font-weight: bold;
              margin-bottom: 20px;
          }
          .notice-details {
              background-color: #fff9f5;
              border-radius: 6px;
              padding: 15px;
              margin-bottom: 20px;
          }
          .footer {
              margin-top: 25px;
              text-align: center;
              font-size: 14px;
              color: #777777;
          }
          .cta-button {
              display: inline-block;
              background-color: #4a86e8;
              color: white;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 4px;
              font-weight: bold;
              margin-top: 15px;
          }
          .support-options {
              display: flex;
              justify-content: space-around;
              flex-wrap: wrap;
              margin-top: 25px;
          }
          .support-option {
              width: 45%;
              background-color: #f5f8ff;
              border-radius: 6px;
              padding: 15px;
              margin-bottom: 15px;
              text-align: center;
          }
          .support-option h3 {
              color: #4a86e8;
              margin-top: 0;
          }
          @media only screen and (max-width: 480px) {
              body {
                  padding: 10px;
              }
              .notice-card {
                  padding: 15px;
              }
              .support-option {
                  width: 100%;
              }
          }
      </style>
  </head>
  <body>
      <div class="header">
          <img src="https://via.placeholder.com/150x80?text=School+Logo" alt="School Logo" class="logo">
          <h1>Daily Activity Notice</h1>
      </div>
      
      <div class="notice-card">
          <h2 class="student-name">${student.studentName}'s Daily Notice</h2>
          <div class="report-date">${currentDate}</div>
          
          <div class="notice-icon">📚</div>
          <div class="notice-message">No Study Activity Today</div>
          
          <div class="notice-details">
              <p>We noticed that ${student.studentName} did not complete any learning activities today. Regular practice is essential for academic progress.</p>
              <p>If your child was unable to access the platform due to technical issues or had other commitments today, please disregard this notice.</p>
          </div>
          
          <p>Consistent daily practice helps reinforce learning concepts and build strong study habits. We recommend setting aside at least 20-30 minutes each day for learning activities.</p>
          
          <div class="support-options">
              <div class="support-option">
                  <h3>Schedule</h3>
                  <p>Create a regular study schedule to help establish a routine</p>
              </div>
              <div class="support-option">
                  <h3>Support</h3>
                  <p>Reach out to our team if your child needs additional help</p>
              </div>
          </div>
          
          <div style="text-align: center;">
              <a href="#" class="cta-button">Access Learning Platform</a>
          </div>
      </div>
      
      <div class="footer">
          <p>This is an automated notice generated on ${currentDate}.</p>
          <p>© 2025 School Name. All rights reserved.</p>
          <p><small>If you have any questions, please contact us at <a href="mailto:support@school.edu">support@school.edu</a></small></p>
      </div>
  </body>
  </html>
    `;
}
