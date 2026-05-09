import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateAnonymousAlias } from "@/utils/anonymous";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify-email",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          emailVerified: new Date(),
          role: "STUDENT",
          anonymousAlias: generateAnonymousAlias(),
          anonymousSeed: crypto.randomUUID(),
          isBanned: false,
        };
      },
    }),
    Credentials({
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) return null;
        if (user.isBanned) throw new Error("Account suspended");
        if (!user.emailVerified) throw new Error("EmailNotVerified");

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          anonymousAlias: user.anonymousAlias,
          isBanned: user.isBanned,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "STUDENT";
        token.anonymousAlias = (user as any).anonymousAlias;
        token.isBanned = (user as any).isBanned || false;
        token.emailVerified = (user as any).emailVerified || null;
      }

      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.anonymousAlias = token.anonymousAlias as string;
        session.user.isBanned = token.isBanned as boolean;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
    async signIn({ user, account }) {
      // For OAuth providers, create anonymous alias if missing
      if (account?.provider !== "credentials") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          // User will be created by adapter - we need to set anonymousAlias
          // This is handled in the Google profile callback above
        } else if (!existingUser.anonymousAlias) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              anonymousAlias: generateAnonymousAlias(),
              anonymousSeed: crypto.randomUUID(),
            },
          });
        }
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // Ensure every new user has an anonymous alias
      if (!(user as any).anonymousAlias) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            anonymousAlias: generateAnonymousAlias(),
            anonymousSeed: crypto.randomUUID(),
          },
        });
      }
    },
  },
});
