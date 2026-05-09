import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: "Campus Echo — Anonymous Student Voice Platform",
    template: "%s | Campus Echo",
  },
  description:
    "An anonymous bridge between students and administration. Share complaints, suggestions, and feedback safely.",
  keywords: ["anonymous", "student", "feedback", "campus", "complaints", "administration"],
  authors: [{ name: "Campus Echo" }],
  creator: "Campus Echo",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Campus Echo",
    description: "Your anonymous voice on campus",
    siteName: "Campus Echo",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
