import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
    try {
        await connectDB();
        const messages = await Message.find({}).sort({ createdAt: -1 }).limit(50);
        return NextResponse.json({ messages });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { content, type, team, pinned } = await req.json();
        await connectDB();

        const newMessage = await Message.create({
            author: session.user?.name,
            authorEmail: session.user?.email,
            content,
            type: type || 'general',
            team: team || 'Alle',
            pinned: pinned || false,
        });

        return NextResponse.json(newMessage);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
    }
}
