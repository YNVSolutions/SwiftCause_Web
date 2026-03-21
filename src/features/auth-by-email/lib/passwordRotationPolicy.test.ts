import { describe, expect, it } from 'vitest'
import {
  PASSWORD_ROTATION_DAYS,
  PASSWORD_ROTATION_GRACE_DAYS,
  evaluatePasswordRotationStatus,
  getRotationScheduleFrom,
} from './passwordRotationPolicy'

describe('passwordRotationPolicy', () => {
  it('creates a 60-day due date and grace date', () => {
    const base = new Date('2026-01-01T00:00:00.000Z')
    const schedule = getRotationScheduleFrom(base)

    expect(schedule.passwordLastChangedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(schedule.passwordRotationDueAt).toBe(
      new Date(base.getTime() + PASSWORD_ROTATION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    )
    expect(schedule.passwordRotationGraceEndsAt).toBe(
      new Date(
        base.getTime() + (PASSWORD_ROTATION_DAYS + PASSWORD_ROTATION_GRACE_DAYS) * 24 * 60 * 60 * 1000,
      ).toISOString(),
    )
  })

  it('returns ok before due date', () => {
    const base = new Date('2026-01-01T00:00:00.000Z')
    const schedule = getRotationScheduleFrom(base)
    const status = evaluatePasswordRotationStatus(schedule, new Date('2026-02-01T00:00:00.000Z'))
    expect(status).toBe('ok')
  })

  it('returns grace after due date and before grace end', () => {
    const base = new Date('2026-01-01T00:00:00.000Z')
    const schedule = getRotationScheduleFrom(base)
    const status = evaluatePasswordRotationStatus(schedule, new Date('2026-03-05T00:00:00.000Z'))
    expect(status).toBe('grace')
  })

  it('returns expired after grace ends', () => {
    const base = new Date('2026-01-01T00:00:00.000Z')
    const schedule = getRotationScheduleFrom(base)
    const status = evaluatePasswordRotationStatus(schedule, new Date('2026-03-12T00:00:00.000Z'))
    expect(status).toBe('expired')
  })

  it('returns due when metadata is missing', () => {
    const status = evaluatePasswordRotationStatus({}, new Date('2026-03-12T00:00:00.000Z'))
    expect(status).toBe('due')
  })
})

