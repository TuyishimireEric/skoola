import { sendEmail } from "./emails";
import { emailVerificationTemplate } from "../template/emailVerification";
import { verifyUserTemplate } from "../template/verifyUserTemplate";
import { teacherInvitationTemplate } from "../template/teacherInvitationTemplate";
import { ContactFormData } from "@/types";
import generateContactEmailHTML from "../template/contactMessageTemplate";
import { forgotPasswordTemplate } from "../template/forgotPasswordTemplate";
import { passwordUpdatedTemplate } from "../template/passwordUpdatedTemplate";

// Enhanced types with better validation
interface StudentVerificationData {
  ParentEmail: string;
  ParentName?: string;
  StudentName: string;
  VerificationCode: string;
}

interface UserVerificationData {
  Email: string;
  FullName: string;
  Token: string;
}

interface TeacherInvitationData {
  Email: string;
  FullName: string;
  OrganizationName: string;
  Token: string;
}

interface ForgotPasswordData {
  Email: string;
  FullName: string;
  Token: string;
}

interface PasswordUpdatedData {
  Email: string;
  FullName: string;
}

interface EmailResult {
  success: boolean;
  recipient?: string;
  error?: string;
  attempts?: number;
  timestamp?: Date;
}

interface EmailConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  timeout: number;
}

// Default configuration
const DEFAULT_EMAIL_CONFIG: EmailConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  timeout: 30000, // 30 seconds
};

// Email validation utility
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Enhanced error logging
function logEmailError(
  operation: string,
  error: unknown,
  recipient?: string
): void {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  console.error(`[${timestamp}] ❌ Email Error - ${operation}`, {
    recipient,
    error: errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
  });
}

// Enhanced success logging
function logEmailSuccess(
  operation: string,
  recipient: string,
  attempts?: number
): void {
  const timestamp = new Date().toISOString();
  const attemptsText = attempts && attempts > 1 ? ` (attempt ${attempts})` : "";
  console.log(`[${timestamp}] ✅ Email Success - ${operation}${attemptsText}`, {
    recipient,
  });
}

// Generic email sender with enhanced error handling
async function sendEmailSafely(
  recipient: string,
  subject: string,
  content: string,
  config: EmailConfig = DEFAULT_EMAIL_CONFIG
): Promise<EmailResult> {
  const startTime = Date.now();

  try {
    // Validate email format
    if (!isValidEmail(recipient)) {
      return {
        success: false,
        recipient,
        error: "Invalid email format",
        timestamp: new Date(),
      };
    }

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Email timeout")), config.timeout);
    });

    // Send email with timeout
    await Promise.race([
      sendEmail(recipient, subject, content),
      timeoutPromise,
    ]);

    const duration = Date.now() - startTime;
    console.log(`📧 Email sent successfully in ${duration}ms to ${recipient}`);

    return {
      success: true,
      recipient,
      timestamp: new Date(),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `📧 Email failed after ${duration}ms to ${recipient}:`,
      error
    );

    return {
      success: false,
      recipient,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    };
  }
}

// Enhanced retry mechanism with exponential backoff and jitter
async function sendEmailWithRetry<T>(
  emailFunction: (data: T, config?: EmailConfig) => Promise<EmailResult>,
  data: T,
  config: EmailConfig = DEFAULT_EMAIL_CONFIG
): Promise<EmailResult> {
  let lastResult: EmailResult;
  let totalDelay = 0;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    lastResult = await emailFunction(data, config);

    if (lastResult.success) {
      if (attempt > 1) {
        console.log(
          `✅ Email sent successfully on attempt ${attempt}/${config.maxRetries}`
        );
      }
      return {
        ...lastResult,
        attempts: attempt,
      };
    }

    // Don't retry on certain errors (validation errors, etc.)
    if (
      lastResult.error?.includes("Invalid email format") ||
      lastResult.error?.includes("Missing email")
    ) {
      console.log(
        `❌ Skipping retry due to validation error: ${lastResult.error}`
      );
      return {
        ...lastResult,
        attempts: attempt,
      };
    }

    if (attempt < config.maxRetries) {
      // Exponential backoff with jitter
      const baseDelay = Math.min(
        config.baseDelay * Math.pow(2, attempt - 1),
        config.maxDelay
      );
      const jitter = Math.random() * 0.1 * baseDelay; // 10% jitter
      const delay = Math.floor(baseDelay + jitter);
      totalDelay += delay;

      console.log(
        `⚠️ Attempt ${attempt}/${config.maxRetries} failed, retrying in ${delay}ms...`
      );
      console.log(`📊 Total delay so far: ${totalDelay}ms`);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  console.error(
    `❌ Email failed after ${config.maxRetries} attempts (total delay: ${totalDelay}ms)`
  );
  return {
    ...lastResult!,
    attempts: config.maxRetries,
  };
}

// Student verification email
export async function sendStudentVerificationEmail(
  data: StudentVerificationData,
  config?: EmailConfig
): Promise<EmailResult> {
  try {
    if (!data.ParentEmail?.trim()) {
      return {
        success: false,
        error: `Missing parent email for student: ${data.StudentName}`,
        timestamp: new Date(),
      };
    }

    if (!data.StudentName?.trim()) {
      return {
        success: false,
        error: "Missing student name",
        recipient: data.ParentEmail,
        timestamp: new Date(),
      };
    }

    if (!data.VerificationCode?.trim()) {
      return {
        success: false,
        error: "Missing verification code",
        recipient: data.ParentEmail,
        timestamp: new Date(),
      };
    }

    const emailContent = emailVerificationTemplate({
      ParentName: data.ParentName,
      StudentName: data.StudentName,
      VerificationCode: data.VerificationCode,
    });

    const result = await sendEmailSafely(
      data.ParentEmail,
      `Verify ${data.StudentName}'s Ganzaa Account`,
      emailContent,
      config
    );

    if (result.success) {
      logEmailSuccess("Student Verification", data.ParentEmail);
    } else {
      logEmailError("Student Verification", result.error, data.ParentEmail);
    }

    return result;
  } catch (error) {
    logEmailError("Student Verification", error, data.ParentEmail);
    return {
      success: false,
      recipient: data.ParentEmail,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    };
  }
}

// User verification email
export async function sendUserVerificationEmail(
  data: UserVerificationData,
  config?: EmailConfig
): Promise<EmailResult> {
  try {
    if (!data.Email?.trim()) {
      return {
        success: false,
        error: `Missing email for user: ${data.FullName}`,
        timestamp: new Date(),
      };
    }

    if (!data.FullName?.trim()) {
      return {
        success: false,
        error: "Missing full name",
        recipient: data.Email,
        timestamp: new Date(),
      };
    }

    if (!data.Token?.trim()) {
      return {
        success: false,
        error: "Missing verification token",
        recipient: data.Email,
        timestamp: new Date(),
      };
    }

    const emailContent = verifyUserTemplate({
      FullName: data.FullName,
      Token: data.Token,
    });

    const result = await sendEmailSafely(
      data.Email,
      "Verify Your Ganzaa Account",
      emailContent,
      config
    );

    if (result.success) {
      logEmailSuccess("User Verification", data.Email);
    } else {
      logEmailError("User Verification", result.error, data.Email);
    }

    return result;
  } catch (error) {
    logEmailError("User Verification", error, data.Email);
    return {
      success: false,
      recipient: data.Email,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    };
  }
}

// Teacher invitation email
export async function sendTeacherInvitationEmail(
  data: TeacherInvitationData,
  config?: EmailConfig
): Promise<EmailResult> {
  try {
    if (!data.Email?.trim()) {
      return {
        success: false,
        error: `Missing email for teacher: ${data.FullName}`,
        timestamp: new Date(),
      };
    }

    if (!data.FullName?.trim()) {
      return {
        success: false,
        error: "Missing teacher full name",
        recipient: data.Email,
        timestamp: new Date(),
      };
    }

    if (!data.OrganizationName?.trim()) {
      return {
        success: false,
        error: "Missing organization/school name",
        recipient: data.Email,
        timestamp: new Date(),
      };
    }

    if (!data.Token?.trim()) {
      return {
        success: false,
        error: "Missing invitation token",
        recipient: data.Email,
        timestamp: new Date(),
      };
    }

    const emailContent = teacherInvitationTemplate({
      FullName: data.FullName,
      OrganizationName: data.OrganizationName,
      Token: data.Token,
    });

    const result = await sendEmailSafely(
      data.Email,
      `Join ${data.OrganizationName} on Ganzaa - Teacher Invitation`,
      emailContent,
      config
    );

    if (result.success) {
      logEmailSuccess("Teacher Invitation", data.Email);
    } else {
      logEmailError("Teacher Invitation", result.error, data.Email);
    }

    return result;
  } catch (error) {
    logEmailError("Teacher Invitation", error, data.Email);
    return {
      success: false,
      recipient: data.Email,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    };
  }
}

// Forgot password email
export async function sendForgotPasswordEmail(
  data: ForgotPasswordData,
  config?: EmailConfig
): Promise<EmailResult> {
  try {
    if (!data.Email?.trim()) {
      return {
        success: false,
        error: `Missing email for user: ${data.FullName}`,
        timestamp: new Date(),
      };
    }

    if (!data.FullName?.trim()) {
      return {
        success: false,
        error: "Missing full name",
        recipient: data.Email,
        timestamp: new Date(),
      };
    }

    if (!data.Token?.trim()) {
      return {
        success: false,
        error: "Missing password reset token",
        recipient: data.Email,
        timestamp: new Date(),
      };
    }

    const emailContent = forgotPasswordTemplate({
      FullName: data.FullName,
      Token: data.Token,
    });

    const result = await sendEmailSafely(
      data.Email,
      "Reset Your Ganzaa Password",
      emailContent,
      config
    );

    if (result.success) {
      logEmailSuccess("Forgot Password", data.Email);
    } else {
      logEmailError("Forgot Password", result.error, data.Email);
    }

    return result;
  } catch (error) {
    logEmailError("Forgot Password", error, data.Email);
    return {
      success: false,
      recipient: data.Email,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    };
  }
}

// Password updated email
export async function sendPasswordUpdatedEmail(
  data: PasswordUpdatedData,
  config?: EmailConfig
): Promise<EmailResult> {
  try {
    if (!data.Email?.trim()) {
      return {
        success: false,
        error: `Missing email for user: ${data.FullName}`,
        timestamp: new Date(),
      };
    }

    if (!data.FullName?.trim()) {
      return {
        success: false,
        error: "Missing full name",
        recipient: data.Email,
        timestamp: new Date(),
      };
    }

    const emailContent = passwordUpdatedTemplate({
      FullName: data.FullName,
    });

    const result = await sendEmailSafely(
      data.Email,
      "Password Updated Successfully - Ganzaa",
      emailContent,
      config
    );

    if (result.success) {
      logEmailSuccess("Password Updated", data.Email);
    } else {
      logEmailError("Password Updated", result.error, data.Email);
    }

    return result;
  } catch (error) {
    logEmailError("Password Updated", error, data.Email);
    return {
      success: false,
      recipient: data.Email,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    };
  }
}

// Contact form email
export async function sendContactFormEmail(
  data: ContactFormData,
  config?: EmailConfig
): Promise<EmailResult> {
  try {
    if (!data.email?.trim()) {
      return {
        success: false,
        error: "Missing sender email",
        timestamp: new Date(),
      };
    }

    if (!data.name?.trim()) {
      return {
        success: false,
        error: "Missing sender name",
        timestamp: new Date(),
      };
    }

    if (!data.subject?.trim() || !data.message?.trim()) {
      return {
        success: false,
        error: "Missing subject or message",
        timestamp: new Date(),
      };
    }

    const emailContent = generateContactEmailHTML(data);
    const subject = `[Contact Form] ${data.subject} - from ${data.name}`;

    const result = await sendEmailSafely(
      "contact@ganzaa.org",
      subject,
      emailContent,
      config
    );

    if (result.success) {
      logEmailSuccess("Contact Form", data.email);
    } else {
      logEmailError("Contact Form", result.error, data.email);
    }

    return result;
  } catch (error) {
    logEmailError("Contact Form", error, data.email);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    };
  }
}

// Enhanced retry wrapper functions with custom config support
export async function sendStudentVerificationEmailWithRetry(
  data: StudentVerificationData,
  customConfig?: Partial<EmailConfig>
): Promise<EmailResult> {
  const config = { ...DEFAULT_EMAIL_CONFIG, ...customConfig };
  return sendEmailWithRetry(sendStudentVerificationEmail, data, config);
}

export async function sendUserVerificationEmailWithRetry(
  data: UserVerificationData,
  customConfig?: Partial<EmailConfig>
): Promise<EmailResult> {
  const config = { ...DEFAULT_EMAIL_CONFIG, ...customConfig };
  return sendEmailWithRetry(sendUserVerificationEmail, data, config);
}

export async function sendTeacherInvitationEmailWithRetry(
  data: TeacherInvitationData,
  customConfig?: Partial<EmailConfig>
): Promise<EmailResult> {
  const config = { ...DEFAULT_EMAIL_CONFIG, ...customConfig };
  return sendEmailWithRetry(sendTeacherInvitationEmail, data, config);
}

export async function sendForgotPasswordEmailWithRetry(
  data: ForgotPasswordData,
  customConfig?: Partial<EmailConfig>
): Promise<EmailResult> {
  const config = { ...DEFAULT_EMAIL_CONFIG, ...customConfig };
  return sendEmailWithRetry(sendForgotPasswordEmail, data, config);
}

export async function sendPasswordUpdatedEmailWithRetry(
  data: PasswordUpdatedData,
  customConfig?: Partial<EmailConfig>
): Promise<EmailResult> {
  const config = { ...DEFAULT_EMAIL_CONFIG, ...customConfig };
  return sendEmailWithRetry(sendPasswordUpdatedEmail, data, config);
}

export async function sendContactFormEmailWithRetry(
  data: ContactFormData,
  customConfig?: Partial<EmailConfig>
): Promise<EmailResult> {
  const config = { ...DEFAULT_EMAIL_CONFIG, ...customConfig };
  return sendEmailWithRetry(sendContactFormEmail, data, config);
}

// Bulk email operations with concurrency control
export async function sendBulkEmails<T>(
  emailFunction: (data: T, config?: EmailConfig) => Promise<EmailResult>,
  dataArray: T[],
  options?: {
    concurrency?: number;
    config?: Partial<EmailConfig>;
    onProgress?: (
      completed: number,
      total: number,
      results: EmailResult[]
    ) => void;
  }
): Promise<EmailResult[]> {
  const { concurrency = 5, config: customConfig, onProgress } = options || {};
  const config = { ...DEFAULT_EMAIL_CONFIG, ...customConfig };

  const results: EmailResult[] = [];
  const batches: T[][] = [];

  // Split into batches
  for (let i = 0; i < dataArray.length; i += concurrency) {
    batches.push(dataArray.slice(i, i + concurrency));
  }

  console.log(
    `📧 Starting bulk email operation: ${dataArray.length} emails in ${batches.length} batches`
  );

  // Process batches sequentially, items within batch concurrently
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const batchPromises = batch.map((data) => emailFunction(data, config));
    const batchResults = await Promise.all(batchPromises);

    results.push(...batchResults);

    if (onProgress) {
      onProgress(results.length, dataArray.length, results);
    }

    console.log(
      `📊 Batch ${batchIndex + 1}/${batches.length} completed: ${
        batchResults.filter((r) => r.success).length
      }/${batch.length} successful`
    );

    // Add delay between batches to avoid overwhelming the email service
    if (batchIndex < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  const successCount = results.filter((r) => r.success).length;
  console.log(
    `✅ Bulk email operation completed: ${successCount}/${dataArray.length} emails sent successfully`
  );

  return results;
}

// Email service health check
export async function checkEmailServiceHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    // Send a test email to a test address (you should configure this)
    const testResult = await sendEmailSafely(
      "test@ganzaa.org",
      "Email Service Health Check",
      "<h1>Email Service Health Check</h1><p>This is a test email to verify service health.</p>",
      { ...DEFAULT_EMAIL_CONFIG, timeout: 10000 }
    );

    const latency = Date.now() - startTime;

    return {
      healthy: testResult.success,
      latency,
      error: testResult.error,
    };
  } catch (error) {
    return {
      healthy: false,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export type {
  StudentVerificationData,
  UserVerificationData,
  TeacherInvitationData,
  ForgotPasswordData,
  PasswordUpdatedData,
  EmailResult,
  EmailConfig,
};
