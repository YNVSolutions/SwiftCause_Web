import { useCallback, useMemo, useState } from 'react'
import { authApi } from '../api'
import {
  getPasswordResetSessionId,
  logPasswordResetAuditEvent,
} from '../lib/passwordResetAudit'

type ForgotPasswordStatus = 'idle' | 'submitted' | 'rate_limited' | 'error'

const RESET_THROTTLE_KEY = 'swiftcause_password_reset_attempts'
const RESET_THROTTLE_WINDOW_MS = 15 * 60 * 1000
const RESET_THROTTLE_MAX_ATTEMPTS = 3
const GENERIC_SUCCESS_MESSAGE =
  'If an account exists for that email, you will receive a password reset link shortly.'
const RATE_LIMIT_MESSAGE =
  'Too many reset requests were made from this browser. Please wait a few minutes before trying again.'
const GENERIC_ERROR_MESSAGE =
  'We could not process that request right now. Please wait a moment and try again.'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const getStoredAttemptTimestamps = (): number[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(RESET_THROTTLE_KEY)
    const parsed = rawValue ? (JSON.parse(rawValue) as unknown) : []
    if (!Array.isArray(parsed)) {
      return []
    }

    const cutoff = Date.now() - RESET_THROTTLE_WINDOW_MS
    return parsed.filter((value): value is number => typeof value === 'number' && value >= cutoff)
  } catch {
    return []
  }
}

const saveAttemptTimestamps = (timestamps: number[]) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(RESET_THROTTLE_KEY, JSON.stringify(timestamps))
}

const getRemainingThrottleMs = (timestamps: number[]): number => {
  if (timestamps.length < RESET_THROTTLE_MAX_ATTEMPTS) {
    return 0
  }

  const oldestAttempt = timestamps[0]
  return Math.max(oldestAttempt + RESET_THROTTLE_WINDOW_MS - Date.now(), 0)
}

const formatRemainingThrottleTime = (remainingMs: number): string => {
  const remainingMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)))
  return `${RATE_LIMIT_MESSAGE} Try again in about ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}.`
}

export function useForgotPassword() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<ForgotPasswordStatus>('idle')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault()

    const normalizedEmail = email.trim().toLowerCase()
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setStatus('error')
      setMessage('Enter a valid email address.')
      return
    }

    const timestamps = getStoredAttemptTimestamps()
    const remainingThrottleMs = getRemainingThrottleMs(timestamps)

    if (remainingThrottleMs > 0) {
      const throttleMessage = formatRemainingThrottleTime(remainingThrottleMs)
      setStatus('rate_limited')
      setMessage(throttleMessage)

      void logPasswordResetAuditEvent({
        eventType: 'password_reset_request',
        status: 'throttled',
        email: normalizedEmail,
        metadata: {
          clientSessionId: getPasswordResetSessionId(),
          remainingThrottleMs,
        },
      })

      return
    }

    setLoading(true)
    setStatus('idle')
    setMessage('')

    const nextTimestamps = [...timestamps, Date.now()]
    saveAttemptTimestamps(nextTimestamps)

    await logPasswordResetAuditEvent({
      eventType: 'password_reset_request',
      status: 'attempted',
      email: normalizedEmail,
    })

    try {
      await authApi.sendPasswordResetEmail(normalizedEmail)
      setStatus('submitted')
      setMessage(GENERIC_SUCCESS_MESSAGE)

      await logPasswordResetAuditEvent({
        eventType: 'password_reset_request',
        status: 'submitted',
        email: normalizedEmail,
      })
    } catch (error: unknown) {
      const errorCode =
        error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
          ? error.code
          : 'unknown'

      if (errorCode === 'auth/user-not-found') {
        setStatus('submitted')
        setMessage(GENERIC_SUCCESS_MESSAGE)
      } else if (errorCode === 'auth/too-many-requests') {
        setStatus('submitted')
        setMessage(
          `${GENERIC_SUCCESS_MESSAGE} If you recently requested one, please wait a few minutes before trying again.`
        )
      } else {
        setStatus('error')
        setMessage(GENERIC_ERROR_MESSAGE)
      }

      await logPasswordResetAuditEvent({
        eventType: 'password_reset_request',
        status: 'failed',
        email: normalizedEmail,
        errorCode,
      })
    } finally {
      setLoading(false)
    }
  }, [email])

  const isSubmitted = useMemo(() => status === 'submitted', [status])

  return {
    email,
    setEmail,
    loading,
    message,
    status,
    isSubmitted,
    handleSubmit,
  }
}
