import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/LoginPage";

export const metadata: Metadata = {
  title: "Operix - Pharmaceutical Operations & Governance",
  description: "Operix public home for pharmaceutical operations and governance.",
};

export default function HomePage() {
  return <LoginPage />;
}
