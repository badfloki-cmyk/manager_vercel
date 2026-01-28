import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Prevent deleting yourself
        if ((session.user as any).id === params.id) {
            return NextResponse.json({ error: "Du kannst deinen eigenen Account nicht löschen" }, { status: 400 });
        }

        const user = await User.findByIdAndDelete(params.id);

        if (!user) {
            return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Benutzer gelöscht' });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
}
