import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, content } = await request.json()

    if (!to || !subject || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // In development, log the email details
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email Details:')
      console.log(`   To: ${to}`)
      console.log(`   Subject: ${subject}`)
      console.log(`   Content: ${content}`)
      console.log('📧 In production, this would be sent via Resend')
      
      return NextResponse.json({
        success: true,
        message: 'Email logged to console (development mode)'
      })
    }

    // In production, send real emails with Resend
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
        to: [to],
        subject: subject,
        html: content.replace(/\n/g, '<br>'),
      })

      if (error) {
        console.error('Resend error:', error)
        return NextResponse.json(
          { error: 'Failed to send email via Resend' },
          { status: 500 }
        )
      }

      console.log('✅ Email sent successfully via Resend:', data)
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        emailId: data?.id
      })
    } catch (resendError) {
      console.error('Resend import/send error:', resendError)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
