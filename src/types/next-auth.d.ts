import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "customer" | "admin";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "customer" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: "customer" | "admin";
  }
}