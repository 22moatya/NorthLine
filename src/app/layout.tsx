import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Fraunces } from "next/font/google";
import { auth } from "@/auth";
import CommerceShell from "@/components/commerce/CommerceShell";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Northline Market | Considered everyday goods",
  description: "A thoughtful edit of useful things for home, work, and everywhere in between.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <CommerceShell
          user={session?.user ? { name: session.user.name ?? null, email: session.user.email ?? null, role: session.user.role } : null}
        >
          {children}
        </CommerceShell>
      </body>
    </html>
  );
}
