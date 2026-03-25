import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names with tailwind-merge and clsx
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Resolves the full image URL.
 * If the path is relative, it prepends availability base URL.
 */
export const getFullImageUrl = (relativePath: string | null | undefined): string => {
    if (!relativePath) return '';

    // If already an absolute URL, return as-is
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath;
    }

    // Construct full URL with base URL from environment variable
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL_IMAGE || '';
    return `${BASE_URL}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
};
