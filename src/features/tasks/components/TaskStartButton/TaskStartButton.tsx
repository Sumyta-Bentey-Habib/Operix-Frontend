"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useState } from "react";

export interface TaskStartButtonProps {
  pending: boolean;
  onStart: () => void;
}

export const TaskStartButton = ({ pending, onStart }: TaskStartButtonProps) => {
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setConfirming(true)} disabled={pending}>
        {pending ? "Starting..." : "Start Task"}
      </button>
      <ConfirmDialog
        open={confirming}
        title="Start Task"
        message="Start this Task now? The backend will move it from assigned to in progress."
        confirmLabel="Start Task"
        pending={pending}
        onConfirm={() => {
          onStart();
          setConfirming(false);
        }}
        onCancel={() => !pending && setConfirming(false)}
      />
    </>
  );
};
