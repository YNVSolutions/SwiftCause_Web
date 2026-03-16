type PasswordResetAuditEventType = 'password_reset_request' | 'password_reset_confirm'
type PasswordResetAuditStatus =
  | 'attempted'
  | 'submitted'
  | 'throttled'
  | 'failed'
  | 'completed'
  | 'invalid_link'

interface PasswordResetAuditPayload {
  eventType: PasswordResetAuditEventType
  status: PasswordResetAuditStatus
  email?: string
  errorCode?: string
  metadata?: Record<string, string | number | boolean | null>
}

const getFunctionUrl = (functionName: string) =>
  `https://us-central1-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net/${functionName}`

const CLIENT_SESSION_KEY = 'swiftcause_password_reset_session_id'

const createSessionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const getPasswordResetSessionId = (): string => {
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

export const maskEmailAddress = (email: string): string => {
  const trimmed = email.trim().toLowerCase()
  const [localPart = '', domain = ''] = trimmed.split('@')

  if (!localPart || !domain) {
    return 'unknown'
  }

  const visibleLocal =
    localPart.length <= 2
      ? `${localPart.slice(0, 1)}*`
      : `${localPart.slice(0, 2)}${'*'.repeat(Math.max(localPart.length - 2, 1))}`

  return `${visibleLocal}@${domain}`
}

export const logPasswordResetAuditEvent = async ({
  eventType,
  status,
  email,
  errorCode,
  metadata,
}: PasswordResetAuditPayload): Promise<void> => {
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
        clientSessionId: getPasswordResetSessionId(),
        route: typeof window !== 'undefined' ? window.location.pathname : null,
        errorCode: errorCode || null,
        metadata: metadata || {},
      }),
    })
  } catch (error) {
    console.error('Failed to log password reset audit event:', error)
  }
}
