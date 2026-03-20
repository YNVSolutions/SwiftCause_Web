'use client'

import { useCallback, useState } from 'react'
import { EmailAuthProvider, reauthenticateWithCredential, signOut, updatePassword } from 'firebase/auth'
import { auth, db } from '../../../shared/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { validateChangePasswordInputs, type ChangePasswordInputs } from '../lib/passwordPolicy'
import { logPasswordChangeAuditEvent } from '../lib/passwordChangeAudit'
import { mapFirebaseChangePasswordError } from '../lib/passwordChangeErrorMapping'
import { getRotationScheduleFrom } from '../lib/passwordRotationPolicy'

type ChangePasswordStatus = 'idle' | 'submitting' | 'success' | 'requires_recent_login' | 'error'

export interface ChangePasswordErrors {
  currentPassword?: string
  newPassword?: string
  confirmNewPassword?: string
  formError?: string
}

export const useChangePassword = ({
  onSuccess,
}: {
  onSuccess?: () => void
} = {}) => {
  const [status, setStatus] = useState<ChangePasswordStatus>('idle')
  const [errors, setErrors] = useState<ChangePasswordErrors>({})

  const setIdleErrors = useCallback(() => {
    setStatus('idle')
    setErrors({})
  }, [])

  const signOutUser = useCallback(async () => {
    await signOut(auth)
  }, [])

  const handleChangePassword = useCallback(
    async (inputs: ChangePasswordInputs) => {
      setErrors({})

      const validationErrors = validateChangePasswordInputs(inputs)
      if (
        validationErrors.currentPassword ||
        validationErrors.newPassword ||
        validationErrors.confirmNewPassword ||
        validationErrors.formError
      ) {
        setStatus('error')
        setErrors(validationErrors)

        await logPasswordChangeAuditEvent({
          eventType: 'password_change_request',
          status: 'failed',
          email: auth.currentUser?.email ?? undefined,
          errorCode: 'client_validation_failed',
          metadata: {
            validationErrorKeys: Object.keys(validationErrors).filter((k) => {
              const key = k as keyof typeof validationErrors
              return Boolean(validationErrors[key])
            }).join(','),
          },
        })

        return
      }

      const user = auth.currentUser
      const userEmail = user?.email
      if (!user || !userEmail) {
        setStatus('error')
        setErrors({
          formError: 'You must be signed in to change your password.',
        })

        await logPasswordChangeAuditEvent({
          eventType: 'password_change_request',
          status: 'failed',
          email: userEmail ?? undefined,
          errorCode: 'no_authenticated_user',
        })

        return
      }

      setStatus('submitting')
      try {
        await logPasswordChangeAuditEvent({
          eventType: 'password_change_request',
          status: 'attempted',
          email: userEmail,
          metadata: {},
        })

        const credential = EmailAuthProvider.credential(userEmail, inputs.currentPassword)
        await reauthenticateWithCredential(user, credential)
        await updatePassword(user, inputs.newPassword)
        const schedule = getRotationScheduleFrom(new Date())
        await updateDoc(doc(db, 'users', user.uid), {
          ...schedule,
        })

        await logPasswordChangeAuditEvent({
          eventType: 'password_change_request',
          status: 'completed',
          email: userEmail,
          metadata: {},
        })

        await logPasswordChangeAuditEvent({
          eventType: 'password_rotation_completed',
          status: 'completed',
          email: userEmail,
          metadata: {
            nextDueAt: schedule.passwordRotationDueAt,
          },
        })

        setStatus('success')
        onSuccess?.()
      } catch (error: unknown) {
        const mapped = mapFirebaseChangePasswordError(error)

        await logPasswordChangeAuditEvent({
          eventType: 'password_change_request',
          status: 'failed',
          email: userEmail,
          errorCode: mapped.errorCode ?? mapped.status,
          metadata: {
            mappedStatus: mapped.status,
          },
        })

        if (mapped.status === 'current_password_invalid') {
          setStatus('error')
          setErrors({
            currentPassword: mapped.currentPasswordMessage,
          })
          return
        }

        if (mapped.status === 'requires_recent_login') {
          setStatus('requires_recent_login')
          // Banner UX will show the re-auth message; avoid duplicating it in the red error box.
          setErrors({})
          return
        }

        setStatus('error')
        setErrors({
          formError: mapped.message,
        })
      }
    },
    [onSuccess],
  )

  return {
    status,
    isLoading: status === 'submitting',
    errors,
    handleChangePassword,
    signOutUser,
    setIdleErrors,
  }
}

