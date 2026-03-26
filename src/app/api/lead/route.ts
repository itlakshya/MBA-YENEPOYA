import { after, NextRequest, NextResponse } from 'next/server';
import { buildLeadSquaredAttributes, sendLeadSquaredCaptureIfNeeded } from '@/utils/lsq';
import logger from '@/utils/logger';
import { ensureLeadsTable, query } from '@/utils/db';

const LANDING_PATH = '/online-mba-course-yenepoyauniversity';
const DEFAULT_SITE_ORIGIN = 'https://yenepoyaonline.com';

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

    for (const candidate of candidates) {
        if (!candidate) continue;

        try {
            const parsed = new URL(candidate, params.siteOrigin);
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                continue;
            }
            return parsed.toString();
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
