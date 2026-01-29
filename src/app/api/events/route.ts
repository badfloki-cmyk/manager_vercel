import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const team = searchParams.get('team');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Support matching both team specific and "Both"
        const query: { team?: { $in: string[] }; date?: { $gte?: string; $lte?: string } } = {};
        if (team) {
            query.team = { $in: [team, 'Both'] };
        }

        // Add date range filter if provided
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = startDate;
            if (endDate) query.date.$lte = endDate;
        }

        const events = await Event.find(query).sort({ date: 1 });

        return NextResponse.json({ success: true, events });
    } catch {
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const body = await request.json();
        const event = await Event.create(body);
        return NextResponse.json({ success: true, event }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 400 });
    }
}
