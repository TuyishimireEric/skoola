import { sendContactFormEmailWithRetry } from "@/utils/jobs/events";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json();
    const { name, email, subject, message, userType } = formData;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        {
          message: "Please fill in all required fields",
          success: false,
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          message: "Please enter a valid email address",
          success: false,
        },
        { status: 400 }
      );
    }
    
    // Send email to contact@ganzaa.org
    const emailResult = await sendContactFormEmailWithRetry({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      userType,
    });

    if (emailResult.success) {
      return NextResponse.json(
        {
          message: "Thank you for contacting us! We'll get back to you soon.",
          success: true,
        },
        { status: 200 }
      );
    } else {
      console.error("Contact form email failed:", emailResult.error);

      return NextResponse.json(
        {
          message:
            "We're having trouble sending your message right now. Please try again or contact us directly.",
          success: false,
          error: emailResult.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const Error = error as Error;
    console.error("Contact form route error:", Error);

    return NextResponse.json(
      {
        message: "An unexpected error occurred. Please try again later.",
        success: false,
        error: Error.message,
      },
      { status: 500 }
    );
  }
}
