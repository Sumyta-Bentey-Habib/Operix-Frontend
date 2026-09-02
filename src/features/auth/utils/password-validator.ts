import type { PasswordValidationResult } from "../types/registration.types";

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

export const validatePassword = (
  password: string,
  confirmPassword?: string,
): PasswordValidationResult => {
  const minLength =
    password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch =
    confirmPassword !== undefined ? password.length > 0 && password === confirmPassword : true;

  const isValid =
    minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial && passwordsMatch;

  return {
    minLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
    passwordsMatch,
    isValid,
  };
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};
