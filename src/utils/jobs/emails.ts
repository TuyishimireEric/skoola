import nodemailer from "nodemailer";

const SMTP_HOST = "smtp.zoho.com";
const SMTP_PORT = 465;
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: `Ganzaa <${SMTP_USER}>`,
    to,
    subject,
    replyTo: 'help@ganzaa.org',
    html,
  });
}
