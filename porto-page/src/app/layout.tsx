import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sandya NW | Fullstack Web Developer Portfolio",
  description: "Explore Sandya NW's personal portfolio. View recent fullstack web development projects, professional work history, academic background, and industry certifications.",
  keywords: ["Sandya NW", "Fullstack Developer", "Portfolio", "Web Developer", "Next.js Portfolio", "React", "Express.js Developer", "Software Engineer"],
  authors: [{ name: "Sandya NW" }],
  creator: "Sandya NW",
  openGraph: {
    title: "Sandya NW | Fullstack Web Developer Portfolio",
    description: "Explore Sandya NW's personal portfolio. View recent fullstack web development projects, professional work history, academic background, and industry certifications.",
    type: "website",
    locale: "id_ID",
    url: "https://sandya.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sandya NW | Fullstack Web Developer Portfolio",
    description: "Explore Sandya NW's personal portfolio. View recent fullstack web development projects, professional work history, academic background, and industry certifications.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
