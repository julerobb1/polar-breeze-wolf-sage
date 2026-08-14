import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LabApp } from "@/components/lab/lab-app";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg text-sm text-muted">
        Mounting the living room…
      </div>
    );
  }
  return <LabApp />;
}
