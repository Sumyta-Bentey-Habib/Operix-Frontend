import { describe, it, expect } from "vitest";
import { validatePassword, isValidEmail } from "./password-validator";

describe("validatePassword", () => {
  it("flags short passwords as invalid", () => {
    const result = validatePassword("Short1!");
    expect(result.minLength).toBe(false);
    expect(result.isValid).toBe(false);
  });

  it("flags missing uppercase letters", () => {
    const result = validatePassword("lowercase123!");
    expect(result.hasUppercase).toBe(false);
    expect(result.isValid).toBe(false);
  });

  it("flags missing lowercase letters", () => {
    const result = validatePassword("UPPERCASE123!");
    expect(result.hasLowercase).toBe(false);
    expect(result.isValid).toBe(false);
  });

  it("flags missing numeric characters", () => {
    const result = validatePassword("PasswordOnly!");
    expect(result.hasNumber).toBe(false);
    expect(result.isValid).toBe(false);
  });

  it("flags missing special symbols", () => {
    const result = validatePassword("Password123");
    expect(result.hasSpecial).toBe(false);
    expect(result.isValid).toBe(false);
  });

  it("validates compliant password successfully", () => {
    const result = validatePassword("ValidPassword123!", "ValidPassword123!");
    expect(result.minLength).toBe(true);
    expect(result.hasUppercase).toBe(true);
    expect(result.hasLowercase).toBe(true);
    expect(result.hasNumber).toBe(true);
    expect(result.hasSpecial).toBe(true);
    expect(result.passwordsMatch).toBe(true);
    expect(result.isValid).toBe(true);
  });

  it("flags mismatched confirm password", () => {
    const result = validatePassword("ValidPassword123!", "DifferentPassword123!");
    expect(result.passwordsMatch).toBe(false);
    expect(result.isValid).toBe(false);
  });
});

describe("isValidEmail", () => {
  it("accepts valid email addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("doctor.sarah@operix.com")).toBe(true);
  });

  it("rejects invalid email addresses", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("@domain.com")).toBe(false);
  });
});
