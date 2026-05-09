"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { generateAnonymousAlias } from "@/utils/anonymous";
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from "@/lib/email";
import type { ApiResponse } from "@/types";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function registerUser(formData: FormData): Promise<ApiResponse> {
  try {
    const raw = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const validated = registerSchema.parse(raw);

    const existing = await prisma.user.findUnique({ where: { email: validated.email } });
    if (existing) return { success: false, error: "Email already registered" };

    const passwordHash = await bcrypt.hash(validated.password, 12);
    const anonymousAlias = generateAnonymousAlias();
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.create({
      data: {
        email: validated.email,
        passwordHash,
        anonymousAlias,
        anonymousSeed: crypto.randomUUID(),
        role: "STUDENT",
      },
    });

    // Store verification token
    await prisma.verificationToken.create({
      data: {
        identifier: validated.email,
        token: verificationToken,
        expires: verificationExpiry,
      },
    });

    await sendVerificationEmail(validated.email, verificationToken);

    return {
      success: true,
      message: "Account created! Please check your email to verify your account.",
    };
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return { success: false, error: error.errors[0]?.message || "Validation failed" };
    }
    console.error("registerUser error:", error);
    return { success: false, error: "Failed to create account" };
  }
}

export async function verifyEmail(token: string): Promise<ApiResponse> {
  try {
    const verification = await prisma.verificationToken.findUnique({ where: { token } });

    if (!verification) return { success: false, error: "Invalid or expired token" };
    if (verification.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      return { success: false, error: "Token expired. Please request a new verification email." };
    }

    const user = await prisma.user.update({
      where: { email: verification.identifier },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({ where: { token } });

    try {
      await sendWelcomeEmail(user.email, user.anonymousAlias);
    } catch (e) {
      console.error("Welcome email failed:", e);
    }

    return { success: true, message: "Email verified successfully!" };
  } catch (error) {
    return { success: false, error: "Verification failed" };
  }
}

export async function requestPasswordReset(email: string): Promise<ApiResponse> {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return { success: true, message: "If this email exists, a reset link has been sent." };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.verificationToken.upsert({
      where: { token },
      create: { identifier: `reset:${email}`, token, expires },
      update: { expires },
    });

    await sendPasswordResetEmail(email, token);

    return { success: true, message: "If this email exists, a reset link has been sent." };
  } catch (error) {
    return { success: false, error: "Failed to process request" };
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
  try {
    const verification = await prisma.verificationToken.findUnique({ where: { token } });

    if (!verification || !verification.identifier.startsWith("reset:")) {
      return { success: false, error: "Invalid or expired reset link" };
    }
    if (verification.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      return { success: false, error: "Reset link expired" };
    }

    const email = verification.identifier.replace("reset:", "");
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({ where: { email }, data: { passwordHash } });
    await prisma.verificationToken.delete({ where: { token } });

    return { success: true, message: "Password reset successfully" };
  } catch (error) {
    return { success: false, error: "Failed to reset password" };
  }
}

export async function resendVerificationEmail(email: string): Promise<ApiResponse> {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: true, message: "If this email exists, a verification email has been sent." };
    if (user.emailVerified) return { success: false, error: "Email already verified" };

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.upsert({
      where: { token },
      create: { identifier: email, token, expires },
      update: { expires },
    });

    await sendVerificationEmail(email, token);

    return { success: true, message: "Verification email sent" };
  } catch (error) {
    return { success: false, error: "Failed to send email" };
  }
}
