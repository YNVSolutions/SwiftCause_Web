export type PasswordPolicyErrorKey =
  | 'current_required'
  | 'new_required'
  | 'min_length'
  | 'uppercase'
  | 'lowercase'
  | 'number'
  | 'special'
  | 'reused'
  | 'contains_current'
  | 'weak_pattern'

export interface ChangePasswordInputs {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export interface ChangePasswordValidationErrors {
  currentPassword?: string
  newPassword?: string
  confirmNewPassword?: string
  /**
   * Generic, non-field-specific error (e.g., last-resort fallback).
   * Avoids putting business logic errors into field labels.
   */
  formError?: string
}

const MIN_PASSWORD_LENGTH = 8

// Matches the same strength expectations already used in Signup (>= 8 chars, and character classes).
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/
const COMMON_WEAK_SUBSTRINGS = [
  'password',
  '123456',
  'qwerty',
  'letmein',
  'admin',
  'welcome',
  'iloveyou',
  'monkey',
  'dragon',
]

const hasUppercase = (value: string) => /[A-Z]/.test(value)
const hasLowercase = (value: string) => /[a-z]/.test(value)
const hasNumber = (value: string) => /[0-9]/.test(value)
const hasSpecial = (value: string) => SPECIAL_CHAR_REGEX.test(value)

const normalizeForComparison = (value: string) => value.trim().toLowerCase()

export const getNewPasswordPolicyError = ({
  currentPassword,
  newPassword,
}: Pick<ChangePasswordInputs, 'currentPassword' | 'newPassword'>): {
  errorKey?: PasswordPolicyErrorKey
  message?: string
} => {
  const current = normalizeForComparison(currentPassword)
  const next = normalizeForComparison(newPassword)

  if (!newPassword) {
    return { errorKey: 'new_required', message: 'New password is required.' }
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return {
      errorKey: 'min_length',
      message: 'Use at least 8 characters for your new password.',
    }
  }

  if (!hasUppercase(newPassword)) {
    return {
      errorKey: 'uppercase',
      message: 'Your new password must include at least one uppercase letter.',
    }
  }

  if (!hasLowercase(newPassword)) {
    return {
      errorKey: 'lowercase',
      message: 'Your new password must include at least one lowercase letter.',
    }
  }

  if (!hasNumber(newPassword)) {
    return {
      errorKey: 'number',
      message: 'Your new password must include at least one number.',
    }
  }

  if (!hasSpecial(newPassword)) {
    return {
      errorKey: 'special',
      message: 'Your new password must include at least one special character.',
    }
  }

  // "Reused password" heuristics (best-effort; cannot guarantee uniqueness).
  if (next === current && current.length > 0) {
    return {
      errorKey: 'reused',
      message: 'Your new password must be different from your current password.',
    }
  }

  // If the user tries to slightly modify the current password, block containment patterns.
  if (current.length >= 4 && next.includes(current)) {
    return {
      errorKey: 'contains_current',
      message: 'Your new password must not contain your current password.',
    }
  }

  // Block common weak/reused patterns where feasible.
  for (const weak of COMMON_WEAK_SUBSTRINGS) {
    if (weak.length >= 4 && next.includes(weak)) {
      return {
        errorKey: 'weak_pattern',
        message:
          'Your new password looks too common. Please choose a more unique password.',
      }
    }
  }

  return {}
}

export const validateChangePasswordInputs = (
  inputs: ChangePasswordInputs,
): ChangePasswordValidationErrors => {
  const errors: ChangePasswordValidationErrors = {}

  if (!inputs.currentPassword) {
    errors.currentPassword = 'Current password is required.'
  }

  if (!inputs.newPassword) {
    errors.newPassword = 'New password is required.'
  }

  // Strength + weak/reuse checks
  const newPasswordPolicyError = getNewPasswordPolicyError({
    currentPassword: inputs.currentPassword,
    newPassword: inputs.newPassword,
  })

  if (newPasswordPolicyError.errorKey && newPasswordPolicyError.message) {
    errors.newPassword = newPasswordPolicyError.message
  }

  if (inputs.confirmNewPassword !== inputs.newPassword) {
    errors.confirmNewPassword = 'New passwords do not match.'
  }

  return errors
}

