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
    it("allows SUPER_ADMIN for PENDING tasks (always allowed by role)", () => {
      const sa = makeViewer("SUPER_ADMIN");
      expect(canManageTaskAttachments(sa, makeTask("PENDING"))).toBe(true);
    });

    it("allows ADMIN who is the task creator for PENDING tasks", () => {
      const admin = makeViewer("ADMIN");
      // makeViewer returns userId: "user-test", makeTask returns createdById: "user-test"
      expect(canManageTaskAttachments(admin, makeTask("PENDING"))).toBe(true);
    });

    it("blocks ADMIN who did NOT create the task", () => {
      const admin = makeViewer("ADMIN");
      const otherTask = { ...makeTask("PENDING"), createdById: "someone-else" };
      expect(canManageTaskAttachments(admin, otherTask)).toBe(false);
    });

    it("blocks SUPER_ADMIN for non-editable statuses", () => {
      expect(canManageTaskAttachments(makeViewer("SUPER_ADMIN"), makeTask("IN_PROGRESS"))).toBe(false);
    });

    it("blocks MEMBER for PENDING tasks (not a creator in normal flow)", () => {
      const member = makeViewer("MEMBER");
      const taskByOther = { ...makeTask("PENDING"), createdById: "admin-1" };
      expect(canManageTaskAttachments(member, taskByOther)).toBe(false);
    });
  });

  describe("canStartTask and canSubmitTask", () => {
    it("allows MEMBER who is responsible to start an ASSIGNED task", () => {
      const viewer = makeViewer("MEMBER");
      const task: Task = { ...makeTask("ASSIGNED"), responsible: { id: viewer.userId, name: "Tupur", role: "MEMBER" } };
      expect(canStartTask(viewer, task)).toBe(true);
    });

    it("blocks MEMBER who is NOT the responsible user", () => {
      const viewer = makeViewer("MEMBER");
      const task: Task = { ...makeTask("ASSIGNED"), responsible: { id: "other-user", name: "Other", role: "MEMBER" } };
      expect(canStartTask(viewer, task)).toBe(false);
    });

    it("blocks MEMBER on a non-ASSIGNED task", () => {
      const viewer = makeViewer("MEMBER");
      const task: Task = { ...makeTask("IN_PROGRESS"), responsible: { id: viewer.userId, name: "Tupur", role: "MEMBER" } };
      expect(canStartTask(viewer, task)).toBe(false);
    });

    it("blocks SUPER_ADMIN from starting a task", () => {
      const viewer = makeViewer("SUPER_ADMIN");
      const task: Task = { ...makeTask("ASSIGNED"), responsible: { id: viewer.userId, name: "SA", role: "SUPER_ADMIN" } };
      expect(canStartTask(viewer, task)).toBe(false);
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
