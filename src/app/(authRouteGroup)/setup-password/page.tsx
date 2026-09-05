import type { Metadata } from "next";
import { SetupPasswordPage } from "@/features/auth/components/SetupPasswordPage/SetupPasswordPage";

export const metadata: Metadata = {
  title: "Set Up Password - Operix",
  description: "Set up your password and activate your Operix pharmaceutical workspace account.",
};

export default function SetupPasswordRoute() {
  return <SetupPasswordPage />;
}
