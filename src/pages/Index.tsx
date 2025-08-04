"use client";

import { ApplicationStatusChecker } from "@/components/ApplicationStatusChecker";
import { MadeWithDyad } from "@/components/made-with-dyad";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <ApplicationStatusChecker />
      <MadeWithDyad />
    </div>
  );
}