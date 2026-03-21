'use client'

import Image from 'next/image'
import { ChangePasswordPanel } from '@/views/admin/components/ChangePasswordPanel'
import { getRotationBannerMessage } from '@/features/auth-by-email/lib/passwordRotationPolicy'
import type { PasswordRotationStatus } from '@/shared/types'

interface ChangePasswordScreenProps {
  reason?: string
  rotationStatus?: PasswordRotationStatus
}

export function ChangePasswordScreen({ reason, rotationStatus }: ChangePasswordScreenProps) {
  const showRotationReason = reason === 'rotation-expired' || rotationStatus === 'expired'
  const rotationMessage =
    (rotationStatus && getRotationBannerMessage(rotationStatus)) ||
    'Your password rotation period has expired. Please update your password now.'

  return (
    <div className="min-h-screen bg-[#fcf9f1] px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 flex items-center justify-center gap-3">
          <Image src="/logo.png" alt="SwiftCause logo" width={48} height={48} className="rounded-xl" />
          <span className="text-2xl font-bold tracking-tight text-[#064e3b]">SwiftCause</span>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] sm:p-10">
          {showRotationReason && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {rotationMessage}
            </div>
          )}
          <ChangePasswordPanel />
        </div>
      </div>
    </div>
  )
}

