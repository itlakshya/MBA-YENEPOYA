// Client-side tracking utilities for merging URL + sessionStorage + cookies

import { TRACKING_COOKIES } from '@/types/tracking';

/**
 * Get cookie value by name (client-side)
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  }
  return null;
}

/**
 * Extract tracking parameters from URL
 */
function extractTrackingParamsFromUrl(url: string): Record<string, string> {
  try {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};
    
    // All possible tracking parameter keys
    const trackingKeys = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'utm_adgroup', 'utm_device', 'utm_region',
      'gclid', 'gbraid', 'wbraid', 'gad_source', 'gad_campaignid', 'campaignid',
      'fbclid', 'msclkid', 'ttclid', 'li_fat_id', 'twclid',
      // First-touch variants
      'first_utm_source', 'first_utm_medium', 'first_utm_campaign', 'first_utm_term', 
      'first_utm_content', 'first_utm_adgroup', 'first_utm_device', 'first_utm_region',
      'first_gclid', 'first_gbraid', 'first_wbraid', 'first_gad_source', 
      'first_gad_campaignid', 'first_campaignid', 'first_fbclid', 'first_msclkid', 
      'first_ttclid', 'first_li_fat_id', 'first_twclid'
    ];
    
    for (const key of trackingKeys) {
      const value = urlObj.searchParams.get(key);
      if (value) {
        params[key] = value;
      }
    }
    
    return params;
  } catch {
    return {};
  }
}

/**
 * Parse tracking parameters from cookie string
 */
function parseTrackingParamsFromCookie(cookieValue: string): Record<string, string> {
  try {
    const searchParams = new URLSearchParams(cookieValue);
    const params: Record<string, string> = {};
    
    for (const [key, value] of searchParams.entries()) {
      if (value) {
        params[key] = value;
      }
    }
    
    return params;
  } catch {
    return {};
  }
}

/**
 * Build canonical conversion URL with all tracking parameters merged
 */
export function buildCanonicalConversionUrl(
  currentUrl: string,
  sessionStorageKey: string = 'yenepoya_campaign_url'
): string {
  try {
    // Extract base URL (without query params)
    const baseUrl = currentUrl.split('?')[0];
    const url = new URL(baseUrl);
    
    // 1. Get tracking params from cookies (lowest precedence)
    const latestCookie = getCookie(TRACKING_COOKIES.LATEST);
    const firstTouchCookie = getCookie(TRACKING_COOKIES.FIRST_TOUCH);
    
    let allParams: Record<string, string> = {};
    
    // Add cookie params
    if (latestCookie) {
      const latestParams = parseTrackingParamsFromCookie(latestCookie);
      allParams = { ...allParams, ...latestParams };
    }
    
    if (firstTouchCookie) {
      const firstTouchParams = parseTrackingParamsFromCookie(firstTouchCookie);
      allParams = { ...allParams, ...firstTouchParams };
    }
    
    // 2. Get tracking params from sessionStorage (medium precedence)
    if (typeof window !== 'undefined') {
      const sessionUrl = window.sessionStorage.getItem(sessionStorageKey);
      if (sessionUrl) {
        const sessionParams = extractTrackingParamsFromUrl(sessionUrl);
        allParams = { ...allParams, ...sessionParams };
      }
    }
    
    // 3. Get tracking params from current URL (highest precedence)
    const currentParams = extractTrackingParamsFromUrl(currentUrl);
    allParams = { ...allParams, ...currentParams };
    
    // Add all merged params to the URL
    Object.entries(allParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
    
    return url.toString();
  } catch {
    return currentUrl;
  }
}

/**
 * Enhanced getCampaignPageUrl that merges all tracking sources
 */
export function getEnhancedCampaignPageUrl(
  landingPath: string = '/online-mba-course-yenepoyauniversity',
  sessionStorageKey: string = 'yenepoya_campaign_url'
): string {
  if (typeof window === 'undefined') return '';

  const currentUrl = window.location.href;
  
  try {
    // Build the canonical conversion URL with all tracking data merged
    const canonicalUrl = buildCanonicalConversionUrl(currentUrl, sessionStorageKey);
    
    // Check if we have any tracking parameters
    const url = new URL(canonicalUrl);
    const hasTrackingParams = url.searchParams.toString().length > 0;
    
    if (hasTrackingParams) {
      // Update sessionStorage with the merged URL
      window.sessionStorage.setItem(sessionStorageKey, canonicalUrl);
      return canonicalUrl;
    }
    
    // Fallback: check if we have stored campaign URL
    const stored = window.sessionStorage.getItem(sessionStorageKey);
    if (stored) {
      try {
        const storedUrl = new URL(stored);
        if (storedUrl.searchParams.toString().length > 0) {
          return stored;
        }
      } catch {
        // Invalid stored URL, remove it
        window.sessionStorage.removeItem(sessionStorageKey);
      }
    }
    
    // Final fallback: return clean landing page URL
    return `${window.location.origin}${landingPath}`;
  } catch {
    return `${window.location.origin}${landingPath}`;
  }
}