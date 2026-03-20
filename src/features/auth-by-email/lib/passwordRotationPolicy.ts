export type PasswordRotationStatus = 'ok' | 'due' | 'grace' | 'expired'

export interface PasswordRotationMetadata {
  passwordLastChangedAt?: string
  passwordRotationDueAt?: string
  passwordRotationGraceEndsAt?: string
  passwordRotationStatus?: PasswordRotationStatus
}

export const PASSWORD_ROTATION_DAYS = 60
export const PASSWORD_ROTATION_GRACE_DAYS = 7

const DAY_MS = 24 * 60 * 60 * 1000

const addDays = (base: Date, days: number): Date => new Date(base.getTime() + days * DAY_MS)

export const getRotationScheduleFrom = (baseDate: Date) => {
  const dueAt = addDays(baseDate, PASSWORD_ROTATION_DAYS)
  const graceEndsAt = addDays(dueAt, PASSWORD_ROTATION_GRACE_DAYS)

  return {
    passwordLastChangedAt: baseDate.toISOString(),
    passwordRotationDueAt: dueAt.toISOString(),
    passwordRotationGraceEndsAt: graceEndsAt.toISOString(),
    passwordRotationStatus: 'ok' as PasswordRotationStatus,
  }
}

const parseSafeDate = (value?: string): Date | null => {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

export const evaluatePasswordRotationStatus = (
  metadata: PasswordRotationMetadata,
  now: Date = new Date(),
): PasswordRotationStatus => {
  const dueAt = parseSafeDate(metadata.passwordRotationDueAt)
  const graceEndsAt = parseSafeDate(metadata.passwordRotationGraceEndsAt)

  if (!dueAt || !graceEndsAt) {
    return 'due'
  }

  if (now <= dueAt) {
    return 'ok'
  }

  if (now <= graceEndsAt) {
    return 'grace'
  }

  return 'expired'
}

export const getRotationBannerMessage = (status: PasswordRotationStatus): string | null => {
  switch (status) {
    case 'due':
      return 'Your password rotation window has started. Please update your password soon.'
    case 'grace':
      return 'Your password is in grace period. Please change it soon to avoid account lockout.'
    case 'expired':
      return 'Your password rotation period has expired. Please update your password now.'
    default:
      return null
  }
}

