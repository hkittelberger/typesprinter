import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "typesprinter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-orange-100 text-gray-900">
        {children}
      </body>
    </html>
  );
}
