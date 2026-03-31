import { NextRequest, NextResponse } from 'next/server';
import { 
  extractTrackingParams, 
  extractTrackingParamsFromReferer,
  extractFirstTouchParams,
  trackingParamsToString,
  mergeTrackingParams,
  convertToFirstTouchParams,
  getTrackingCookieOptions,
  hasTrackingParams
} from '@/utils/tracking';
import { TRACKING_COOKIES } from '@/types/tracking';

export default function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const url = request.url;
  const referer = request.headers.get('referer');
  
  // Extract tracking parameters from current URL
  const currentParams = extractTrackingParams(url);
  
  // Extract tracking parameters from Referer header when useful
  const refererParams = extractTrackingParamsFromReferer(referer);
  
  // Extract first-touch parameters from current URL (if any have first_ prefix)
  const currentFirstTouchParams = extractFirstTouchParams(url);
  
  // Get existing cookies
  const existingLatestCookie = request.cookies.get(TRACKING_COOKIES.LATEST)?.value;
  const existingFirstTouchCookie = request.cookies.get(TRACKING_COOKIES.FIRST_TOUCH)?.value;
  
  // Merge current params with referer params (current takes precedence)
  const mergedCurrentParams = mergeTrackingParams(refererParams, currentParams);
  
  // Handle latest tracking parameters cookie
  if (hasTrackingParams(mergedCurrentParams)) {
    // Get existing latest params from cookie
    let existingLatestParams = {};
    if (existingLatestCookie) {
      try {
        const decodedCookie = decodeURIComponent(existingLatestCookie);
        const searchParams = new URLSearchParams(decodedCookie);
        existingLatestParams = Object.fromEntries(searchParams.entries());
      } catch {
        // Ignore cookie parsing errors
      }
    }
    
    // Merge existing with current (current overwrites)
    const finalLatestParams = { ...existingLatestParams, ...mergedCurrentParams };
    
    // Set latest tracking cookie
    const latestParamString = trackingParamsToString(finalLatestParams);
    if (latestParamString) {
      response.cookies.set(
        TRACKING_COOKIES.LATEST,
        encodeURIComponent(latestParamString),
        getTrackingCookieOptions()
      );
    }
  }
  
  // Handle first-touch tracking parameters cookie
  // Only set if not already present
  if (!existingFirstTouchCookie) {
    let firstTouchParamsToSet = currentFirstTouchParams;
    
    // If no explicit first-touch params in URL, convert current UTM params to first-touch
    if (Object.keys(currentFirstTouchParams).length === 0 && hasTrackingParams(mergedCurrentParams)) {
      firstTouchParamsToSet = convertToFirstTouchParams(mergedCurrentParams);
    }
    
    if (Object.keys(firstTouchParamsToSet).length > 0) {
      const firstTouchParamString = trackingParamsToString(firstTouchParamsToSet);
      if (firstTouchParamString) {
        response.cookies.set(
          TRACKING_COOKIES.FIRST_TOUCH,
          encodeURIComponent(firstTouchParamString),
          getTrackingCookieOptions()
        );
      }
    }
  } else {
    // If first-touch cookie exists, but we have explicit first-touch params in URL, merge them
    if (Object.keys(currentFirstTouchParams).length > 0) {
      try {
        const decodedCookie = decodeURIComponent(existingFirstTouchCookie);
        const searchParams = new URLSearchParams(decodedCookie);
        const existingFirstTouchParams = Object.fromEntries(searchParams.entries());
        
        // Merge existing with current first-touch params (current overwrites)
        const mergedFirstTouchParams = { ...existingFirstTouchParams, ...currentFirstTouchParams };
        
        const firstTouchParamString = trackingParamsToString(mergedFirstTouchParams);
        if (firstTouchParamString) {
          response.cookies.set(
            TRACKING_COOKIES.FIRST_TOUCH,
            encodeURIComponent(firstTouchParamString),
            getTrackingCookieOptions()
          );
        }
      } catch {
        // If parsing fails, just set the current first-touch params
        const firstTouchParamString = trackingParamsToString(currentFirstTouchParams);
        if (firstTouchParamString) {
          response.cookies.set(
            TRACKING_COOKIES.FIRST_TOUCH,
            encodeURIComponent(firstTouchParamString),
            getTrackingCookieOptions()
          );
        }
      }
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};