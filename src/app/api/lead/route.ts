import { NextRequest, NextResponse } from 'next/server';
import { buildLeadSquaredAttributes, sendLeadSquaredCaptureIfNeeded } from '@/utils/lsq';
import logger from '@/utils/logger';
import { query } from '@/utils/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, phone, experience, stage } = body;

        const host = req.headers.get('host') || 'unknown';
        const protocol = req.headers.get('x-forwarded-proto') || 'https';
        const domainUrl = `${protocol}://${host}`;

        if (stage !== 'initial') {
            // Store in Database only on final submission
            try {
                await query(`
                    CREATE TABLE IF NOT EXISTS leads (
                        id SERIAL PRIMARY KEY,
                        name TEXT,
                        email TEXT,
                        phone TEXT,
                        experience TEXT,
                        source TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                
                await query(
                    'INSERT INTO leads (name, email, phone, experience, source) VALUES ($1, $2, $3, $4, $5)',
                    [name, email, phone, experience, domainUrl]
                );
            } catch (dbError) {
                logger.error(dbError as Error, 'Database Lead Storage Error');
                // Continue even if DB fails so LSQ might still work
            }
        }

        const attributes = buildLeadSquaredAttributes({
            name,
            email,
            mobile: phone,
            eduQualificationName: experience,
            source: domainUrl
        });

        if (attributes) {
            await sendLeadSquaredCaptureIfNeeded(attributes);
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: 'Invalid phone number' }, { status: 400 });
        }
    } catch (error: any) {
        logger.error(error, 'API Lead Submission Error');
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
