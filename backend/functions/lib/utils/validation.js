"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidFirebaseUID = isValidFirebaseUID;
exports.isValidAmount = isValidAmount;
exports.isValidCurrency = isValidCurrency;
exports.isValidPlatform = isValidPlatform;
/**
 * Validates if a string is a valid Firebase UID format
 */
function isValidFirebaseUID(uid) {
    return typeof uid === 'string' && uid.length > 0 && uid.length <= 128;
}
/**
 * Validates if an amount is valid for Stripe (must be positive integer)
 */
function isValidAmount(amount) {
    return Number.isInteger(amount) && amount > 0;
}
/**
 * Validates if a currency code is valid
 */
function isValidCurrency(currency) {
    const validCurrencies = ['usd', 'eur', 'gbp', 'cad', 'aud'];
    return validCurrencies.includes(currency.toLowerCase());
}
/**
 * Validates if a platform value is supported
 */
function isValidPlatform(platform) {
    const validPlatforms = ['android', 'ios', 'android_ttp', 'web'];
    return validPlatforms.includes(platform);
}
//# sourceMappingURL=validation.js.map