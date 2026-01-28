import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tactic from '@/models/Tactic';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const tactic = await Tactic.findByIdAndUpdate(id, body, { new: true });
        if (!tactic) {
            return NextResponse.json({ error: 'Tactic not found' }, { status: 404 });
        }
        return NextResponse.json(tactic);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        await Tactic.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Tactic deleted' });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
