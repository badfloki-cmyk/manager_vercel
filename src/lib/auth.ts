
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Passwort", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                await connectDB();

                // Specific requirements: morelli.maurizio@kgs-pattensen.de with Unhack85!$
                // Initial Seed logic
                const adminEmail = "morelli.maurizio@kgs-pattensen.de";
                const adminPass = "Unhack85!$";

                let user = await User.findOne({ email: credentials.email });

                // Auto-seed main admin if it doesn't exist
                if (!user && credentials.email === adminEmail) {
                    const hashedPassword = await bcrypt.hash(adminPass, 10);
                    user = await User.create({
                        email: adminEmail,
                        password: hashedPassword,
                        role: "admin",
                        name: "Maurizio Morelli",
                    });
                }

                if (!user) return null;

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordCorrect) return null;

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.image = user.image;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.image = token.image as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
