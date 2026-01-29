import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Player from '@/models/Player';

export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const team = searchParams.get('team');

        const query = team ? { $or: [{ team }, { role: 'Admin' }] } : {};
        const players = await Player.find(query).sort({ number: 1 });

        return NextResponse.json({ success: true, players });
    } catch (error) {
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const body = await request.json();
        const player = await Player.create(body);
        return NextResponse.json({ success: true, player }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 400 });
    }
}
