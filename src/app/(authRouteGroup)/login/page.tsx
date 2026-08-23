import { LoginPage } from "@/components/auth/LoginPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Operix",
  description: "Sign in to Operix Enterprise Financial & Operations Workspace",
};

export default function LoginRoutePage() {
  return <LoginPage />;
}
