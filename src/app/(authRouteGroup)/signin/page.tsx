import { SignInPage } from "@/components/auth/SignInPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Operix Apex Pharma",
  description: "Sign in to your Operix & Apex Pharma Enterprise Workspace",
};

export default function SignInRoutePage() {
  return <SignInPage />;
}
