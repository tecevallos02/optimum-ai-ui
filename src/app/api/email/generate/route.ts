import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { appointmentId, attendeeName, attendeeEmail, appointmentDate, appointmentEnd, description } = await request.json()

    if (!appointmentId || !attendeeName || !attendeeEmail || !appointmentDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Format the appointment date and time
    const appointmentDateTime = new Date(appointmentDate)
    const appointmentEndTime = new Date(appointmentEnd)
    
    const dateStr = appointmentDateTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const timeStr = appointmentDateTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    
    const endTimeStr = appointmentEndTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })

    // Generate personalized email content using OpenAI
    let personalizedContent = ''
    let emailSubject = `Appointment Confirmation - ${dateStr}`
    
    try {
      // Initialize OpenAI client
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })

      // Create a prompt for OpenAI to generate personalized email content
      const prompt = `You are a professional assistant helping to write appointment confirmation emails. 

Generate a personalized, warm, and professional email confirmation based on the following appointment details:

**Appointment Information:**
- Client Name: ${attendeeName}
- Date: ${dateStr}
- Time: ${timeStr} - ${endTimeStr}
- Duration: ${Math.round((appointmentEndTime.getTime() - appointmentDateTime.getTime()) / (1000 * 60))} minutes
- Description from phone call: ${description || 'No specific details provided'}

**Requirements:**
1. Write a warm, professional confirmation email
2. Reference specific details from the appointment description if provided
3. Keep it concise but personal (2-3 sentences for the personalized part)
4. Use a professional but friendly tone
5. Make the client feel valued and prepared for their appointment

**Format your response as JSON with these fields:**
{
  "subject": "Appointment Confirmation - [Date]",
  "personalizedContent": "Your personalized message here",
  "fullEmail": "Complete email content here"
}

The fullEmail should include the greeting, personalized content, appointment details, and professional closing.`

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional email assistant that creates warm, personalized appointment confirmation emails. You MUST respond with ONLY valid JSON format. Do not include any text before or after the JSON. Escape all special characters properly."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      })

      const response = completion.choices[0]?.message?.content
      if (response) {
        try {
          // Clean the response to remove control characters that might break JSON parsing
          const cleanedResponse = response
            .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
            .replace(/\n/g, '\\n') // Escape newlines
            .replace(/\r/g, '\\r') // Escape carriage returns
            .replace(/\t/g, '\\t') // Escape tabs
            .trim()
          
          // Try to extract JSON from the response if it's wrapped in other text
          const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
          const jsonString = jsonMatch ? jsonMatch[0] : cleanedResponse
          
          const parsedResponse = JSON.parse(jsonString)
          personalizedContent = parsedResponse.personalizedContent || 'We\'re looking forward to meeting with you!'
          emailSubject = parsedResponse.subject || emailSubject
          
          // Use the full email if provided, otherwise construct it
          const fullEmailContent = parsedResponse.fullEmail || `Dear ${attendeeName},

Thank you for scheduling an appointment with us. We're excited to meet with you!

${personalizedContent}

**Appointment Details:**
- Date: ${dateStr}
- Time: ${timeStr} - ${endTimeStr}
- Duration: ${Math.round((appointmentEndTime.getTime() - appointmentDateTime.getTime()) / (1000 * 60))} minutes

We look forward to seeing you at your scheduled time. If you need to make any changes to your appointment or have any questions, please don't hesitate to reach out to us.

Please arrive a few minutes early to ensure we can start on time.

Best regards,
Your Goshawk AI Team

---
This is an automated confirmation email. If you have any questions or need to reschedule, please contact us directly.`

          const emailTemplate = {
            id: `email_${appointmentId}_${Date.now()}`,
            appointmentId,
            subject: emailSubject,
            content: fullEmailContent,
            generatedAt: new Date().toISOString()
          }

          return NextResponse.json(emailTemplate, { status: 200 })
        } catch (parseError) {
          console.error('Error parsing OpenAI response:', parseError)
          console.error('Raw response:', response)
          console.error('Cleaned response:', cleanedResponse)
          // Fall back to basic template
        }
      }
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError)
      // Fall back to basic template if OpenAI fails
    }

    // Fallback template if OpenAI fails or is not configured
    personalizedContent = description 
      ? `We're looking forward to meeting with you and discussing the details you shared during your call.`
      : `We're looking forward to meeting with you!`

    const emailTemplate = {
      id: `email_${appointmentId}_${Date.now()}`,
      appointmentId,
      subject: emailSubject,
      content: `Dear ${attendeeName},

Thank you for scheduling an appointment with us. We're excited to meet with you!

${personalizedContent}

**Appointment Details:**
- Date: ${dateStr}
- Time: ${timeStr} - ${endTimeStr}
- Duration: ${Math.round((appointmentEndTime.getTime() - appointmentDateTime.getTime()) / (1000 * 60))} minutes

We look forward to seeing you at your scheduled time. If you need to make any changes to your appointment or have any questions, please don't hesitate to reach out to us.

Please arrive a few minutes early to ensure we can start on time.

Best regards,
Your Goshawk AI Team

---
This is an automated confirmation email. If you have any questions or need to reschedule, please contact us directly.`,
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json(emailTemplate, { status: 200 })
  } catch (error) {
    console.error('Error generating email:', error)
    return NextResponse.json(
      { error: 'Failed to generate email' },
      { status: 500 }
    )
  }
}
