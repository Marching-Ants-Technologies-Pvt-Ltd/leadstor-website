import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import oauth from "@/lib/conceptninjas/oauth";
import { error } from "console";

let currentUser = {};
const handler = NextAuth({
    session: {
        strategy: 'jwt',
        maxAge: 1 * 24 * 60 * 60,
    },
    pages: {
        signIn: "/signin",
        error: '/signin'
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
                    type: "email"
                },
                password: {
                    label: "Password",
                    type: "password"
                },
                first_name: {
                    label: "First Name",
                    type: "text"
                },
                last_name: {
                    label: "Last Name",
                    type: "text"
                }
            },
            async authorize(credentials) {

                if (!credentials?.email || !credentials?.password) return null;
                return true;
            }
        })
    ],
    secret: process.env.JWT_SECRET,
    callbacks: {

        async session({ session }) {

            if (Object.keys(currentUser).length > 0) {
                session.user._id = currentUser.id;
                session.user.uuid = currentUser.uuid;
                session.user.name = currentUser.name;
                session.user.email = currentUser.email;
                session.user.image = currentUser.image;
                session.user.cn_token = currentUser.api_token;
                session.user.auth_provider = currentUser.auth_provider;
            }
            return session;
        },

        async signIn({ account, credentials, profile }) {

            if (account.provider === "credentials") {

                const response = await oauth({
                    email: credentials.email,
                    password: credentials.password,
                    first_name: credentials.first_name??'',
                    last_name: credentials.last_name??'',
                    auth_provider: 'EMAIL'
                });

                if (response.error) {
                    throw new Error(JSON.stringify(response));
                }

                currentUser = response;
                currentUser.auth_provider = 'Email';
                return true;
            }

            if (account.provider === "google" && profile.email_verified) {
                
                const response = await oauth({
                    email: profile.email,
                    uuid: profile.sub,
                    first_name: profile.given_name,
                    last_name: profile.family_name,
                    image: profile.picture,
                    auth_provider: 'GOOGLE'
                });

                if (response.error) {
                    throw new Error(JSON.stringify(response));
                }

                currentUser = response;
                currentUser.auth_provider = 'Google';
                return true;
            }

            if (account.provider === 'facebook') {
                //Braking name into first & last name
                let name_array = profile.name.split(' ');
                let f_name = name_array[0];
                name_array.shift();
                let l_name = name_array.join(' ');

                const response = await oauth({
                    email: profile.email,
                    uuid: profile.id,
                    first_name: f_name,
                    last_name: l_name,
                    image: profile.picture?.data?.url??'',
                    auth_provider: 'FACEBOOK'
                });

                if (response.error) {
                    throw new Error(JSON.stringify(response));
                }

                currentUser = response;
                currentUser.auth_provider = 'Facebook';
                return true;
            }

            return false;
        }

    }
});

export { handler as GET, handler as POST }