import { SignInPage } from "@/components/auth/SignInPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Operix",
  description: "Sign in to your Operix Enterprise Workspace",
};

export default function LoginRoutePage() {
  return <SignInPage />;
}
