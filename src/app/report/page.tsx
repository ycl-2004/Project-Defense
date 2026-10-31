import type { Metadata } from "next";
import { ReportView } from "@/components/report/report-view";

export const metadata: Metadata = { title: "理解反馈报告 · Project Defense" };

export default function ReportPage() {
  return <ReportView />;
}
