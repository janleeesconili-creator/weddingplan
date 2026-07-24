import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ever After — Wedding Planner",
  description: "A beautiful, all-in-one wedding planning dashboard for Janlee and Tim.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
