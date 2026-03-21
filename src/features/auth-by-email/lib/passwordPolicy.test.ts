import { describe, expect, it } from 'vitest'
import { validateChangePasswordInputs } from './passwordPolicy'

describe('validateChangePasswordInputs', () => {
  it('flags missing current password', () => {
    const errors = validateChangePasswordInputs({
      currentPassword: '',
      newPassword: 'Aa1!aaaa',
      confirmNewPassword: 'Aa1!aaaa',
    })

    expect(errors.currentPassword).toBe('Current password is required.')
  })

  it('flags too-weak new password (missing uppercase)', () => {
    const errors = validateChangePasswordInputs({
      currentPassword: 'Old1!aaaa',
      newPassword: 'old1!aaaa',
      confirmNewPassword: 'old1!aaaa',
    })

    expect(errors.newPassword).toContain('uppercase')
  })

  it('flags confirm mismatch', () => {
    const errors = validateChangePasswordInputs({
      currentPassword: 'Old1!aaaa',
      newPassword: 'Aa1!aaaa',
      confirmNewPassword: 'Aa1!aaab',
    })

    expect(errors.confirmNewPassword).toBe('New passwords do not match.')
  })

  it('flags reused password (same as current)', () => {
    const errors = validateChangePasswordInputs({
      currentPassword: 'Aa1!aaaa',
      newPassword: 'Aa1!aaaa',
      confirmNewPassword: 'Aa1!aaaa',
    })

    expect(errors.newPassword).toContain('different')
  })

  it('flags containment of current password substring', () => {
    const errors = validateChangePasswordInputs({
      currentPassword: 'Abc1!def',
      newPassword: 'xxabc1!defyyA1!zz',
      confirmNewPassword: 'xxabc1!defyyA1!zz',
    })

    expect(errors.newPassword).toContain('must not contain')
  })

  it('flags common weak patterns', () => {
    const errors = validateChangePasswordInputs({
      currentPassword: 'Abc1!def',
      newPassword: 'Aa1!password',
      confirmNewPassword: 'Aa1!password',
    })

    expect(errors.newPassword).toContain('common')
  })

  it('allows a strong new password', () => {
    const errors = validateChangePasswordInputs({
      currentPassword: 'Abc1!def',
      newPassword: 'Zz9@QwEr12',
      confirmNewPassword: 'Zz9@QwEr12',
    })

    expect(errors.currentPassword).toBeUndefined()
    expect(errors.newPassword).toBeUndefined()
    expect(errors.confirmNewPassword).toBeUndefined()
  })
})

