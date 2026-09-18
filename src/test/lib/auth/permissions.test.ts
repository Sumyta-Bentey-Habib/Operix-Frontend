import { describe, expect, it } from "vitest";
import {
  canAssignTask,
  canClaimTask,
  canCreateGlobalTask,
  canCreateTask,
  canDirectCompleteTask,
  canManageTaskAttachments,
  canStartTask,
  canSubmitTask,
  canViewTaskCore,
} from "@/lib/auth/permissions";
import type { OperixViewer } from "@/types/auth";
import type { Task } from "@/features/tasks/types/task.types";

const makeViewer = (role: "SUPER_ADMIN" | "ADMIN" | "MEMBER"): OperixViewer => ({
  userId: "user-test",
  role,
  status: "ACTIVE",
  scope: role === "SUPER_ADMIN" ? { type: "GLOBAL" } : { type: "ADMIN", teamIds: ["team-1"] },
});

const makeTask = (status: Task["status"]): Task => ({
  id: "task-1",
  referenceCode: "TSK-001",
  title: "Test Task",
  description: null,
  remarks: null,
  priority: "MEDIUM",
  status,
  dueAt: null,
  startedAt: null,
  completedAt: null,
  cancelledAt: null,
  teamId: "team-1",
  categoryId: null,
  createdById: "user-test",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  isOverdue: false,
});

describe("Task permissions", () => {
  describe("canCreateTask", () => {
    it("allows SUPER_ADMIN to create tasks", () => {
      expect(canCreateTask(makeViewer("SUPER_ADMIN"))).toBe(true);
    });

    it("allows ADMIN to create tasks", () => {
      expect(canCreateTask(makeViewer("ADMIN"))).toBe(true);
    });

    it("blocks MEMBER from creating tasks", () => {
      expect(canCreateTask(makeViewer("MEMBER"))).toBe(false);
    });

    it("blocks unauthenticated viewers from creating tasks", () => {
      expect(canCreateTask(null)).toBe(false);
    });
  });

  describe("canCreateGlobalTask", () => {
    it("allows SUPER_ADMIN to create global tasks", () => {
      expect(canCreateGlobalTask(makeViewer("SUPER_ADMIN"))).toBe(true);
    });

    it("blocks ADMIN from creating global tasks", () => {
      expect(canCreateGlobalTask(makeViewer("ADMIN"))).toBe(false);
    });

    it("blocks MEMBER from creating global tasks", () => {
      expect(canCreateGlobalTask(makeViewer("MEMBER"))).toBe(false);
    });

    it("blocks unauthenticated viewers from creating global tasks", () => {
      expect(canCreateGlobalTask(null)).toBe(false);
    });
  });

  describe("canAssignTask", () => {
    it("allows ADMIN to assign tasks", () => {
      expect(canAssignTask(makeViewer("ADMIN"))).toBe(true);
    });

    it("allows SUPER_ADMIN to assign tasks", () => {
      expect(canAssignTask(makeViewer("SUPER_ADMIN"))).toBe(true);
    });

    it("blocks MEMBER from assigning tasks", () => {
      expect(canAssignTask(makeViewer("MEMBER"))).toBe(false);
    });

    it("blocks unauthenticated viewers from assigning tasks", () => {
      expect(canAssignTask(null)).toBe(false);
    });
  });

  describe("canClaimTask", () => {
    it("allows MEMBER to claim PENDING task with allowSelfClaim", () => {
      const task = { ...makeTask("PENDING"), allowSelfClaim: true };
      expect(canClaimTask(makeViewer("MEMBER"), task)).toBe(true);
    });

    it("blocks MEMBER if allowSelfClaim is false or undefined", () => {
      const task = { ...makeTask("PENDING"), allowSelfClaim: false };
      expect(canClaimTask(makeViewer("MEMBER"), task)).toBe(false);
    });

    it("blocks MEMBER if task is not in PENDING status", () => {
      const task = { ...makeTask("ASSIGNED"), allowSelfClaim: true };
      expect(canClaimTask(makeViewer("MEMBER"), task)).toBe(false);
    });

    it("blocks ADMIN and SUPER_ADMIN from claiming tasks", () => {
      const task = { ...makeTask("PENDING"), allowSelfClaim: true };
      expect(canClaimTask(makeViewer("ADMIN"), task)).toBe(false);
      expect(canClaimTask(makeViewer("SUPER_ADMIN"), task)).toBe(false);
    });
  });

  describe("canDirectCompleteTask", () => {
    it("allows direct completion for DIRECT mode in IN_PROGRESS status", () => {
      const task = {
        ...makeTask("IN_PROGRESS"),
        completionMode: "DIRECT" as const,
      };
      expect(canDirectCompleteTask(makeViewer("ADMIN"), task)).toBe(true);
    });

    it("blocks direct completion when completionMode is not DIRECT", () => {
      const task = {
        ...makeTask("IN_PROGRESS"),
        completionMode: "REVIEW_REQUIRED" as const,
      };
      expect(canDirectCompleteTask(makeViewer("ADMIN"), task)).toBe(false);
    });
  });

  describe("canManageTaskAttachments", () => {
    it("allows ADMIN for PENDING tasks", () => {
      expect(canManageTaskAttachments(makeViewer("ADMIN"), makeTask("PENDING"))).toBe(true);
    });

    it("blocks SUPER_ADMIN for PENDING tasks", () => {
      expect(canManageTaskAttachments(makeViewer("SUPER_ADMIN"), makeTask("PENDING"))).toBe(false);
    });

    it("blocks SUPER_ADMIN for non-PENDING tasks", () => {
      expect(canManageTaskAttachments(makeViewer("SUPER_ADMIN"), makeTask("IN_PROGRESS"))).toBe(
        false,
      );
    });

    it("blocks MEMBER for PENDING tasks", () => {
      expect(canManageTaskAttachments(makeViewer("MEMBER"), makeTask("PENDING"))).toBe(false);
    });
  });

  describe("canStartTask and canSubmitTask", () => {
    it("allows MEMBER to start task", () => {
      expect(canStartTask(makeViewer("MEMBER"))).toBe(true);
      expect(canStartTask(makeViewer("SUPER_ADMIN"))).toBe(false);
    });

    it("allows MEMBER to submit IN_PROGRESS task", () => {
      expect(canSubmitTask(makeViewer("MEMBER"), makeTask("IN_PROGRESS"))).toBe(true);
      expect(canSubmitTask(makeViewer("SUPER_ADMIN"), makeTask("IN_PROGRESS"))).toBe(false);
    });
  });

  describe("canViewTaskCore", () => {
    it("allows all roles to view task core", () => {
      expect(canViewTaskCore(makeViewer("SUPER_ADMIN"))).toBe(true);
      expect(canViewTaskCore(makeViewer("ADMIN"))).toBe(true);
      expect(canViewTaskCore(makeViewer("MEMBER"))).toBe(true);
      expect(canViewTaskCore(null)).toBe(false);
    });
  });
});
