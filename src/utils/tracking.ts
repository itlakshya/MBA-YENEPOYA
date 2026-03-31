// UTM parameter tracking utilities for LeadSquared integration

import { 
  TrackingParameters, 
  FirstTouchTrackingParameters, 
  AllTrackingParameters,
  TRACKING_PARAM_KEYS, 
  FIRST_TOUCH_PARAM_KEYS,
  TRACKING_COOKIES 
} from '@/types/tracking';

/**
 * Extract tracking parameters from a URL
 */
export function extractTrackingParams(url: string): TrackingParameters {
  try {
    const urlObj = new URL(url);
    const params: TrackingParameters = {};
    
    for (const key of TRACKING_PARAM_KEYS) {
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
 * Extract first-touch tracking parameters from a URL
 */
export function extractFirstTouchParams(url: string): FirstTouchTrackingParameters {
  try {
    const urlObj = new URL(url);
    const params: FirstTouchTrackingParameters = {};
    
    for (const key of FIRST_TOUCH_PARAM_KEYS) {
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
 * Extract tracking parameters from Referer header
 */
export function extractTrackingParamsFromReferer(referer: string | null): TrackingParameters {
  if (!referer) return {};
  return extractTrackingParams(referer);
}

/**
 * Convert tracking parameters to URLSearchParams string (for cookie storage)
 */
export function trackingParamsToString(params: TrackingParameters | FirstTouchTrackingParameters): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });
  
  return searchParams.toString();
}

/**
 * Parse tracking parameters from URLSearchParams string (from cookie)
 */
export function parseTrackingParamsFromString(paramString: string): TrackingParameters {
  try {
    const decodedString = decodeURIComponent(paramString);
    const searchParams = new URLSearchParams(decodedString);
    const params: TrackingParameters = {};
    
    for (const key of TRACKING_PARAM_KEYS) {
      const value = searchParams.get(key);
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
 * Parse first-touch tracking parameters from URLSearchParams string (from cookie)
 */
export function parseFirstTouchParamsFromString(paramString: string): FirstTouchTrackingParameters {
  try {
    const decodedString = decodeURIComponent(paramString);
    const searchParams = new URLSearchParams(decodedString);
    const params: FirstTouchTrackingParameters = {};
    
    for (const key of FIRST_TOUCH_PARAM_KEYS) {
      const value = searchParams.get(key);
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
 * Merge tracking parameters with latest values taking precedence
 */
export function mergeTrackingParams(...paramSets: TrackingParameters[]): TrackingParameters {
  return Object.assign({}, ...paramSets);
}

/**
 * Merge first-touch tracking parameters with latest values taking precedence
 */
export function mergeFirstTouchParams(...paramSets: FirstTouchTrackingParameters[]): FirstTouchTrackingParameters {
  return Object.assign({}, ...paramSets);
}

/**
 * Build canonical conversion URL with tracking parameters
 */
export function buildConversionUrl(
  baseUrl: string, 
  trackingParams: TrackingParameters,
  firstTouchParams: FirstTouchTrackingParameters = {}
): string {
  try {
    const url = new URL(baseUrl);
    
    // Add current tracking params
    Object.entries(trackingParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
    
    // Add first-touch params (they won't overwrite current params due to different keys)
    Object.entries(firstTouchParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
    
    return url.toString();
  } catch {
    return baseUrl;
  }
}

/**
 * Check if tracking parameters exist in a URL or param object
 */
export function hasTrackingParams(urlOrParams: string | TrackingParameters): boolean {
  if (typeof urlOrParams === 'string') {
    const params = extractTrackingParams(urlOrParams);
    return Object.keys(params).length > 0;
  }
  return Object.keys(urlOrParams).length > 0;
}

/**
 * Convert regular UTM params to first-touch UTM params by adding 'first_' prefix
 */
export function convertToFirstTouchParams(params: TrackingParameters): FirstTouchTrackingParameters {
  const firstTouchParams: FirstTouchTrackingParameters = {};
  
  Object.entries(params).forEach(([key, value]) => {
    if (value && key.startsWith('utm_')) {
      const firstTouchKey = `first_${key}` as keyof FirstTouchTrackingParameters;
      firstTouchParams[firstTouchKey] = value;
    } else if (value && ['gclid', 'gbraid', 'wbraid', 'gad_source', 'gad_campaignid', 'campaignid', 'fbclid', 'msclkid', 'ttclid', 'li_fat_id', 'twclid'].includes(key)) {
      const firstTouchKey = `first_${key}` as keyof FirstTouchTrackingParameters;
      firstTouchParams[firstTouchKey] = value;
    }
  });
  
  return firstTouchParams;
}

/**
 * Get cookie options for tracking cookies
 */
export function getTrackingCookieOptions() {
  return {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: false, // Allow client-side access for sessionStorage merging
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/'
  };
}

/**
 * Client-side utility to merge current URL + sessionStorage + cookies
 */
export function mergeAllTrackingData(
  currentUrl: string,
  sessionStorageKey: string = 'yenepoya_campaign_url',
  latestCookie?: string,
  firstTouchCookie?: string
): { 
  conversionUrl: string; 
  trackingParams: TrackingParameters; 
  firstTouchParams: FirstTouchTrackingParameters 
} {
  // Extract from current URL
  const currentParams = extractTrackingParams(currentUrl);
  
  // Extract from sessionStorage
  let sessionParams: TrackingParameters = {};
  if (typeof window !== 'undefined') {
    const sessionUrl = window.sessionStorage.getItem(sessionStorageKey);
    if (sessionUrl) {
      sessionParams = extractTrackingParams(sessionUrl);
    }
  }
  
  // Extract from cookies
  const latestCookieParams = latestCookie ? parseTrackingParamsFromString(latestCookie) : {};
  const firstTouchCookieParams = firstTouchCookie ? parseFirstTouchParamsFromString(firstTouchCookie) : {};
  
  // Merge tracking params (current URL takes precedence)
  const mergedTrackingParams = mergeTrackingParams(latestCookieParams, sessionParams, currentParams);
  
  // Build conversion URL
  const baseUrl = currentUrl.split('?')[0];
  const conversionUrl = buildConversionUrl(baseUrl, mergedTrackingParams, firstTouchCookieParams);
  
  return {
    conversionUrl,
    trackingParams: mergedTrackingParams,
    firstTouchParams: firstTouchCookieParams
  };
}