# LeadSquared UTM Tracking Implementation

## Overview

This implementation adds comprehensive UTM parameter tracking to the MBA-YENEPOYA project, capturing both **first-touch** and **latest-touch** UTM parameters as separate fields in LeadSquared, while maintaining the existing conversion URL functionality.

## Key Features

✅ **Full conversion URL** stored in `mx_Conversion_Ref_URL`  
✅ **Separate UTM fields** for current and first-touch parameters  
✅ **Proxy-based tracking** with cookie persistence  
✅ **Client-side merging** of URL + sessionStorage + cookies  
✅ **Next.js 16+ compatible** with proper cookie handling  
✅ **Backward compatible** with existing functionality  

## Architecture

### 1. Proxy (`src/proxy.ts`)
- **Edge-level tracking** on each request using Next.js 16+ proxy convention
- **Cookie management** for latest and first-touch parameters
- **Referer header processing** for cross-domain tracking
- **Automatic parameter extraction** from URLs

**Cookies Created:**
- `lsq_tp` - Latest tracking parameters (URLSearchParams format)
- `lsq_tp_first` - First-touch tracking parameters (set only once)

### 2. Type Definitions (`src/types/tracking.ts`)
- **TypeScript interfaces** for all tracking parameters
- **LSQ attribute mapping** for field names
- **Cookie constants** and parameter keys
- **Type safety** throughout the application

### 3. Tracking Utilities (`src/utils/tracking.ts`)
- **Parameter extraction** from URLs and cookies
- **Data merging** with precedence rules
- **URL building** with canonical format
- **Cookie encoding/decoding** with error handling

### 4. Client-side Integration (`src/utils/client-tracking.ts`)
- **Browser-specific utilities** for cookie access
- **SessionStorage merging** with URL parameters
- **Enhanced campaign URL building** with all sources
- **Fallback handling** for missing data

### 5. LeadSquared Integration (`src/utils/lsq.ts`)
- **Enhanced attribute builder** with UTM field mapping
- **Multi-source parameter parsing** (URL → cookies → fallback)
- **Separate field mapping** for all UTM parameters
- **Backward compatibility** with existing fields

### 6. API Route Updates (`src/app/api/lead/route.ts`)
- **Cookie reading** with Next.js 16+ compatibility
- **Parameter passing** to LSQ functions
- **Enhanced source URL** handling
- **Graceful fallbacks** to existing logic

### 7. Client Form Updates (`src/app/page.tsx`)
- **Enhanced URL building** with merged tracking data
- **Dual URL sending** (pageUrl + sourceUrl)
- **Backward compatibility** maintained

## UTM Parameter Mapping

### Latest Touch Parameters → LSQ Fields
```
utm_source     → mx_utm_source
utm_medium     → mx_utm_medium  
utm_campaign   → mx_utm_campaign
utm_term       → mx_utm_term
utm_content    → mx_utm_content
utm_adgroup    → mx_utm_adgroup
utm_device     → mx_utm_device
utm_region     → mx_utm_region
```

### First Touch Parameters → LSQ Fields
```
first_utm_source     → mx_first_utm_source
first_utm_medium     → mx_first_utm_medium
first_utm_campaign   → mx_first_utm_campaign
first_utm_term       → mx_first_utm_term
first_utm_content    → mx_first_utm_content
first_utm_adgroup    → mx_first_utm_adgroup
first_utm_device     → mx_first_utm_device
first_utm_region     → mx_first_utm_region
```

### Additional Click IDs Supported
- `gclid`, `gbraid`, `wbraid` (Google)
- `gad_source`, `gad_campaignid`, `campaignid` (Google Ads)
- `fbclid` (Facebook)
- `msclkid` (Microsoft)
- `ttclid` (TikTok)
- `li_fat_id` (LinkedIn)
- `twclid` (Twitter)

## Data Flow

### 1. First Visit
```
User lands with UTMs → Proxy extracts params → Sets cookies:
- lsq_tp (latest)
- lsq_tp_first (first-touch, only if not exists)
```

### 2. Subsequent Visits
```
User returns → Proxy updates lsq_tp → Preserves lsq_tp_first
```

### 3. Form Submission
```
Client merges: Current URL + SessionStorage + Cookies → sourceUrl
API reads: Cookies → trackingParams + firstTrackingParams
LSQ builds: All UTM fields + mx_Conversion_Ref_URL
```

### 4. Parameter Precedence (Highest to Lowest)
1. **Current URL parameters** (real-time)
2. **SessionStorage parameters** (session-based)
3. **Cookie parameters** (persistent)

## Implementation Details

### Cookie Management
- **30-day expiration** for persistence
- **URL-encoded** parameter strings
- **Secure/SameSite** for production
- **Client-accessible** for sessionStorage merging

### Error Handling
- **Graceful fallbacks** for parsing errors
- **Empty parameter filtering** before LSQ submission
- **Backward compatibility** if new features fail

### Performance Considerations
- **Edge proxy** for minimal latency
- **Efficient parameter extraction** with Set deduplication
- **Minimal client-side processing**

## Testing

### Build Status
✅ **TypeScript compilation** successful  
✅ **Next.js build** successful  
✅ **No linter errors** detected  

### Test Scenarios
1. **New user with UTMs** → Both first-touch and latest cookies set
2. **Returning user with new UTMs** → Latest updated, first-touch preserved  
3. **Form submission** → All parameters correctly mapped to LSQ fields
4. **Missing parameters** → Graceful fallbacks to existing logic

## Migration Notes

### Backward Compatibility
- **Existing functionality preserved** - all current features work unchanged
- **Gradual rollout possible** - can be enabled/disabled per environment
- **Database schema unchanged** - no migrations required

### Environment Variables
No new environment variables required. Uses existing LSQ configuration:
- `ENABLE_LSQ_SYNC`
- `LSQ_HOST`, `LSQ_ACCESS_KEY`, `LSQ_SECRET_KEY`

## Monitoring & Debugging

### Logging
- **Error logging** for LSQ submission failures
- **Warning logging** for configuration issues
- **No debug logging** in production (per requirements)

### Verification
1. Check **browser cookies** (`lsq_tp`, `lsq_tp_first`)
2. Verify **LSQ fields** in LeadSquared dashboard
3. Monitor **mx_Conversion_Ref_URL** for complete tracking data

## Next Steps

1. **Deploy to staging** for testing
2. **Verify LSQ field mapping** in dashboard
3. **Test cross-domain scenarios** if applicable
4. **Monitor performance** and error rates
5. **Consider analytics integration** for reporting

---

**Implementation completed successfully** ✅  
**Build status**: Passing ✅  
**Backward compatibility**: Maintained ✅  
**Type safety**: Full TypeScript coverage ✅