
interface CourseData {
  courseName: string;
  courseSubject: string;
  missedQuestions: string[]; // Ensuring this is defined as string[]
  averageScore: number;
  startedOn: string;
  completedOn: string;
  timeSpent: string;
  studentRank: number;
}

interface CourseData {
  courseName: string;
  courseSubject: string;
  missedQuestions: string[];
  averageScore: number;
  startedOn: string; // ISO date string
  completedOn: string; // ISO date string
  timeSpent: string; // Format: HH:MM:SS
  studentRank: number;
}

interface StudentReport {
  studentName: string;
  parentEmail: string;
  parentName: string;
  coursesStudied: CourseData[];
}

export function generateReportHTML(report: StudentReport) {
  // Format the current date
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Africa/Kigali",
  });

  // Calculate overall stats
  const totalCourses = report.coursesStudied?.length || 0;
  let totalTime = 0;
  let highestScore = 0;
  let totalScore = 0;

  // Process courses
  const courseBoxes = report.coursesStudied
    ? report.coursesStudied
        .map((course: CourseData) => {
          // Track stats
          totalTime += convertTimeToMinutes(course.timeSpent);
          totalScore += course.averageScore;
          if (course.averageScore > highestScore)
            highestScore = course.averageScore;

          // Format course date
          const startDate = new Date(course.startedOn);
          const formattedDate = `${startDate.getDate()} ${getMonthName(
            startDate.getMonth()
          )}, ${startDate.getFullYear()}`;

          // Format missed questions with proper styling
          // Check if missedQuestions is an array and has items
          const missedQuestionsHTML =
            Array.isArray(course.missedQuestions) &&
            course.missedQuestions.length > 0
              ? `
        <div class="missed-questions">
          <h4>Missed Questions:</h4>
          <ul>
            ${course.missedQuestions
              .map((q: string) => `<li>${q}</li>`)
              .join("")}
          </ul>
        </div>
      `
              : `<div class="perfect-score">✨ Perfect Score! No missed questions.</div>`;

          // Determine rank badge
          const rankBadge = getRankBadge(course.studentRank);

          return `
      <div class="course-box">
        <div class="course-header">
          <div class="course-subject-badge subject-${course.courseSubject.toLowerCase()}">
            ${course.courseSubject}
          </div>
          <div class="rank-badge rank-${course.studentRank}">
            ${rankBadge}
          </div>
        </div>
        <h3 class="course-name">${course.courseName}</h3>
        <div class="course-details">
          <div class="course-stat">
            <span class="stat-icon">📊</span>
              <span class="stat-value">${course.averageScore.toFixed(1)}%</span>

          </div>
          <div class="course-stat">
            <span class="stat-icon">⏱️</span>
              <span class="stat-value">${formatTimeDisplay(
                course.timeSpent
              )}</span>
          </div>
          <div class="course-stat">
            <span class="stat-icon">📅</span>
              <span class="stat-value">${formattedDate}</span>
          </div>
        </div>
        ${missedQuestionsHTML}
      </div>
    `;
        })
        .join("")
    : "";

  // Calculate daily average score
  const dailyAverageScore =
    totalCourses > 0 ? (totalScore / totalCourses).toFixed(1) : 0;

  // Format total time spent
  const hours = Math.floor(totalTime / 60);
  const minutes = totalTime % 60;
  const totalTimeFormatted = `${hours}h:${minutes
    .toString()
    .padStart(2, "0")}min`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Progress Report</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: "Roboto", sans-serif;
    }
    
    body {
      background-color: #f0f9e8;
      padding: 20px;
      font-size: 16px;
      line-height: 1.6;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: linear-gradient(to bottom, #ffffff, #f4fff0);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 100, 0, 0.15);
      width: 100%;
    }
    
    .header {
      background: linear-gradient(135deg, #4caf50, #8bc34a);
      padding: 25px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='rgba(255,255,255,.1)' fill-rule='evenodd'/%3E%3C/svg%3E");
      opacity: 0.5;
      z-index: 0;
    }
    
    .header img {
      max-width: 180px;
      margin-bottom: 15px;
      position: relative;
      z-index: 1;
    }

    .flex.flex-col {
      display: flex;
      flex-direction: column;
    }
    
    .header h1 {
      color: white;
      font-size: 2rem;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      margin: 0;
      word-wrap: break-word;
      position: relative;
      z-index: 1;
    }
    
    .content {
      padding: 30px;
    }
    
    .greeting {
      font-size: 1.5rem;
      color: #2e7d32;
      margin-bottom: 15px;
      font-weight: bold;
    }
    
    .intro {
      color: #444;
      margin-bottom: 20px;
      font-size: 1.125rem;
      line-height: 1.5;
    }
    
    .highlight {
      font-weight: bold;
      color: #43a047;
    }
    
    .summary-section {
      background: linear-gradient(to right, #e8f5e9, #c8e6c9);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 25px;
      border-left: 6px solid #43a047;
    }
    
    .section-title {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }
    
    .section-icon {
      font-size: 1.75rem;
      margin-right: 10px;
    }
    
    .section-heading {
      font-size: 1.375rem;
      color: #2e7d32;
      font-weight: bold;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
    }
    
    .stat-number {
      font-size: 1.75rem;
      font-weight: bold;
      color: #43a047;
      margin-bottom: 5px;
    }
    
    .stat-label {
      color: #555;
      font-size: 0.9rem;
    }
    
    /* Course boxes */
    .courses-section {
      margin-bottom: 25px;
    }
    
    .courses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    
   /* Course Box Container */
.course-box {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-bottom: 20px;
}

.course-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* Course Header */
.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #4caf50, #8bc34a);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.course-subject-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.1);
}

.subject-mathematics {
  background: #2196f3;
}

.subject-english {
  background: #9c27b0;
}

.subject-sciences {
  background: #ff9800;
}

.rank-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.875rem;
  color: #333;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.rank-1 {
  background: #ffd700;
}

.rank-2 {
  background: #c0c0c0;
}

.rank-3 {
  background: #cd7f32;
}

/* Course Name */
.course-name {
  padding: 16px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  border-bottom: 1px solid #eee;
}

/* Course Details */
.course-details {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  gap: 12px;
}

.course-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  margin: 0 8px;
}

.stat-icon {
  font-size: 1.5rem;
  color: #4caf50;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: #777;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 4px;
}

/* Missed Questions */
.missed-questions {
  padding: 16px;
  background: #f9f9f9;
  border-top: 1px solid #eee;
}

.missed-questions h4 {
  font-size: 0.875rem;
  color: #d32f2f;
  margin-bottom: 8px;
}

.missed-questions ul {
  padding-left: 20px;
  font-size: 0.875rem;
  color: #555;
}

.missed-questions li {
  margin-bottom: 4px;
}

.perfect-score {
  padding: 16px;
  color: #43a047;
  font-weight: 600;
  font-size: 0.875rem;
  text-align: center;
  background: #f9f9f9;
  border-top: 1px solid #eee;
}

/* Responsive Design */
@media (max-width: 600px) {
  .course-details {
    flex-direction: column;
    gap: 16px;
  }
} 
    .subject-mathematics {
      background: #2196F3;
    }
    
    .subject-english {
      background: #9C27B0;
    }
    
    .subject-sciences {
      background: #FF9800;
    }
    
    .rank-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      font-weight: bold;
      font-size: 0.9rem;
      color: white;
    }
    
    .rank-1 {
      background: #FFD700;
      color: #333;
    }
    
    .rank-2 {
      background: #C0C0C0;
      color: #333;
    }
    
    .rank-3 {
      background: #CD7F32;
    }
    
    .course-name {
      padding: 15px 15px 5px;
      font-size: 1.1rem;
      color: #333;
      font-weight: bold;
    }
    
    .course-details {
      display: flex;
      padding: 10px 15px;
      justify-content: space-between;
      width: 100%;
      align-items: center;
      gap: 10px;
    }
  
    .stat-icon {
      font-size: 1.2rem;
      margin-bottom: 3px;
  }
    
    .stat-label {
      font-size: 0.7rem;
      color: #777;
    }
    
    .missed-questions {
      padding: 10px 15px 15px;
      background: #f9f9f9;
      border-top: 1px solid #eee;
    }
    
    .missed-questions h4 {
      font-size: 0.9rem;
      color: #d32f2f;
      margin-bottom: 8px;
    }
    
    .missed-questions ul {
      padding-left: 20px;
      font-size: 0.85rem;
      color: #555;
    }
    
    .missed-questions li {
      margin-bottom: 5px;
    }
    
    .perfect-score {
      padding: 10px 15px 15px;
      color: #43a047;
      font-weight: bold;
      font-size: 0.9rem;
      text-align: center;
      background: #f9f9f9;
      border-top: 1px solid #eee;
    }
    
    .footer {
      background: linear-gradient(135deg, #4caf50, #8bc34a);
      padding: 20px;
      text-align: center;
      color: white;
      font-size: 1rem;
      position: relative;
      overflow: hidden;
    }
    
    .footer::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='rgba(255,255,255,.1)' fill-rule='evenodd'/%3E%3C/svg%3E");
      opacity: 0.5;
      z-index: 0;
    }
    
    .footer p {
      margin-bottom: 8px;
      position: relative;
      z-index: 1;
    }
    
    .footer a {
      color: #ffeb3b;
      text-decoration: none;
      font-weight: bold;
    }
    
    .footer a:hover {
      text-decoration: underline;
    }

    /* Enhanced Responsive Design */
    @media (max-width: 600px) {
      body {
        padding: 10px;
        font-size: 14px;
      }
      
      .container {
        border-radius: 8px;
      }
      
      .header {
        padding: 15px;
      }
      
      .header h1 {
        font-size: 1.5rem;
      }
      
      .content {
        padding: 15px;
      }
      
      .greeting {
        font-size: 1.25rem;
      }
      
      .intro {
        font-size: 1rem;
      }
      
      .summary-section {
        padding: 15px;
        margin-bottom: 20px;
      }
      
      .section-heading {
        font-size: 1.125rem;
      }
      
      .courses-grid {
        grid-template-columns: 1fr;
      }
      
      .footer {
        padding: 15px;
        font-size: 0.875rem;
      }
    }
    
    /* Additional breakpoint for very small screens */
    @media (max-width: 320px) {
      body {
        padding: 5px;
      }
      
      .header h1 {
        font-size: 1.25rem;
      }
      
      .content {
        padding: 10px;
      }
      
      .greeting {
        font-size: 1.125rem;
      }
      
      .summary-section {
        padding: 12px;
      }
      
      .section-icon {
        font-size: 1.5rem;
      }
      
      .section-heading {
        font-size: 1rem;
      }
      
      .stat-card {
        padding: 10px;
      }
      
      .stat-number {
        font-size: 1.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>✨ Daily Progress Report ✨</h1>
      <h2 style="color: white; margin-top: 10px; font-size: 1.2rem; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">${currentDate}</h2>
    </div>
    
    <!-- Content -->
    <div class="content">
      <h2 class="greeting">Hello ${report.parentName || "Parent"}! 👋</h2>
      <p class="intro">Here's a fun summary of <span class="highlight">${
        report.studentName || "your child"
      }</span>'s learning journey today:</p>
      
      <!-- Progress Summary -->
      <div class="summary-section">
        <div class="section-title">
          <span class="section-icon">📊</span>
          <h3 class="section-heading">Learning Highlights</h3>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${totalCourses}</div>
            <div class="stat-label">Courses Completed</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${highestScore.toFixed(1)}%</div>
            <div class="stat-label">Highest Score</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${dailyAverageScore}%</div>
            <div class="stat-label">Daily Average</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${totalTimeFormatted}</div>
            <div class="stat-label">Total Learning Time</div>
          </div>
        </div>
      </div>
      
      <!-- Courses Section -->
      <div class="courses-section">
        <div class="section-title">
          <span class="section-icon">📚</span>
          <h3 class="section-heading">Courses Studied Today</h3>
        </div>
        
        <div class="courses-grid">
          ${courseBoxes}
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p>Need help? Contact us at <a href="mailto:elerning.ai@gmail.com">Ganzaa</a></p>
      <p>&copy; 2025 Ganzaa. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Helper functions
function convertTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return "0min";
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  if (hours > 0) {
    return `${hours}h:${minutes.toString().padStart(2, "0")}min`;
  } else {
    return `${minutes}min:${seconds}sec`;
  }
}

function getMonthName(monthIndex: number): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months[monthIndex] || "";
}

function getRankBadge(rank: number): string {
  switch (rank) {
    case 1:
      return "🥇1";
    case 2:
      return "🥈2";
    case 3:
      return "🥉3";
    default:
      return rank.toString();
  }
}
