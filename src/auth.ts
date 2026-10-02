import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";
import { isAdminEmail } from "@/lib/admin-access";
import { credentialsSchema } from "@/lib/commerce-validations";

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: { signIn: "/account/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 14 },
  providers: [
    Credentials({
      credentials: {
        email: { type: "email", label: "Email address" },
        password: { type: "password", label: "Password" },
      },
      async authorize(credentials) {
        const parsedCredentials = credentialsSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
        });
        if (!parsedCredentials.success) return null;

        await connectToDatabase();
        const user = await User.findOne({ email: parsedCredentials.data.email })
          .select("+passwordHash")
          .exec();

        if (!user || (user.lockedUntil && user.lockedUntil.getTime() > Date.now())) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(parsedCredentials.data.password, user.passwordHash);
        if (!passwordMatches) {
          user.failedLoginAttempts += 1;
          if (user.failedLoginAttempts >= 5) {
            user.failedLoginAttempts = 0;
            user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
          }
          await user.save();
          return null;
        }

        user.failedLoginAttempts = 0;
        user.lockedUntil = undefined;
        user.role = isAdminEmail(user.email) ? "admin" : "customer";
        await user.save();

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.userId) session.user.id = String(token.userId);
      if (session.user && (token.role === "admin" || token.role === "customer")) {
        session.user.role = token.role;
      }
      return session;
    },
  },
});