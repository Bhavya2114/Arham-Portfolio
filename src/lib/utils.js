import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility helper to conditionally join and merge Tailwind CSS classes safely
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
