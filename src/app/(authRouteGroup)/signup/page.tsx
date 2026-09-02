import type { Metadata } from "next";
import { SignUpPage } from "@/features/auth/components/SignUpPage/SignUpPage";

export const metadata: Metadata = {
  title: "Request Access - Operix",
  description: "Request an enterprise account on the Operix pharmaceutical operations platform.",
};

export default function SignUpRoute() {
  return <SignUpPage />;
}
