import { after, NextRequest, NextResponse } from 'next/server';
import { buildLeadSquaredAttributes, sendLeadSquaredCaptureIfNeeded } from '@/utils/lsq';
import logger from '@/utils/logger';
import { ensureLeadsTable, query } from '@/utils/db';

const LANDING_PATH = '/online-mba-course-yenepoyauniversity';
const DEFAULT_SITE_ORIGIN = 'https://yenepoyaonline.com';
const MARKETING_PARAM_KEYS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'utm_id',
    'utm_source_platform',
    'utm_creative_format',
    'utm_marketing_tactic',
    'campaignid',
    'utm_adgroup',
    'adgroupid',
    'matchtype',
    'network',
    'device',
    'utm_device',
    'keyword',
    'utm_keyword',
    'placement',
    'utm_placement',
    'targetid',
    'loc_interest_ms',
    'loc_physical_ms',
    'creative',
    'adposition',
    'feeditemid',
    'gad_source',
    'gad_campaignid',
    'gclid',
    'gbraid',
    'wbraid',
    'fbclid',
    'msclkid',
    'ttclid',
    'twclid',
    'li_fat_id'
] as const;

const storeLead = async (params: {
    name?: string;
    email?: string;
    phone?: string;
    experience?: string;
    stage?: string;
    source?: string;
}) => {
    await ensureLeadsTable();
    await query(
        'INSERT INTO leads (name, email, phone, experience, stage, source) VALUES ($1, $2, $3, $4, $5, $6)',
        [params.name, params.email, params.phone, params.experience, params.stage || null, params.source || null]
    );
};

const resolveCampaignUrl = (params: {
    pageUrl?: string;
    referer?: string | null;
    siteOrigin: string;
}) => {
    const fallbackUrl = `${params.siteOrigin}${LANDING_PATH}`;
    const candidates = [params.pageUrl, params.referer];
    const buildCanonicalCampaignUrl = (input: URL) => {
        const base = new URL(LANDING_PATH, params.siteOrigin);
        const seen = new Set<string>();

        for (const key of MARKETING_PARAM_KEYS) {
            const values = input.searchParams.getAll(key);
            for (const rawValue of values) {
                const value = rawValue.trim();
                if (!value) continue;
                const dedupeKey = `${key}=${value}`;
                if (seen.has(dedupeKey)) continue;
                seen.add(dedupeKey);
                base.searchParams.append(key, value);
            }
        }

        return base.toString();
    };
    const hasCanonicalCampaignParams = (url: string) => {
        try {
            return new URL(url).searchParams.toString().length > 0;
        } catch {
            return false;
        }
    };

    for (const candidate of candidates) {
        if (!candidate) continue;

        try {
            const parsed = new URL(candidate, params.siteOrigin);
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                continue;
            }
            const canonicalUrl = buildCanonicalCampaignUrl(parsed);
            if (hasCanonicalCampaignParams(canonicalUrl)) {
                return canonicalUrl;
            }
        } catch {
            continue;
        }
    }

    return fallbackUrl;
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, phone, experience, stage, pageUrl } = body;

        const host = req.headers.get('host') || 'unknown';
        const protocol = req.headers.get('x-forwarded-proto') || 'https';
        const siteOrigin =
            process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
            (host === 'unknown' ? DEFAULT_SITE_ORIGIN : `${protocol}://${host}`);
        const conversionRefUrl = resolveCampaignUrl({
            pageUrl,
            referer: req.headers.get('referer'),
            siteOrigin
        });

        const attributes = buildLeadSquaredAttributes({
            name,
            email,
            mobile: phone,
            workExperience: experience,
            conversionRefUrl
        });

        if (!attributes) {
            return NextResponse.json({ success: false, error: 'Invalid phone number' }, { status: 400 });
        }

        after(async () => {
            try {
                await storeLead({ name, email, phone, experience, stage, source: conversionRefUrl });
            } catch (dbError) {
                logger.error(dbError as Error, 'Database Lead Storage Error');
            }

            try {
                await sendLeadSquaredCaptureIfNeeded(attributes);
            } catch (lsqError) {
                logger.error(lsqError as Error, 'LeadSquared Submission Error');
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        logger.error(error instanceof Error ? error : String(error), 'API Lead Submission Error');
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
