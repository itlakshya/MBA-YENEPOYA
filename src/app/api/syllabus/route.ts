import { NextResponse } from 'next/server';

const SYLLABUS_URL = 'https://lakshyacommerce.s3.ap-south-1.amazonaws.com/MBA+Yenepoya.pdf';

export async function GET() {
  try {
    const response = await fetch(SYLLABUS_URL, {
      cache: 'force-cache',
      next: { revalidate: 86400 },
    });

    if (!response.ok || !response.body) {
      return NextResponse.redirect(SYLLABUS_URL);
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/pdf',
        'Content-Disposition': 'attachment; filename="MBA-Yenepoya.pdf"',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch {
    return NextResponse.redirect(SYLLABUS_URL);
  }
}
