import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const { playerId, status } = await request.json();

        const event = await Event.findById(params.id);
        if (!event) {
            return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
        }

        const attendanceIndex = event.attendance.findIndex(
            (a: any) => a.player.toString() === playerId
        );

        if (attendanceIndex > -1) {
            event.attendance[attendanceIndex].status = status;
        } else {
            event.attendance.push({ player: playerId, status });
        }

        await event.save();
        return NextResponse.json({ success: true, event });
    } catch (error) {
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 400 });
    }
}
