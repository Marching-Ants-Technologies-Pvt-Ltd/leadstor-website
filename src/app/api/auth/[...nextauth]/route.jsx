import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { hash, compare } from "bcrypt";
import { v4 as uuidv4 } from 'uuid';

const handeler = NextAuth({
    session: {
        strategy: 'jwt',
        maxAge: 1 * 24 * 60 * 60,
    },
    pages: {
        signIn: "/signin"
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "text"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            async authorize(credentials) {

                if (!credentials?.email || !credentials?.password) return null;

                const exisitingUser = await db.ls_auth.findUnique({
                    where: { email: credentials?.email }
                });

                if (!exisitingUser) return null;

                const passwordMatch = await compare(credentials.password, exisitingUser.password);

                if (!passwordMatch) return null;

                return {
                    id: `${exisitingUser.id}`,
                    uuid: exisitingUser.uuid,
                    name: exisitingUser.name,
                    email: exisitingUser.email,
                    image: ((exisitingUser.image.length < 1) ? `https://api.dicebear.com/5.x/initials/png?seed=${exisitingUser.name}&radius=50&size=100` : exisitingUser.image)
                }
            }
        })
    ],
    secret: process.env.JWT_SECRET,
    callbacks: {
        async signIn({ user, account, profile }) {

            console.log(`AuthPovider: ${account.provider}`);

            if (account.provider === "google") {

                if (profile.email_verified && profile.email.endsWith("@gmail.com")) {

                    const exisitingUser = await db.ls_auth.findUnique({
                        where: { email: profile?.email }
                    });

                    if (!exisitingUser) {

                        const hashedPassword = await hash(`${uuidv4()}`, 10);
                        const uniqueId = uuidv4();
                        const newAccount = await db.ls_auth.create({
                            data: {
                                uuid: uniqueId,
                                email: profile.email,
                                name: profile.name,
                                provider: 'GOOGLE',
                                password: hashedPassword,
                                image: profile.picture,
                                status: 1
                            }
                        });

                        return true;
                    }

                    return (exisitingUser.provider === 'GOOGLE');

                }

                return false;

            } else if (account.provider === 'facebook') {
                
                const exisitingUser = await db.ls_auth.findUnique({
                    where: { email: profile?.email }
                });

                if (!exisitingUser) {

                    const hashedPassword = await hash(`${uuidv4()}`, 10);
                    const newAccount = await db.ls_auth.create({
                        data: {
                            uuid: profile.id,
                            email: profile.email,
                            name: profile.name,
                            provider: 'FACEBOOK',
                            password: hashedPassword,
                            image: profile.picture.data.url,
                            status: 1
                        }
                    });

                    return true;
                }

                return (exisitingUser.provider === 'FACEBOOK');
            }

            return true;
        }

    }
});

export { handeler as GET, handeler as POST }