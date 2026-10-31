import type { Metadata } from "next";
import { InterviewView } from "@/components/interview/interview-view";

export const metadata: Metadata = { title: "答辩中 · Project Defense" };

export default function InterviewPage() {
  return <InterviewView />;
}
