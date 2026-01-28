import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tactic from '@/models/Tactic';

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
