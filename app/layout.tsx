import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto_Slab, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/src/lib/utils";
import { Providers } from "@/src/components/providers";

const jetbrainsMonoHeading = JetBrains_Mono({subsets:['latin'],variable:'--font-heading'});

const robotoSlab = Roboto_Slab({subsets:['latin'],variable:'--font-serif'});

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Sentry — Phishing Email Detection",
    description: "Admin panel for phishing email detection and analysis",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-serif", robotoSlab.variable, jetbrainsMonoHeading.variable)}
        >
        <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}