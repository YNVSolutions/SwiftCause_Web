import { maskEmailAddress } from './passwordResetAudit'

type PasswordChangeAuditEventType =
  | 'password_change_request'
  | 'password_rotation_status'
  | 'password_rotation_completed'

type PasswordChangeAuditStatus =
  | 'attempted'
  | 'failed'
  | 'completed'
  | 'due'
  | 'grace'
  | 'expired'

interface PasswordChangeAuditPayload {
  eventType: PasswordChangeAuditEventType
  status: PasswordChangeAuditStatus
  email?: string
  errorCode?: string
  metadata?: Record<string, string | number | boolean | null>
}

const getFunctionUrl = (functionName: string) =>
  `https://us-central1-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net/${functionName}`

const CLIENT_SESSION_KEY = 'swiftcause_password_change_session_id'

const createSessionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const getPasswordChangeSessionId = (): string => {
  if (typeof window === 'undefined') {
    return 'server'
  }

  const existing = window.sessionStorage.getItem(CLIENT_SESSION_KEY)
  if (existing) {
    return existing
  }

  const nextValue = createSessionId()
  window.sessionStorage.setItem(CLIENT_SESSION_KEY, nextValue)
  return nextValue
}

export const logPasswordChangeAuditEvent = async ({
  eventType,
  status,
  email,
  errorCode,
  metadata,
}: PasswordChangeAuditPayload): Promise<void> => {
  try {
    await fetch(getFunctionUrl('logAuthEvent'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType,
        status,
        emailMasked: email ? maskEmailAddress(email) : null,
        clientSessionId: getPasswordChangeSessionId(),
        route: typeof window !== 'undefined' ? window.location.pathname : null,
        errorCode: errorCode || null,
        metadata: metadata || {},
      }),
    })
  } catch (error) {
    // Avoid leaking client details (including passwords) into logs.
    console.error('Failed to log password change audit event')
  }
}

