import type { Metadata } from "next";
import { SetupView } from "@/components/setup/setup-view";

export const metadata: Metadata = { title: "选择范围 · Project Defense" };

export default function SetupPage() {
  return <SetupView />;
}
