import { prisma } from "./prisma";

export interface ActivationEmailData {
  email: string;
  name: string;
  activationToken: string;
  activationUrl: string;
}

export interface PasswordResetEmailData {
  email: string;
  name: string;
  resetToken: string;
  resetUrl: string;
}

export async function generateActivationToken(): Promise<string> {
  // Generate a 6-digit activation code
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  return token;
}

export async function generateResetToken(): Promise<string> {
  // Generate a secure random token for password reset
  const crypto = await import("crypto");
  return crypto.randomBytes(32).toString("hex");
}

export async function createActivationToken(userId: string): Promise<string> {
  const token = await generateActivationToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.user.update({
    where: { id: userId },
    data: {
      activationToken: token,
      activationExpires: expiresAt,
    },
  });

  return token;
}

export async function createResetToken(userId: string): Promise<string> {
  const token = await generateResetToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: userId },
    data: {
      resetToken: token,
      resetExpires: expiresAt,
    },
  });

  return token;
}

export async function sendActivationEmail(
  data: ActivationEmailData,
): Promise<void> {
  const { email, name, activationToken, activationUrl } = data;

  // In development, skip sending emails
  if (process.env.NODE_ENV === "development") {
    return;
  }

  // In production, send real emails with Resend
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@yourdomain.com",
      to: [email],
      subject: "Your 6-digit activation code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">Welcome to Goshawk AI</h1>
            <p style="color: #666; margin: 10px 0 0 0;">Your account activation code</p>
          </div>
          
          <div style="background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0;">
            <p style="color: #333; font-size: 16px; margin: 0 0 15px 0;">Your 6-digit activation code is:</p>
            <div style="background-color: #007bff; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 8px; display: inline-block; font-family: 'Courier New', monospace;">
              ${activationToken}
            </div>
            <p style="color: #666; font-size: 14px; margin: 15px 0 0 0;">Enter this code on the verification page</p>
          </div>
          
          <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #1976d2; font-size: 14px;">
              <strong>Important:</strong> This code will expire in 24 hours for security reasons.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${activationUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Go to Verification Page
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; text-align: center; margin: 0;">
            If you didn't request this activation code, you can safely ignore this email.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("❌ Failed to send activation email:", error);
  }
}

export async function verifyActivationToken(
  token: string,
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        activationToken: token,
        activationExpires: {
          gt: new Date(), // Token hasn't expired
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Invalid or expired activation token",
      };
    }

    // Mark email as verified and clear activation token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        activationToken: null,
        activationExpires: null,
      },
    });

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("Error verifying activation token:", error);
    return {
      success: false,
      error: "Failed to verify activation token",
    };
  }
}

export async function sendPasswordResetEmail(
  data: PasswordResetEmailData,
): Promise<void> {
  const { email, name, resetToken, resetUrl } = data;

  // In development, skip sending emails
  if (process.env.NODE_ENV === "development") {
    return;
  }

  // In production, send real emails with Resend
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@yourdomain.com",
      to: [email],
      subject: "Reset your password - Goshawk AI",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">Password Reset Request</h1>
            <p style="color: #666; margin: 10px 0 0 0;">Goshawk AI</p>
          </div>
          
          <div style="background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 10px; padding: 30px; margin: 30px 0;">
            <p style="color: #333; font-size: 16px; margin: 0 0 15px 0;">Hello ${name},</p>
            <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="color: #007bff; font-size: 14px; word-break: break-all; margin: 5px 0 0 0;">${resetUrl}</p>
          </div>
          
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Important:</strong> This link will expire in 1 hour for security reasons. If you didn't request this password reset, you can safely ignore this email.
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; text-align: center; margin: 0;">
            If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error);
  }
}
