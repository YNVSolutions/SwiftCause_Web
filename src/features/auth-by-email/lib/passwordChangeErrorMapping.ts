type ChangePasswordStatus = 'requires_recent_login' | 'current_password_invalid' | 'generic_error'

export interface ChangePasswordErrorMapping {
  status: ChangePasswordStatus
  message: string
  currentPasswordMessage?: string
  errorCode?: string
}

const hasCode = (error: unknown): error is { code: string } => {
  return typeof error === 'object' && error !== null && 'code' in error && typeof (error as any).code === 'string'
}

export const mapFirebaseChangePasswordError = (error: unknown): ChangePasswordErrorMapping => {
  const code = hasCode(error) ? error.code : undefined

  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return {
        status: 'current_password_invalid',
        message: 'Current password is incorrect.',
        currentPasswordMessage: 'Current password is incorrect.',
        errorCode: code,
      }

    case 'auth/requires-recent-login':
      return {
        status: 'requires_recent_login',
        message: 'For security, please sign in again and try changing your password once more.',
        errorCode: code,
      }

    case 'auth/user-mismatch':
      return {
        status: 'generic_error',
        message: 'Unable to verify your session. Please sign in again.',
        errorCode: code,
      }

    default:
      return {
        status: 'generic_error',
        message: 'We could not update your password right now. Please try again.',
        errorCode: code,
      }
  }
}

