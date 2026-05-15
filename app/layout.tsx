import type { Metadata } from "next";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xcelerate — Dynamic Spreadsheet Intelligence",
  description: "Turn chaos into clarity. UI-fy your spreadsheets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
