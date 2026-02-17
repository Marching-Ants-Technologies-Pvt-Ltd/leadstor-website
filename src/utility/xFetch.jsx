"use client";

// Re-export auth-enhanced xFetch
export { xFetch, xDownload, useAuth, authService } from './auth';

// Legacy export for backward compatibility
export function jsonToQueryParams(json) {
  return Object.keys(json)
    .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(json[key]))
    .join("&");
}