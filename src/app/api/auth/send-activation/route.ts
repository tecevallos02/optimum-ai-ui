import { NextRequest, NextResponse } from 'next/server'
import { createActivationToken, sendActivationEmail } from '../../../../lib/email'
import { hashPassword, validatePassword } from '../../../../lib/password'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, firstName, lastName, organizationName } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      )
    }

    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'First name and last name are required' },
        { status: 400 }
      )
    }

    if (!organizationName) {
      return NextResponse.json(
        { success: false, error: 'Organization name is required' },
        { status: 400 }
      )
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Password does not meet requirements', details: passwordValidation.errors },
        { status: 400 }
      )
    }

    // Check if user exists, create if not
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Hash the password
      const hashedPassword = await hashPassword(password)
      
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: name || `${firstName} ${lastName}`,
          firstName,
          lastName,
          password: hashedPassword,
          emailVerified: null, // Not verified yet
        },
      })

      // Create organization for the new user
      const organization = await prisma.organization.create({
        data: {
          name: organizationName,
          createdAt: new Date(),
        },
      })

      // Create membership with OWNER role
      await prisma.membership.create({
        data: {
          userId: user.id,
          orgId: organization.id,
          role: 'OWNER',
        },
      })

      console.log(`✅ Created user ${email} with organization: ${organizationName}`)
    } else {
      // User exists, update password if provided
      if (password) {
        const hashedPassword = await hashPassword(password)
        user = await prisma.user.update({
          where: { email },
          data: { 
            password: hashedPassword,
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            name: name || `${firstName} ${lastName}` || user.name,
          },
        })
      }
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
