/**
 * Utility helper functions for UI and styling.
 */

/**
 * Combine class names conditionally (lightweight fallback for clsx/tailwind-merge).
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}
