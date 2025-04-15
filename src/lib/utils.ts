import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date.toString();
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return date.toString();
  }
}

export function truncateText(
  text: string,
  maxLength: number,
  ellipsis: string = "..."
): string {
  if (!text || text.length <= maxLength) return text;

  // Find the last space within the maxLength - ellipsis.length limit
  const limit = maxLength - ellipsis.length;
  const lastSpace = text.slice(0, limit).lastIndexOf(" ");

  // If no space found or space is too early, just cut at limit
  const cutoff = lastSpace > limit / 2 ? lastSpace : limit;

  return text.slice(0, cutoff) + ellipsis;
}

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  // RFC 5322 compliant email regex
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

type AnyFunction = (...args: unknown[]) => unknown;

export function debounce<T extends AnyFunction>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}
