import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Player from '@/models/Player';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const body = await request.json();
        const player = await Player.findByIdAndUpdate(params.id, body, { new: true });

        if (!player) {
            return NextResponse.json({ success: false, message: 'Player not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, player });
    } catch (error) {
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 400 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const player = await Player.findByIdAndDelete(params.id);

        if (!player) {
            return NextResponse.json({ success: false, message: 'Player not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Player deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
