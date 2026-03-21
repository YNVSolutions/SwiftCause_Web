'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Shield, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '../../../shared/ui/button'
import { ProfessionalPasswordField } from '../../auth/interactions/ProfessionalPasswordField'
import { useChangePassword } from '@/features/auth-by-email/hooks/useChangePassword'

export function ChangePasswordPanel() {
  const router = useRouter()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showNewPasswordGuidance, setShowNewPasswordGuidance] = useState(false)

  const { status, isLoading, errors, handleChangePassword, signOutUser, setIdleErrors } = useChangePassword()

  useEffect(() => {
    if (status !== 'success') return

    const t = window.setTimeout(() => {
      void signOutUser().then(() => {
        router.push('/login')
      })
    }, 1500)

    return () => window.clearTimeout(t)
  }, [router, signOutUser, status])

  const canSubmit = useMemo(() => {
    if (isLoading) return false
    if (status === 'success') return false
    if (!currentPassword || !newPassword || !confirmNewPassword) return false
    if (newPassword !== confirmNewPassword) return false
    return true
  }, [confirmNewPassword, currentPassword, isLoading, newPassword, status])

  const passwordChecks = useMemo(() => {
    const minLength = newPassword.length >= 8
    const uppercase = /[A-Z]/.test(newPassword)
    const lowercase = /[a-z]/.test(newPassword)
    const number = /[0-9]/.test(newPassword)
    const special = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)

    return { minLength, uppercase, lowercase, number, special }
  }, [newPassword])

  const passwordStrength = useMemo(() => {
    const checks = Object.values(passwordChecks)
    const passedCount = checks.filter(Boolean).length

    if (passedCount === 0) return 'Weak'
    if (passedCount <= 2) return 'Fair'
    if (passedCount === 3) return 'Good'
    return 'Strong'
  }, [passwordChecks])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-[#064e3b]" />
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Change Password
        </h4>
      </div>

      {status === 'requires_recent_login' ? (
        <p className="text-xs text-amber-800 leading-relaxed flex items-start gap-2">
          <KeyRound className="h-4 w-4 mt-0.5" />
          Re-authentication is required. Your new password must be strong and match the application
          policy.
        </p>
      ) : (
        <p className="text-xs text-gray-500 leading-relaxed">
          Update your password using strong password rules.
        </p>
      )}

      {errors.formError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5" />
          <span>{errors.formError}</span>
        </div>
      )}

      {status === 'success' && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 flex items-start gap-2">
          <KeyRound className="h-4 w-4 mt-0.5" />
          <div className="flex-1">
            Password updated. Signing you out. Please sign in again.
          </div>
        </div>
      )}

      {status !== 'success' && (
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            await handleChangePassword({
              currentPassword,
              newPassword,
              confirmNewPassword,
            })
          }}
          className="space-y-3"
        >
          <ProfessionalPasswordField
            id="current-password"
            label="Current password"
            value={currentPassword}
            autoComplete="current-password"
            onChange={(e) => {
              setCurrentPassword(e.target.value)
              if (status !== 'idle') setIdleErrors()
            }}
            error={errors.currentPassword || null}
          />

          <ProfessionalPasswordField
            id="new-password"
            label="New password"
            value={newPassword}
            autoComplete="new-password"
            onFocus={() => {
              setShowNewPasswordGuidance(true)
            }}
            onChange={(e) => {
              setNewPassword(e.target.value)
              if (status !== 'idle') setIdleErrors()
            }}
            error={errors.newPassword || null}
          />

          <ProfessionalPasswordField
            id="confirm-new-password"
            label="Confirm new password"
            value={confirmNewPassword}
            autoComplete="new-password"
            onChange={(e) => {
              setConfirmNewPassword(e.target.value)
              if (status !== 'idle') setIdleErrors()
            }}
            error={errors.confirmNewPassword || null}
          />

          {showNewPasswordGuidance && (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <p className="text-[#4c9a59] text-xs font-medium">Password strength</p>
                  <p className="text-[#11d452] text-xs font-bold">{passwordStrength}</p>
                </div>
                <div className="flex gap-1 h-1.5">
                  {[0, 1, 2, 3, 4].map((index) => {
                    const passedCount = Object.values(passwordChecks).filter(Boolean).length
                    return (
                      <div
                        key={index}
                        className={`flex-1 rounded-full ${index < passedCount ? 'bg-[#11d452]' : 'bg-[#cfe7d3]'}`}
                      />
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 py-2">
                <div className="flex items-center gap-2">
                  {passwordChecks.minLength ? (
                    <CheckCircle className="text-[#11d452] w-[16px] h-[16px]" />
                  ) : (
                    <div className="w-[16px] h-[16px] rounded-full border-2 border-[#cfe7d3]" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      passwordChecks.minLength ? 'text-[#0d1b10]' : newPassword.length > 0 ? 'text-red-600' : 'text-[#4c9a59]'
                    }`}
                  >
                    At least 8 characters
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {passwordChecks.uppercase ? (
                    <CheckCircle className="text-[#11d452] w-[16px] h-[16px]" />
                  ) : (
                    <div className="w-[16px] h-[16px] rounded-full border-2 border-[#cfe7d3]" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      passwordChecks.uppercase ? 'text-[#0d1b10]' : newPassword.length > 0 ? 'text-red-600' : 'text-[#4c9a59]'
                    }`}
                  >
                    One uppercase letter
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {passwordChecks.lowercase ? (
                    <CheckCircle className="text-[#11d452] w-[16px] h-[16px]" />
                  ) : (
                    <div className="w-[16px] h-[16px] rounded-full border-2 border-[#cfe7d3]" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      passwordChecks.lowercase ? 'text-[#0d1b10]' : newPassword.length > 0 ? 'text-red-600' : 'text-[#4c9a59]'
                    }`}
                  >
                    One lowercase letter
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {passwordChecks.number ? (
                    <CheckCircle className="text-[#11d452] w-[16px] h-[16px]" />
                  ) : (
                    <div className="w-[16px] h-[16px] rounded-full border-2 border-[#cfe7d3]" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      passwordChecks.number ? 'text-[#0d1b10]' : newPassword.length > 0 ? 'text-red-600' : 'text-[#4c9a59]'
                    }`}
                  >
                    One number
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {passwordChecks.special ? (
                    <CheckCircle className="text-[#11d452] w-[16px] h-[16px]" />
                  ) : (
                    <div className="w-[16px] h-[16px] rounded-full border-2 border-[#cfe7d3]" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      passwordChecks.special ? 'text-[#0d1b10]' : newPassword.length > 0 ? 'text-red-600' : 'text-[#4c9a59]'
                    }`}
                  >
                    One special symbol
                  </span>
                </div>
              </div>
            </>
          )}

          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full"
          >
            {isLoading ? 'Updating...' : 'Update password'}
          </Button>

          <p className="text-[11px] text-gray-500">
            Must be at least 8 characters and include uppercase, lowercase, number and special
            characters.
          </p>
        </form>
      )}
    </div>
  )
}

