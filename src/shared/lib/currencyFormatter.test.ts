import { describe, expect, it } from 'vitest';

import { formatCurrency, formatCurrencyFromMajor } from './currencyFormatter';

describe('currencyFormatter', () => {
  it('formats minor currency units as GBP', () => {
    expect(formatCurrency(1234)).toBe('£12.34');
  });

  it('defaults missing minor amounts to zero', () => {
    expect(formatCurrency(0)).toBe('£0.00');
  });

  it('formats major currency units as GBP', () => {
    expect(formatCurrencyFromMajor(12.3)).toBe('£12.30');
  });
});
