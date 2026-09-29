/**
 * Utility to clean corrupted filenames (e.g., UTF-8 encoded as ISO-8859-1/Latin1 mojibake)
 * and normalize Unicode non-standard whitespace characters like narrow no-break space (U+202F)
 * common in macOS screenshot filenames.
 */

const MOJIBAKE_SPACE_REGEX = /\u00e2[\u0080-\u009f]?\u00af|â[\u0080-\u009f]?¯|â¯/g;
const UNICODE_SPACES_REGEX = /[\u202F\u00A0\u2000-\u200B\u2028\u2029\uFEFF]/g;
const LATIN1_UTF8_CANDIDATE_REGEX = /[\u00C2-\u00F4][\u0080-\u00BF]/;

export const cleanFilename = (filename: string | null | undefined): string => {
  if (!filename) return "";

  let cleaned = filename;

  // 1. Repair known dropped-byte mojibake sequences, e.g. "â¯" or "â\x80¯"
  // produced when UTF-8 \u202F (0xE2 0x80 0xAF) is decoded as Latin-1 with byte 0x80 stripped.
  cleaned = cleaned.replace(MOJIBAKE_SPACE_REGEX, " ");

  // 2. If it contains standard multi-byte UTF-8 sequences misinterpreted as Latin-1, try decoding
  if (LATIN1_UTF8_CANDIDATE_REGEX.test(cleaned)) {
    try {
      const bytes = Uint8Array.from(cleaned, (char) => char.charCodeAt(0) & 0xff);
      const recovered = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      if (recovered && !recovered.includes("\ufffd")) {
        cleaned = recovered;
      }
    } catch {
      // Keep cleaned as is if UTF-8 decoding fails
    }
  }

  // 3. Normalize non-standard unicode whitespace (like U+202F narrow no-break space in macOS screenshots)
  cleaned = cleaned.replace(UNICODE_SPACES_REGEX, " ");

  // 4. Ensure space between timestamp and AM/PM (e.g., "9.50.11PM" -> "9.50.11 PM")
  cleaned = cleaned.replace(/(\d{1,2}[.:]\d{2}(?:[.:]\d{2})?)\s*(AM|PM)/gi, "$1 $2");

  // 5. Collapse any unintentional multiple spaces into a single space
  cleaned = cleaned.replace(/ {2,}/g, " ").trim();

  return cleaned;
};


/**
 * Sanitizes a File object before upload so its name only uses standard spaces and clean characters,
 * preventing backend parsers like Multer/Busboy from mangling multipart header filenames.
 */
export const sanitizeUploadFile = (file: File): File => {
  const cleanedName = cleanFilename(file.name);
  if (cleanedName === file.name || !cleanedName) {
    return file;
  }

  return new File([file], cleanedName, {
    type: file.type,
    lastModified: file.lastModified,
  });
};
