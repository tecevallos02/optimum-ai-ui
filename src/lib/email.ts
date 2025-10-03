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

  // In production, you would send real emails here
  // Example with Resend, SendGrid, or other email service
  console.log('📧 Activation Email Details:')
  console.log(`   To: ${email}`)
  console.log(`   Name: ${name}`)
  console.log(`   Activation Code: ${activationToken}`)
  console.log(`   Activation URL: ${activationUrl}`)
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
