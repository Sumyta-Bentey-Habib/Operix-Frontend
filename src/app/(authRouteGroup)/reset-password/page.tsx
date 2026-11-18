import type { Metadata } from "next";
import { ResetPasswordPage } from "@/features/auth/components/ResetPasswordPage/ResetPasswordPage";

export const metadata: Metadata = {
  title: "Reset Password - Operix",
  description: "Choose a new password for your Operix account.",
};

export default function ResetPasswordRoute() {
  return <ResetPasswordPage />;
}
