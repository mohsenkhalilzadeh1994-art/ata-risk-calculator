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
  title: "ATA 2025 Risk Calculator",
  description: "Educational and clinical decision-support use only.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <footer className=" border-zinc-200 bg-zinc-50">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-zinc-600 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <strong className="text-zinc-800">
                ATA 2025 Risk Calculator
              </strong>{" "}
              Developed at Ege University, Department of Nuclear Medicine by M.
              Khalilzadeh.
            </div>

            <div>
              Contact:{" "}
              <a
                href="mailto:mohsenkhalilzadeh1994@gmail.com"
                className="text-indigo-600 hover:underline"
              >
                atariskcalculator@gmail.com
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
