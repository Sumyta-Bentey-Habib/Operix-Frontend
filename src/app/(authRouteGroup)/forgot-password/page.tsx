import type { Metadata } from "next";
import { ForgotPasswordPage } from "@/features/auth/components/ForgotPasswordPage/ForgotPasswordPage";

export const metadata: Metadata = {
  title: "Forgot Password - Operix",
  description: "Request a secure password reset link for your Operix account.",
};

export default function ForgotPasswordRoute() {
  return <ForgotPasswordPage />;
}
