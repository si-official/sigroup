import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SI Group",
  description: "SI Group – sigroup.com.bd",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
