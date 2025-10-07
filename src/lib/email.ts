import { prisma } from './prisma'

export interface ActivationEmailData {
  email: string
  name: string
  activationToken: string
  activationUrl: string
}

export async function generateActivationToken(): Promise<string> {
  // Generate a 6-digit activation code
  const token = Math.floor(100000 + Math.random() * 900000).toString()
  return token
}

export async function createActivationToken(userId: string): Promise<string> {
  const token = await generateActivationToken()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await prisma.user.update({
    where: { id: userId },
    data: {
      activationToken: token,
      activationExpires: expiresAt,
    },
  })

  return token
}

export async function sendActivationEmail(data: ActivationEmailData): Promise<void> {
  const { email, name, activationToken, activationUrl } = data

  // In development, log the activation details
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 Activation Email Details:')
    console.log(`   To: ${email}`)
    console.log(`   Name: ${name}`)
    console.log(`   Activation Code: ${activationToken}`)
    console.log(`   Activation URL: ${activationUrl}`)
    console.log('📧 In production, this would be sent via email')
    return
  }

  // In production, send real emails with Resend
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
      to: [email],
      subject: 'Your 6-digit activation code',
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
    })

    console.log('✅ Activation email sent successfully to:', email)
  } catch (error) {
    console.error('❌ Failed to send activation email:', error)
    // Fallback to logging for debugging
    console.log('📧 Activation Email Details (fallback):')
    console.log(`   To: ${email}`)
    console.log(`   Name: ${name}`)
    console.log(`   Activation Code: ${activationToken}`)
    console.log(`   Activation URL: ${activationUrl}`)
  }
}

export async function verifyActivationToken(token: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        activationToken: token,
        activationExpires: {
          gt: new Date(), // Token hasn't expired
        },
      },
    })

    if (!user) {
      return {
        success: false,
        error: 'Invalid or expired activation token',
      }
    }

    // Mark email as verified and clear activation token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        activationToken: null,
        activationExpires: null,
      },
    })

    return {
      success: true,
      user,
    }
  } catch (error) {
    console.error('Error verifying activation token:', error)
    return {
      success: false,
      error: 'Failed to verify activation token',
    }
  }
}
