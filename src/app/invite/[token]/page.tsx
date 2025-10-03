'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'

interface Invitation {
  id: string
  orgName: string
  role: string
  email: string
  expiresAt: string
  creatorName?: string
}

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Fetch invitation details
    const fetchInvitation = async () => {
      try {
        const { token } = await params
        const response = await fetch(`/api/invitations/${token}`)
        if (response.ok) {
          const data = await response.json()
          setInvitation(data)
        } else {
          setError('Invalid or expired invitation')
        }
      } catch {
        setError('Failed to load invitation')
      } finally {
        setLoading(false)
      }
    }

    fetchInvitation()
  }, [params])

  const handleAccept = async () => {
    if (!session) {
      // Redirect to sign in with callback to this page
      const { token } = await params
      signIn(undefined, { callbackUrl: `/invite/${token}` })
      return
    }

    setAccepting(true)
    try {
      const { token } = await params
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        const result = await response.json()
        // Switch to the new organization and redirect to app
        await fetch(`/api/orgs/${result.orgId}/switch`, { method: 'POST' })
        router.push('/app')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to accept invitation')
      }
    } catch {
      setError('Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Invitation Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'This invitation may have expired or been used already.'}
          </p>
          <button
            onClick={() => router.push('/signin')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  const isExpired = new Date(invitation.expiresAt) < new Date()
  const roleColors = {
    OWNER: 'bg-purple-100 text-purple-800',
    MANAGER: 'bg-blue-100 text-blue-800',
    AGENT: 'bg-green-100 text-green-800',
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <div className="text-blue-500 text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            You&apos;re Invited!
          </h2>
          <p className="text-gray-600">
            You&apos;ve been invited to join <strong>{invitation.orgName}</strong>
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
            <span className="text-sm font-medium text-gray-700">Organization:</span>
            <span className="font-semibold">{invitation.orgName}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
            <span className="text-sm font-medium text-gray-700">Role:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[invitation.role as keyof typeof roleColors]}`}>
              {invitation.role}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
            <span className="text-sm font-medium text-gray-700">Email:</span>
            <span className="text-sm">{invitation.email}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
            <span className="text-sm font-medium text-gray-700">Expires:</span>
            <span className={`text-sm ${isExpired ? 'text-red-600' : 'text-gray-600'}`}>
              {new Date(invitation.expiresAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {isExpired ? (
          <div className="text-center">
            <p className="text-red-600 mb-4">This invitation has expired.</p>
            <button
              onClick={() => router.push('/signin')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {!session ? (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Please sign in to accept this invitation.
                </p>
                <button
                  onClick={async () => {
                    const { token } = await params
                    signIn(undefined, { callbackUrl: `/invite/${token}` })
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Sign In to Accept
                </button>
              </div>
            ) : session.user?.email !== invitation.email ? (
              <div className="text-center">
                <p className="text-red-600 mb-4">
                  This invitation is for {invitation.email}, but you&apos;re signed in as {session.user?.email}.
                </p>
                <button
                  onClick={async () => {
                    const { token } = await params
                    signIn(undefined, { callbackUrl: `/invite/${token}` })
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Sign In with Different Account
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {accepting ? 'Accepting...' : 'Accept Invitation'}
                </button>
                <button
                  onClick={() => router.push('/app')}
                  className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Maybe Later
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


