import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply for Visa | VisaHub",
  description: "Complete your visa application",
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
