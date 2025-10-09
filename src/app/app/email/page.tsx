'use client'

import { useState, useEffect } from 'react'
import { Appointment } from '@/lib/types'
import EditableEmailDialog from '@/components/email/EditableEmailDialog'

interface EmailTemplate {
  id: string
  appointmentId: string
  subject: string
  content: string
  generatedAt: string
}

export default function EmailPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showEditableDialog, setShowEditableDialog] = useState(false)
  const [editableTemplate, setEditableTemplate] = useState<EmailTemplate | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments')
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
        if (data.length > 0) {
          setSelectedAppointment(data[0])
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateEmail = async (appointment: Appointment, isApology = false) => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/email/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: appointment.id,
          attendeeName: appointment.customerName,
          attendeeEmail: appointment.customerEmail || '',
          appointmentDate: appointment.startsAt,
          appointmentEnd: appointment.endsAt,
          description: appointment.description || appointment.notes,
          status: appointment.status,
          isApology: isApology,
        }),
      })

      if (response.ok) {
        const template = await response.json()
        setEditableTemplate(template)
        setShowEditableDialog(true)
      } else {
        console.error('Failed to generate email')
      }
    } catch (error) {
      console.error('Error generating email:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEditableConfirm = (subject: string, content: string) => {
    if (!selectedAppointment) return;
    
    const template: EmailTemplate = {
      id: Date.now().toString(),
      appointmentId: selectedAppointment.id,
      subject,
      content,
      generatedAt: new Date().toISOString(),
    };
    
    setEmailTemplate(template);
    setShowEditableDialog(false);
  };

  const sendEmail = async () => {
    if (!emailTemplate || !selectedAppointment) return

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedAppointment.customerEmail || '',
          subject: emailTemplate.subject,
          content: emailTemplate.content,
        }),
      })

      if (response.ok) {
        alert('Email sent successfully!')
      } else {
        alert('Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Error sending email')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">AI Email Generator</h1>
        <p className="text-sm text-gray-600">
          Generate personalized appointment confirmation emails using AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments List */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Appointments</h2>
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAppointment?.id === appointment.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedAppointment(appointment)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {appointment.customerName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {appointment.customerEmail || 'No email provided'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(appointment.startsAt).toLocaleDateString()} at{' '}
                      {new Date(appointment.startsAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800'
                        : appointment.status === 'completed'
                        ? 'bg-gray-100 text-gray-800'
                        : appointment.status === 'canceled'
                        ? 'bg-red-100 text-red-800'
                        : appointment.status === 'no_show'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Generation */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Generate Email</h2>
          
          {selectedAppointment ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  Selected Appointment
                </h3>
                <p className="text-sm text-gray-600">
                  <strong>Name:</strong> {selectedAppointment.customerName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {selectedAppointment.customerEmail || 'No email provided'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong>{' '}
                  {new Date(selectedAppointment.startsAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Time:</strong>{' '}
                  {new Date(selectedAppointment.startsAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {new Date(selectedAppointment.endsAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {(selectedAppointment as any).description && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Description:</strong> {(selectedAppointment as any).description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => generateEmail(selectedAppointment)}
                  disabled={isGenerating}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating...' : 'Generate AI Email'}
                </button>
                
                {selectedAppointment.status === 'canceled' && (
                  <button
                    onClick={() => generateEmail(selectedAppointment, true)}
                    disabled={isGenerating}
                    className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Apology Email'}
                  </button>
                )}
              </div>

              {emailTemplate && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">
                      Generated Email Template
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subject:
                        </label>
                        <input
                          type="text"
                          value={emailTemplate.subject}
                          onChange={(e) =>
                            setEmailTemplate({
                              ...emailTemplate,
                              subject: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Content:
                        </label>
                        <textarea
                          value={emailTemplate.content}
                          onChange={(e) =>
                            setEmailTemplate({
                              ...emailTemplate,
                              content: e.target.value,
                            })
                          }
                          rows={8}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={sendEmail}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                    >
                      Send Email
                    </button>
                    <button
                      onClick={() => generateEmail(selectedAppointment)}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Select an appointment to generate an email
            </p>
          )}
        </div>
      </div>

      {/* Editable Email Dialog */}
      {showEditableDialog && editableTemplate && selectedAppointment && (
        <EditableEmailDialog
          appointment={selectedAppointment}
          emailTemplate={editableTemplate}
          onClose={() => setShowEditableDialog(false)}
          onConfirm={handleEditableConfirm}
        />
      )}
    </div>
  )
}
