import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.EMAIL_FROM || "Campus Echo <noreply@campusecho.app>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f17; color: #e2e8f0; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .logo { text-align: center; margin-bottom: 40px; }
    .logo span { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .card { background: #1a1a2e; border: 1px solid #2d2d4a; border-radius: 16px; padding: 40px; }
    .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 24px 0; }
    .footer { text-align: center; margin-top: 32px; color: #64748b; font-size: 14px; }
    h1 { color: #f8fafc; font-size: 24px; margin-bottom: 16px; }
    p { color: #94a3b8; line-height: 1.6; margin: 8px 0; }
    .divider { border: none; border-top: 1px solid #2d2d4a; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo"><span>Campus Echo</span></div>
    <div class="card">${content}</div>
    <div class="footer">
      <p>Campus Echo — Your anonymous voice on campus</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;
  const html = baseTemplate(`
    <h1>Verify your email address</h1>
    <p>Welcome to Campus Echo! Click the button below to verify your email and activate your anonymous account.</p>
    <div style="text-align: center;">
      <a href="${verifyUrl}" class="button">Verify Email Address</a>
    </div>
    <hr class="divider">
    <p style="font-size: 13px;">Or copy this link: <code style="color: #6366f1">${verifyUrl}</code></p>
    <p style="font-size: 13px;">This link expires in 24 hours.</p>
  `);

  await transporter.sendMail({ from: FROM, to: email, subject: "Verify your Campus Echo account", html });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  const html = baseTemplate(`
    <h1>Reset your password</h1>
    <p>We received a request to reset your password. Click the button below to create a new password.</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </div>
    <hr class="divider">
    <p style="font-size: 13px;">This link expires in 1 hour.</p>
    <p style="font-size: 13px;">If you didn't request this, your account is safe.</p>
  `);

  await transporter.sendMail({ from: FROM, to: email, subject: "Reset your Campus Echo password", html });
}

export async function sendStatusUpdateEmail(
  email: string,
  postTitle: string,
  newStatus: string,
  adminMessage?: string
): Promise<void> {
  const statusColors: Record<string, string> = {
    UNDER_REVIEW: "#f59e0b",
    IN_PROGRESS: "#3b82f6",
    RESOLVED: "#22c55e",
    REJECTED: "#ef4444",
  };

  const color = statusColors[newStatus] || "#6366f1";
  const html = baseTemplate(`
    <h1>Your post status has been updated</h1>
    <p>The status of your post "<strong style="color: #f8fafc">${postTitle}</strong>" has been updated to:</p>
    <div style="text-align: center; padding: 20px;">
      <span style="background: ${color}20; color: ${color}; border: 1px solid ${color}40; padding: 8px 20px; border-radius: 20px; font-weight: 600;">${newStatus.replace("_", " ")}</span>
    </div>
    ${adminMessage ? `<p><strong style="color: #f8fafc">Admin note:</strong> ${adminMessage}</p>` : ""}
    <div style="text-align: center;">
      <a href="${APP_URL}/dashboard" class="button">View Your Post</a>
    </div>
  `);

  await transporter.sendMail({ from: FROM, to: email, subject: `Update on your Campus Echo post: ${newStatus}`, html });
}

export async function sendWelcomeEmail(email: string, alias: string): Promise<void> {
  const html = baseTemplate(`
    <h1>Welcome to Campus Echo! 🎉</h1>
    <p>Your anonymous account is ready. Your alias is:</p>
    <div style="text-align: center; padding: 20px;">
      <span style="background: #6366f120; color: #6366f1; border: 1px solid #6366f140; padding: 10px 24px; border-radius: 8px; font-size: 20px; font-weight: 700;">${alias}</span>
    </div>
    <p>This is how you'll appear publicly — your real identity is always protected.</p>
    <div style="text-align: center;">
      <a href="${APP_URL}/dashboard" class="button">Get Started</a>
    </div>
  `);

  await transporter.sendMail({ from: FROM, to: email, subject: "Welcome to Campus Echo!", html });
}
