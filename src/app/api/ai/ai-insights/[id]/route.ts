// @/app/api/students/[id]/ai-insights/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getStudentDetail } from "@/server/queries/student-details";
import { getUserToken } from "@/utils/getToken";


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId, organizationId } = await getUserToken(req);

        if (!userId || !organizationId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id: studentId } = await params;

        // Fetch student details
        const student = await getStudentDetail(studentId, organizationId);

        if (!student) {
            return NextResponse.json(
                { error: "Student not found" },
                { status: 404 }
            );
        }

        // Prepare student data for AI analysis
        const studentContext = {
            name: student.fullName,
            grade: student.grade,
            age: student.age,
            stats: {
                attendanceRate: student.stats.attendanceRate,
                performanceScore: student.stats.performanceScore,
                totalStars: student.stats.totalStars,
                totalCourses: student.stats.totalCourses,
                currentStreak: student.stats.currentStreak,
                behaviorScore: student.stats.behaviorScore,
                dropoutRisk: student.stats.dropoutRisk,
            },
            courses: student.courses.map((c) => ({
                title: c.title,
                subject: c.subject,
                performance: c.performance
                    ? {
                        assignment1: c.performance.assignment1,
                        assignment2: c.performance.assignment2,
                        cat: c.performance.cat,
                        exam: c.performance.exam,
                        total: c.performance.total,
                        grade: c.performance.grade,
                        remarks: c.performance.remarks,
                    }
                    : null,
            })),
            attendanceHistory: student.attendanceHistory.slice(0, 10), // Last 10 days
        };

        // Create the prompt for OpenAI
        const prompt = `You are an educational AI assistant analyzing student performance data. Based on the following student information, generate 3-5 actionable insights and recommendations.

Student Profile:
- Name: ${studentContext.name}
- Grade: ${studentContext.grade}
- Age: ${studentContext.age}

Academic Statistics:
- Attendance Rate: ${studentContext.stats.attendanceRate}%
- Performance Score: ${studentContext.stats.performanceScore}%
- Total Stars Earned: ${studentContext.stats.totalStars}
- Enrolled Courses: ${studentContext.stats.totalCourses}
- Current Learning Streak: ${studentContext.stats.currentStreak} days
- Behavior Score: ${studentContext.stats.behaviorScore}%
- Dropout Risk: ${studentContext.stats.dropoutRisk}%

Course Performance:
${studentContext.courses
                .map((course) => {
                    if (!course.performance) {
                        return `- ${course.title} (${course.subject}): No performance data yet`;
                    }
                    return `- ${course.title} (${course.subject}): 
  Assignment 1: ${course.performance.assignment1 ?? "N/A"}%, 
  Assignment 2: ${course.performance.assignment2 ?? "N/A"}%, 
  CAT: ${course.performance.cat ?? "N/A"}%, 
  Exam: ${course.performance.exam ?? "N/A"}%, 
  Total: ${course.performance.total ?? "N/A"}%, 
  Grade: ${course.performance.grade ?? "N/A"}
  ${course.performance.remarks ? `Remarks: ${course.performance.remarks}` : ""}`;
                })
                .join("\n")}

Recent Attendance Pattern:
${studentContext.attendanceHistory
                .map((a) => `${a.date}: ${a.status}`)
                .join(", ")}

Instructions:
1. Analyze the student's overall academic performance and identify strengths and areas for improvement
2. Evaluate attendance patterns and their potential impact on learning
3. Identify courses where the student excels or struggles
4. Assess dropout risk factors based on the provided data
5. Generate specific, actionable recommendations for teachers and parents

Please provide your analysis in the following JSON format:
{
  "insights": [
    {
      "type": "positive" | "warning" | "critical" | "info",
      "title": "Brief title (max 50 characters)",
      "description": "Detailed description with actionable recommendations (max 200 characters)",
      "priority": "high" | "medium" | "low"
    }
  ],
  "summary": "A brief 2-3 sentence overall assessment of the student's academic status"
}

Focus on being constructive, specific, and actionable. Avoid generic statements.`;

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // or "gpt-4" for better results
            messages: [
                {
                    role: "system",
                    content:
                        "You are an experienced educational advisor with expertise in student assessment and intervention strategies. Provide data-driven, actionable insights.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 1500,
            response_format: { type: "json_object" },
        });

        const response = completion.choices[0].message.content;

        if (!response) {
            throw new Error("No response from OpenAI");
        }

        const aiInsights = JSON.parse(response);

        return NextResponse.json({
            success: true,
            data: aiInsights,
        });
    } catch (error) {
        console.error("Error generating AI insights:", error);
        return NextResponse.json(
            { error: "Failed to generate AI insights" },
            { status: 500 }
        );
    }
}