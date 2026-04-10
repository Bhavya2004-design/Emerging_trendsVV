/**
 * Client-side limits and validation for auth and sensitive text fields.
 */

export const INPUT_LIMITS = {
  name: 50,
  email: 254,
  password: 32,
};

/**
 * @param {string} email
 * @returns {string | null} Error message, or null if OK
 */
export function validateEmailFormat(email) {
  const t = String(email || '').trim();
  if (!t) {
    return 'Enter your email address.';
  }
  if (t.length > INPUT_LIMITS.email) {
    return `Email must be at most ${INPUT_LIMITS.email} characters.`;
  }
  const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basic.test(t)) {
    return 'Enter a valid email address (for example name@example.com).';
  }
  return null;
}

/**
 * Password policy for registration (and password changes).
 * @param {string} password
 * @returns {string[]} Human-readable missing requirements (empty if valid)
 */
export function getPasswordPolicyErrors(password) {
  const p = String(password || '');
  const errors = [];

  if (p.length < 12) {
    errors.push('Use at least 12 characters.');
  }
  if (!/[a-z]/.test(p)) {
    errors.push('Include at least one lowercase letter (a–z).');
  }
  if (!/[A-Z]/.test(p)) {
    errors.push('Include at least one uppercase letter (A–Z).');
  }
  if (!/[0-9]/.test(p)) {
    errors.push('Include at least one number (0–9).');
  }
  if (!/[^A-Za-z0-9]/.test(p)) {
    errors.push(
      'Include at least one special character (for example ! @ # $ % ^ & *).',
    );
  }
  if (p.length > INPUT_LIMITS.password) {
    errors.push(`Password must be at most ${INPUT_LIMITS.password} characters.`);
  }

  return errors;
}

export const PASSWORD_REQUIREMENTS_HINT =
  'At least 12 characters, with upper and lowercase letters, a number, and a special character.';
