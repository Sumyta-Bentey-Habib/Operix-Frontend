import { describe, expect, it } from "vitest";
import { obfuscateId, formatPublicHandle } from "@/utils/id-obfuscator";

describe("id-obfuscator", () => {
  describe("obfuscateId", () => {
    it("returns N/A for empty or non-string inputs", () => {
      expect(obfuscateId(null)).toBe("N/A");
      expect(obfuscateId(undefined)).toBe("N/A");
      expect(obfuscateId("")).toBe("N/A");
      expect(obfuscateId("   ")).toBe("N/A");
    });

    it("masks short IDs properly", () => {
      expect(obfuscateId("123")).toBe("****123");
      expect(obfuscateId("123", "USR")).toBe("USR-****123");
    });

    it("obfuscates UUIDs and longer database IDs", () => {
      expect(obfuscateId("usr_987654321", "USR")).toBe("USR-****4321");
      expect(obfuscateId("admin-1234-5678", "ADM")).toBe("ADM-****5678");
      expect(obfuscateId("60d5ec49f1a23b4567890abc", "TM")).toBe("TM-****0abc");
    });
  });

  describe("formatPublicHandle", () => {
    it("returns name if provided", () => {
      expect(formatPublicHandle("John Doe", "usr_1234")).toBe("John Doe");
    });

    it("falls back to obfuscated ID if name is missing", () => {
      expect(formatPublicHandle(null, "usr_1234", "USR")).toBe("USR-****1234");
      expect(formatPublicHandle("", "usr_1234", "USR")).toBe("USR-****1234");
    });
  });
});
