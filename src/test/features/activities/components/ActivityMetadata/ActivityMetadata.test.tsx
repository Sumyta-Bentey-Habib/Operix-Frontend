import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActivityMetadata } from "@/features/activities/components/ActivityMetadata/ActivityMetadata";

describe("ActivityMetadata", () => {
  it("renders generic nested metadata safely", () => {
    render(
      <ActivityMetadata
        metadata={{
          taskId: "task-1",
          version: 2,
          nested: { previousStatus: "SUBMITTED" },
          tags: ["workflow"],
        }}
      />,
    );

    expect(screen.getByText("taskId")).toBeInTheDocument();
    expect(screen.getByText("task-1")).toBeInTheDocument();
    expect(screen.getByText('{"previousStatus":"SUBMITTED"}')).toBeInTheDocument();
    expect(screen.getByText('["workflow"]')).toBeInTheDocument();
  });
});
