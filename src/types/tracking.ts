// UTM and tracking parameter types for LeadSquared integration

export interface UTMParameters {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  utm_adgroup?: string;
  utm_device?: string;
  utm_region?: string;
}

export interface FirstTouchUTMParameters {
  first_utm_source?: string;
  first_utm_medium?: string;
  first_utm_campaign?: string;
  first_utm_term?: string;
  first_utm_content?: string;
  first_utm_adgroup?: string;
  first_utm_device?: string;
  first_utm_region?: string;
}

export interface TrackingParameters extends UTMParameters {
  // Common click IDs
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  gad_source?: string;
  gad_campaignid?: string;
  campaignid?: string;
  fbclid?: string;
  msclkid?: string;
  ttclid?: string;
  li_fat_id?: string;
  twclid?: string;
}

export interface FirstTouchTrackingParameters extends FirstTouchUTMParameters {
  first_gclid?: string;
  first_gbraid?: string;
  first_wbraid?: string;
  first_gad_source?: string;
  first_gad_campaignid?: string;
  first_campaignid?: string;
  first_fbclid?: string;
  first_msclkid?: string;
  first_ttclid?: string;
  first_li_fat_id?: string;
  first_twclid?: string;
}

export interface AllTrackingParameters extends TrackingParameters, FirstTouchTrackingParameters {}

// LSQ attribute mapping for UTM parameters
export interface LSQUTMMapping {
  utm_source: 'mx_utm_source';
  utm_medium: 'mx_utm_medium';
  utm_campaign: 'mx_utm_campaign';
  utm_term: 'mx_utm_term';
  utm_content: 'mx_utm_content';
  utm_adgroup: 'mx_utm_adgroup';
  utm_device: 'mx_utm_device';
  utm_region: 'mx_utm_region';
  first_utm_source: 'mx_first_utm_source';
  first_utm_medium: 'mx_first_utm_medium';
  first_utm_campaign: 'mx_first_utm_campaign';
  first_utm_term: 'mx_first_utm_term';
  first_utm_content: 'mx_first_utm_content';
  first_utm_adgroup: 'mx_first_utm_adgroup';
  first_utm_device: 'mx_first_utm_device';
  first_utm_region: 'mx_first_utm_region';
}

// Cookie names for tracking
export const TRACKING_COOKIES = {
  LATEST: 'lsq_tp',
  FIRST_TOUCH: 'lsq_tp_first'
} as const;

// All tracking parameter keys
export const TRACKING_PARAM_KEYS: (keyof TrackingParameters)[] = [
  'utm_source',
  'utm_medium', 
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_adgroup',
  'utm_device',
  'utm_region',
  'gclid',
  'gbraid',
  'wbraid',
  'gad_source',
  'gad_campaignid',
  'campaignid',
  'fbclid',
  'msclkid',
  'ttclid',
  'li_fat_id',
  'twclid'
];

// First-touch parameter keys (with first_ prefix)
export const FIRST_TOUCH_PARAM_KEYS: (keyof FirstTouchTrackingParameters)[] = [
  'first_utm_source',
  'first_utm_medium',
  'first_utm_campaign', 
  'first_utm_term',
  'first_utm_content',
  'first_utm_adgroup',
  'first_utm_device',
  'first_utm_region',
  'first_gclid',
  'first_gbraid',
  'first_wbraid',
  'first_gad_source',
  'first_gad_campaignid',
  'first_campaignid',
  'first_fbclid',
  'first_msclkid',
  'first_ttclid',
  'first_li_fat_id',
  'first_twclid'
];

// LSQ attribute mapping
export const LSQ_UTM_ATTRIBUTE_MAP: Record<string, string> = {
  utm_source: 'mx_utm_source',
  utm_medium: 'mx_utm_medium',
  utm_campaign: 'mx_utm_campaign',
  utm_term: 'mx_utm_term',
  utm_content: 'mx_utm_content',
  utm_adgroup: 'mx_utm_adgroup',
  utm_device: 'mx_utm_device',
  utm_region: 'mx_utm_region',
  first_utm_source: 'mx_first_utm_source',
  first_utm_medium: 'mx_first_utm_medium',
  first_utm_campaign: 'mx_first_utm_campaign',
  first_utm_term: 'mx_first_utm_term',
  first_utm_content: 'mx_first_utm_content',
  first_utm_adgroup: 'mx_first_utm_adgroup',
  first_utm_device: 'mx_first_utm_device',
  first_utm_region: 'mx_first_utm_region'
};