"use client";

import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setOpportunityCompletion, useCompletionOverrides } from "@/lib/completion-store";

export function CompletionToggle({ id, fullWidth = false, initialCompleted = false }: { id: string; fullWidth?: boolean; initialCompleted?: boolean }) {
  const overrides = useCompletionOverrides();
  const completed = overrides[id] ?? initialCompleted;

  return (
    <Button
      onClick={() => setOpportunityCompletion(id, !completed)}
      variant={completed ? "secondary" : "default"}
      className={fullWidth ? "w-full" : undefined}
    >
      {completed ? <RotateCcw className="size-4" /> : <Check className="size-4" />}
      {completed ? "Mark as open" : "Mark as completed"}
    </Button>
  );
}
