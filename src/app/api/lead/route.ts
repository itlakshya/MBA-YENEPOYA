import { after, NextRequest, NextResponse } from 'next/server';
import { buildLeadSquaredAttributes, sendLeadSquaredCaptureIfNeeded } from '@/utils/lsq';
import logger from '@/utils/logger';
import { ensureLeadsTable, query } from '@/utils/db';

const storeLead = async (params: {
    name?: string;
    email?: string;
    phone?: string;
    experience?: string;
    source: string;
}) => {
    await ensureLeadsTable();
    await query(
        'INSERT INTO leads (name, email, phone, experience, source) VALUES ($1, $2, $3, $4, $5)',
        [params.name, params.email, params.phone, params.experience, params.source]
    );
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, phone, experience, stage } = body;

        const host = req.headers.get('host') || 'unknown';
        const protocol = req.headers.get('x-forwarded-proto') || 'https';
        const domainUrl = `${protocol}://${host}`;

        const attributes = buildLeadSquaredAttributes({
            name,
            email,
            mobile: phone,
            workExperience: experience,
            source: domainUrl
        });

        if (!attributes) {
            return NextResponse.json({ success: false, error: 'Invalid phone number' }, { status: 400 });
        }

        after(async () => {
            if (stage !== 'initial') {
                try {
                    await storeLead({ name, email, phone, experience, source: domainUrl });
                } catch (dbError) {
                    logger.error(dbError as Error, 'Database Lead Storage Error');
                }
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
