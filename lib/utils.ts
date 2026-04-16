import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names with tailwind-merge and clsx
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

/**
 * Resolves the full image URL.
 * If the path is relative, it prepends availability base URL.
 * 
 * @param relativePath - The image path (can be string, null, undefined, or any other type)
 * @returns Full image URL or empty string if invalid
 */
export const getFullImageUrl = (relativePath: unknown): string => {
    // Handle null, undefined, or non-string values
    if (!relativePath || typeof relativePath !== 'string') {
        return '';
    }

    // Trim whitespace
    const path = relativePath.trim();
    if (!path) {
        return '';
    }

    // If already an absolute URL, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Construct full URL with base URL from environment variable
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL_IMAGE || '';
    
    // Ensure proper slash handling
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const normalizedBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    
    return `${normalizedBaseUrl}${normalizedPath}`;
};