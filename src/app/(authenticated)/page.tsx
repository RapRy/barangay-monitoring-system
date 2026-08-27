"use client";

import { Button } from "@/app/_components/ui/button";
import { PageHeader } from "@/app/_components/ui/page-header";
import { useToast } from "@/app/_providers/toast-provider";

export default function HomePage() {
  const { showToast } = useToast();

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Welcome to the Barangay Monitoring System."
      />

      <Button
        onClick={() => showToast("This is a test notification.", "success")}
      >
        Test Notification
      </Button>
    </div>
  );
}
