import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error("CRITICAL: BLOB_READ_WRITE_TOKEN is missing!");
        return NextResponse.json({ error: 'Vercel Blob Token fehlt in den Environment Variables.' }, { status: 500 });
    }

    if (!filename || !request.body) {
        return NextResponse.json({ error: 'Filename and body are required' }, { status: 400 });
    }

    try {
        console.log("Processing upload for filename:", filename);
        const blob = await put(filename, request.body, {
            access: 'public',
        });

        console.log("Blob created successfully:", blob.url);
        return NextResponse.json(blob);
    } catch (error) {
        console.error("Vercel Blob Upload Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
