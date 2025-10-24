/**
 * Validates if a string is a valid Firebase UID format
 */
export function isValidFirebaseUID(uid: string): boolean {
  return typeof uid === 'string' && uid.length > 0 && uid.length <= 128;
}

/**
 * Validates if an amount is valid for Stripe (must be positive integer)
 */
export function isValidAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount > 0;
}

/**
 * Validates if a currency code is valid
 */
export function isValidCurrency(currency: string): boolean {
  const validCurrencies = ['usd', 'eur', 'gbp', 'cad', 'aud'];
  return validCurrencies.includes(currency.toLowerCase());
}

/**
 * Validates if a platform value is supported
 */
export function isValidPlatform(platform: string): boolean {
  const validPlatforms = ['android', 'ios', 'android_ttp', 'web'];
  return validPlatforms.includes(platform);
}
