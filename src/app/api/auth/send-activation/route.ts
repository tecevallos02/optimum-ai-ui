import { NextRequest, NextResponse } from 'next/server'
import { createActivationToken, sendActivationEmail } from '../../../../lib/email'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists, create if not
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          emailVerified: null, // Not verified yet
        },
      })
    }

    // Check if user is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'Account is already verified' },
        { status: 400 }
      )
    }

    // Create activation token
    const activationToken = await createActivationToken(user.id)

    // Send activation email
    const activationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify?email=${encodeURIComponent(email)}`
    
    await sendActivationEmail({
      email: user.email,
      name: user.name || 'User',
      activationToken,
      activationUrl,
    })

    return NextResponse.json({
      success: true,
      message: 'Activation email sent successfully',
    })
  } catch (error) {
    console.error('Send activation API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
