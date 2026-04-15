/**
 * Validate email
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validate password (min 8 chars, uppercase, lowercase, digit)
 */
export const isValidPassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
};

/**
 * Validate phone (Indian 10-digit)
 */
export const isValidPhone = (phone) => {
  return /^[6-9]\d{9}$/.test(phone);
};

/**
 * Validate CGPA (0–10, up to 2 decimals)
 */
export const isValidCGPA = (cgpa) => {
  const num = parseFloat(cgpa);
  return !isNaN(num) && num >= 0 && num <= 10;
};

/**
 * Get password strength
 */
export const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: 1, label: 'Weak' };
  if (score <= 4) return { level: 2, label: 'Medium' };
  return { level: 3, label: 'Strong' };
};
