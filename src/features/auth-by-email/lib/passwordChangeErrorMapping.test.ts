import { describe, expect, it } from 'vitest'
import { mapFirebaseChangePasswordError } from './passwordChangeErrorMapping'

describe('mapFirebaseChangePasswordError', () => {
  it('maps auth/wrong-password to current_password_invalid', () => {
    const mapped = mapFirebaseChangePasswordError({ code: 'auth/wrong-password' })
    expect(mapped.status).toBe('current_password_invalid')
    expect(mapped.currentPasswordMessage).toContain('incorrect')
  })

  it('maps auth/invalid-credential to current_password_invalid', () => {
    const mapped = mapFirebaseChangePasswordError({ code: 'auth/invalid-credential' })
    expect(mapped.status).toBe('current_password_invalid')
  })

  it('maps auth/requires-recent-login to requires_recent_login', () => {
    const mapped = mapFirebaseChangePasswordError({ code: 'auth/requires-recent-login' })
    expect(mapped.status).toBe('requires_recent_login')
    expect(mapped.message).toContain('sign in again')
  })

  it('maps unknown codes to generic_error', () => {
    const mapped = mapFirebaseChangePasswordError({ code: 'auth/some-other-error' })
    expect(mapped.status).toBe('generic_error')
  })
})

