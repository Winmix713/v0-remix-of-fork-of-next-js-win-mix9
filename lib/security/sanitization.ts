import DOMPurify from "isomorphic-dompurify"

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br"],
    ALLOWED_ATTR: [],
  })
}

/**
 * Sanitize user input for database storage
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/['"]/g, "") // Remove quotes to prevent SQL injection
    .substring(0, 1000) // Limit length
}

/**
 * Validate and sanitize team names
 */
export function sanitizeTeamName(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9\s\-.]/g, "") // Allow only alphanumeric, spaces, hyphens, dots
    .substring(0, 100)
}

/**
 * Validate and sanitize league names
 */
export function sanitizeLeagueName(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9\s\-.]/g, "")
    .substring(0, 50)
}

/**
 * Escape SQL LIKE patterns
 */
export function escapeLikePattern(pattern: string): string {
  return pattern.replace(/[%_\\]/g, "\\$&")
}

/**
 * Validate file uploads
 */
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ["text/csv", "application/vnd.ms-excel"]
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Invalid file type. Only CSV files are allowed." }
  }

  if (file.size > maxSize) {
    return { valid: false, error: "File too large. Maximum size is 10MB." }
  }

  return { valid: true }
}

/**
 * Generate secure random tokens
 */
export function generateSecureToken(length = 32): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
  }

  // Fallback for environments without crypto
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
