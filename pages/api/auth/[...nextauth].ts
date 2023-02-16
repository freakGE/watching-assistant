import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import clientPromise from "@/lib/mongodb";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import bcryptOperation from "@/lib/Bcrypt";

const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      type: "credentials",
      credentials: {
        password: { label: "password", type: "password" },
        email: { label: "email", type: "email" },
      },
      async authorize(credentials, req) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        const client = await clientPromise;

        const users = await client
          .db(process.env.MONGODB_DB)
          .collection("users");

        const result = await users.findOne({
          email,
        });
        //Not found - send error res
        if (!result) {
          console.error("No user found with this email");
          throw new Error(
            JSON.stringify({
              message: "No user found with this email",
              cause: "email",
            })
          );
        }

        const checkPassword = await bcryptOperation(
          { type: "compare", password },
          result.password
        );

        if (!checkPassword) {
          console.error("Password doesn't match");
          throw new Error(
            JSON.stringify({
              message: "Password doesn't match",
              cause: "password",
            })
          );
        }

        console.table({
          id: result._id.toString(),
          email: result.email,
          name: result.name,
          password: result.password,
        });
        return {
          id: result._id.toString(),
          email: result.email,
          name: result.name,
          password: result.password,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    secret: process.env.JWT_SECRET,
    maxAge: 60 * 60 * 24 * 30,
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    async redirect({ url, baseUrl }) {
      // if (url.startsWith("/")) return `${baseUrl}${url}`;
      // else if (new URL(url).origin === baseUrl) return url;
      // return baseUrl;
      //!
      // return baseUrl;
      return process.env.NEXTAUTH_URL;
    },
    async session({ session, token, user }) {
      (session.user as { id: string | undefined }).id = token.sub;
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  // secret: process.env.JWT_SECRET,
  //!
  // secret: process.env.NEXTAUTH_SECRET,
  // jwt: {
  //   secret: process.env.JWT_SECRET,
  //   maxAge: 60 * 60 * 24 * 30,
  // },
  //!
  pages: {
    signIn: "/auth/signin",
    // signOut: "/auth/signout",
    error: "/",
  },
};

export default NextAuth(authOptions);
