import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { DM_Sans, Fraunces } from "next/font/google";
import { auth } from "@/auth";
import CommerceShell from "@/components/commerce/CommerceShell";
import { getSiteSettings } from "@/lib/site-settings";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { storeName } = await getSiteSettings();
  return {
    title: {
      default: `${storeName} | Considered everyday goods`,
      template: `%s | ${storeName}`,
    },
    description: `A thoughtful edit of useful things for home, work, and everywhere in between at ${storeName}.`,
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [session, settings] = await Promise.all([auth(), getSiteSettings()]);
  const themeStyle: CSSProperties & Record<"--ink" | "--accent" | "--accent-deep" | "--canvas", string> = {
    "--ink": settings.primaryColor,
    "--accent": settings.accentColor,
    "--accent-deep": settings.accentColor,
    "--canvas": settings.backgroundColor,
  };

  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable} h-full antialiased`} style={themeStyle}>
      <body className="min-h-full flex flex-col">
        <CommerceShell
          user={session?.user ? { name: session.user.name ?? null, email: session.user.email ?? null, role: session.user.role } : null}
          settings={settings}
        >
          {children}
        </CommerceShell>
      </body>
    </html>
  );
}
