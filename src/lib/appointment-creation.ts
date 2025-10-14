import { prisma } from './prisma';

export interface AppointmentCreationData {
  orgId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  description?: string;
  notes?: string;
  source: 'AI_RECEPTIONIST' | 'AGENT' | 'WEB' | 'PHONE' | 'IMPORTED';
}

export async function createAppointmentFromCall(
  callId: string,
  appointmentData: Partial<AppointmentCreationData>
): Promise<string | null> {
  try {
    // Get the call to find the organization
    const call = await prisma.call.findUnique({
      where: { id: callId },
      include: { phoneNumber: true }
    });

    if (!call) {
      console.error('Call not found:', callId);
      return null;
    }

    // Validate required fields
    if (!appointmentData.title || !appointmentData.customerName || !appointmentData.startsAt || !appointmentData.endsAt) {
      console.error('Missing required appointment fields:', appointmentData);
      return null;
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        orgId: call.orgId,
        title: appointmentData.title,
        customerName: appointmentData.customerName,
        customerPhone: appointmentData.customerPhone,
        customerEmail: appointmentData.customerEmail,
        startsAt: appointmentData.startsAt,
        endsAt: appointmentData.endsAt,
        status: 'SCHEDULED',
        source: 'AI_RECEPTIONIST',
        description: appointmentData.description,
        notes: appointmentData.notes,
      }
    });

    // Update the call with the appointment reference
    await prisma.call.update({
      where: { id: callId },
      data: {
        disposition: 'booked',
        metadata: {
          ...(typeof call.metadata === 'object' && call.metadata !== null ? call.metadata as Record<string, any> : {}),
          appointmentId: appointment.id,
          appointmentCreatedAt: new Date().toISOString()
        }
      }
    });

    console.log('Appointment created from call:', appointment.id);
    return appointment.id;
  } catch (error) {
    console.error('Error creating appointment from call:', error);
    return null;
  }
}

export async function parseAppointmentFromTranscript(
  transcript: string,
  customerName: string,
  customerPhone?: string
): Promise<Partial<AppointmentCreationData> | null> {
  try {
    // Simple parsing logic - in a real implementation, you'd use AI/NLP
    const lowerTranscript = transcript.toLowerCase();
    
    // Look for date patterns
    const datePatterns = [
      /(?:on|for)\s+(\w+day)/i,
      /(?:on|for)\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      /(?:on|for)\s+(\d{1,2}-\d{1,2}-\d{2,4})/i,
      /(?:on|for)\s+(\w+\s+\d{1,2})/i,
    ];

    let appointmentDate: Date | null = null;
    for (const pattern of datePatterns) {
      const match = transcript.match(pattern);
      if (match) {
        // Simple date parsing - in production, use a proper date library
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        appointmentDate = tomorrow; // Default to tomorrow for now
        break;
      }
    }

    if (!appointmentDate) {
      return null;
    }

    // Look for time patterns
    const timePatterns = [
      /(\d{1,2}):(\d{2})\s*(am|pm)/i,
      /(\d{1,2})\s*(am|pm)/i,
      /at\s+(\d{1,2}):(\d{2})/i,
    ];

    let appointmentTime = '10:00'; // Default time
    for (const pattern of timePatterns) {
      const match = transcript.match(pattern);
      if (match) {
        if (match[2]) {
          appointmentTime = `${match[1]}:${match[2] || '00'} ${match[3] || match[2]}`;
        } else {
          appointmentTime = `${match[1]}:00`;
        }
        break;
      }
    }

    // Set appointment times (1 hour duration)
    const startsAt = new Date(appointmentDate);
    const [time, period] = appointmentTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let adjustedHours = hours;
    if (period === 'pm' && hours !== 12) {
      adjustedHours += 12;
    } else if (period === 'am' && hours === 12) {
      adjustedHours = 0;
    }
    
    startsAt.setHours(adjustedHours, minutes || 0, 0, 0);
    
    const endsAt = new Date(startsAt);
    endsAt.setHours(endsAt.getHours() + 1);

    // Look for service type
    const servicePatterns = [
      /(?:for|to)\s+([^.!?]+?)(?:appointment|meeting|consultation)/i,
      /(?:book|schedule)\s+([^.!?]+?)(?:appointment|meeting|consultation)/i,
    ];

    let serviceType = 'Appointment';
    for (const pattern of servicePatterns) {
      const match = transcript.match(pattern);
      if (match) {
        serviceType = match[1].trim();
        break;
      }
    }

    return {
      customerName,
      customerPhone,
      title: `${serviceType} - ${customerName}`,
      startsAt,
      endsAt,
      description: `Appointment scheduled via AI receptionist. Customer mentioned: ${transcript.substring(0, 200)}...`,
      notes: `Created from call transcript. Original transcript: ${transcript}`
    };
  } catch (error) {
    console.error('Error parsing appointment from transcript:', error);
    return null;
  }
}
