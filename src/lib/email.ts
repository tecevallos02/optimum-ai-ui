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
      subject: 'Sign in to your account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Sign in to your account</h2>
          <p>Hello ${name || 'there'},</p>
          <p>Click the button below to sign in to your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${activationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Sign In
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${activationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            If you didn't request this email, you can safely ignore it.
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
