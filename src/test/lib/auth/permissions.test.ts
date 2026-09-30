import { describe, expect, it } from "vitest";
import {
  areTaskAttachmentsEditable,
  canAssignTask,
  canClaimTask,
  canCreateGlobalTask,
  canCreateTask,
  canDeleteTaskAttachment,
  canDirectCompleteTask,
  canManageTaskAttachments,
  canMutateTaskAttachments,
  canResubmitTask,
  canReviewTaskSubmission,
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

const makeTask = (
  status: Task["status"],
  completionMode: Task["completionMode"] = "REVIEW_REQUIRED",
): Task => ({
  id: "task-1",
  referenceCode: "TSK-001",
  title: "Test Task",
  description: null,
  remarks: null,
  priority: "MEDIUM",
  status,
  completionMode,
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
    it("allows ADMIN to assign tasks within their team", () => {
      const teamTask = { ...makeTask("PENDING"), scope: "TEAM" as const, teamId: "team-1" };
      expect(canAssignTask(makeViewer("ADMIN"), teamTask)).toBe(true);
    });

    it("blocks ADMIN from assigning GLOBAL tasks or tasks from other teams", () => {
      const globalTask = { ...makeTask("PENDING"), scope: "GLOBAL" as const, teamId: null };
      expect(canAssignTask(makeViewer("ADMIN"), globalTask)).toBe(false);

      const otherTeamTask = { ...makeTask("PENDING"), scope: "TEAM" as const, teamId: "team-other" };
      expect(canAssignTask(makeViewer("ADMIN"), otherTeamTask)).toBe(false);
    });

    it("allows SUPER_ADMIN to assign both TEAM and GLOBAL tasks", () => {
      const teamTask = { ...makeTask("PENDING"), scope: "TEAM" as const, teamId: "team-1" };
      const globalTask = { ...makeTask("PENDING"), scope: "GLOBAL" as const, teamId: null };
      expect(canAssignTask(makeViewer("SUPER_ADMIN"), teamTask)).toBe(true);
      expect(canAssignTask(makeViewer("SUPER_ADMIN"), globalTask)).toBe(true);
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

    it("blocks MEMBER if task already has a responsible user", () => {
      const task: Task = {
        ...makeTask("PENDING"),
        allowSelfClaim: true,
        responsible: { id: "member-2", name: "Other Member", role: "MEMBER" },
      };
      expect(canClaimTask(makeViewer("MEMBER"), task)).toBe(false);
    });

    it("blocks MEMBER if task is recurring", () => {
      const task: Task = {
        ...makeTask("PENDING"),
        allowSelfClaim: true,
        recurrence: {
          id: "rec-1",
          frequency: "WEEKLY",
          nextOccurrenceAt: "2026-10-01T00:00:00.000Z",
          reminderLeadMinutes: 1440,
          distributionLeadMinutes: null,
          isActive: true,
        },
      };
      expect(canClaimTask(makeViewer("MEMBER"), task)).toBe(false);
    });

    it("blocks ADMIN and SUPER_ADMIN from claiming tasks", () => {
      const task = { ...makeTask("PENDING"), allowSelfClaim: true };
      expect(canClaimTask(makeViewer("ADMIN"), task)).toBe(false);
      expect(canClaimTask(makeViewer("SUPER_ADMIN"), task)).toBe(false);
    });
  });

  describe("canDirectCompleteTask", () => {
    it("allows direct completion for TEAM tasks in DIRECT mode for ADMIN and SUPER_ADMIN", () => {
      const task = {
        ...makeTask("IN_PROGRESS"),
        scope: "TEAM" as const,
        completionMode: "DIRECT" as const,
      };
      expect(canDirectCompleteTask(makeViewer("ADMIN"), task)).toBe(true);
      expect(canDirectCompleteTask(makeViewer("SUPER_ADMIN"), task)).toBe(true);
    });

    it("blocks direct completion of GLOBAL tasks for ADMIN, but allows for SUPER_ADMIN and assigned MEMBER", () => {
      const globalTask = {
        ...makeTask("IN_PROGRESS"),
        scope: "GLOBAL" as const,
        completionMode: "DIRECT" as const,
        responsible: { id: "user-test", name: "Assigned Member", role: "MEMBER" },
      };
      expect(canDirectCompleteTask(makeViewer("ADMIN"), globalTask)).toBe(false);
      expect(canDirectCompleteTask(makeViewer("MEMBER"), globalTask)).toBe(true);
      expect(canDirectCompleteTask(makeViewer("SUPER_ADMIN"), globalTask)).toBe(true);
    });

    it("allows assigned MEMBER to direct complete tasks, but blocks unassigned MEMBER", () => {
      const task = {
        ...makeTask("IN_PROGRESS"),
        scope: "TEAM" as const,
        completionMode: "DIRECT" as const,
        responsible: { id: "user-test", name: "Assigned Member", role: "MEMBER" },
      };
      expect(canDirectCompleteTask(makeViewer("MEMBER"), task)).toBe(true);

      const unassignedTask = {
        ...task,
        responsible: null,
      };
      expect(canDirectCompleteTask(makeViewer("MEMBER"), unassignedTask)).toBe(false);

      const otherUserTask = {
        ...task,
        responsible: { id: "other-user", name: "Other Member", role: "MEMBER" },
      };
      expect(canDirectCompleteTask(makeViewer("MEMBER"), otherUserTask)).toBe(false);
    });

    it("blocks direct completion when completionMode is not DIRECT", () => {
      const task = {
        ...makeTask("IN_PROGRESS"),
        completionMode: "REVIEW_REQUIRED" as const,
      };
      expect(canDirectCompleteTask(makeViewer("ADMIN"), task)).toBe(false);
      expect(canDirectCompleteTask(makeViewer("SUPER_ADMIN"), task)).toBe(false);
    });
  });

  describe("canManageTaskAttachments, canMutateTaskAttachments, and areTaskAttachmentsEditable", () => {
    it("allows SUPER_ADMIN for PENDING tasks (always allowed by role)", () => {
      const sa = makeViewer("SUPER_ADMIN");
      expect(canManageTaskAttachments(sa, makeTask("PENDING"))).toBe(true);
      expect(canMutateTaskAttachments(sa, makeTask("PENDING"))).toBe(true);
    });

    it("allows ADMIN who is the task creator (via createdById or owner.id) for PENDING tasks", () => {
      const admin = makeViewer("ADMIN");
      // makeViewer returns userId: "user-test", makeTask returns createdById: "user-test"
      expect(canManageTaskAttachments(admin, makeTask("PENDING"))).toBe(true);

      const taskWithOwner: Task = {
        ...makeTask("PENDING"),
        createdById: undefined,
        owner: { id: "user-test", name: "Admin Owner", role: "ADMIN" },
      };
      expect(canManageTaskAttachments(admin, taskWithOwner)).toBe(true);
    });

    it("blocks ADMIN who did NOT create the task", () => {
      const admin = makeViewer("ADMIN");
      const otherTask = { ...makeTask("PENDING"), createdById: "someone-else" };
      expect(canManageTaskAttachments(admin, otherTask)).toBe(false);
      expect(canMutateTaskAttachments(admin, otherTask)).toBe(false);
    });

    it("blocks MEMBER even if createdById or owner matches viewer", () => {
      const member = makeViewer("MEMBER");
      const taskCreatedByMember = { ...makeTask("PENDING"), createdById: "user-test" };
      expect(canManageTaskAttachments(member, taskCreatedByMember)).toBe(false);
      expect(canMutateTaskAttachments(member, taskCreatedByMember)).toBe(false);
    });

    it("evaluates areTaskAttachmentsEditable based on status and distribution locks", () => {
      expect(areTaskAttachmentsEditable(makeTask("PENDING"))).toBe(true);
      expect(areTaskAttachmentsEditable(makeTask("ASSIGNED"))).toBe(true);

      const startedAssigned: Task = {
        ...makeTask("ASSIGNED"),
        startedAt: "2026-09-28T00:00:00.000Z",
      };
      expect(areTaskAttachmentsEditable(startedAssigned)).toBe(false);

      expect(areTaskAttachmentsEditable(makeTask("IN_PROGRESS"))).toBe(false);

      const sentDistribution: Task = {
        ...makeTask("PENDING"),
        distribution: {
          status: "SENT",
          scheduledAt: "2026-09-28T00:00:00.000Z",
          sentAt: "2026-09-28T00:00:00.000Z",
        },
      };
      expect(areTaskAttachmentsEditable(sentDistribution)).toBe(false);

      const pendingDistribution: Task = {
        ...makeTask("PENDING"),
        distribution: {
          status: "PENDING",
          scheduledAt: "2026-09-29T00:00:00.000Z",
          sentAt: null,
        },
      };
      expect(areTaskAttachmentsEditable(pendingDistribution)).toBe(true);
    });

    it("blocks SUPER_ADMIN for non-editable statuses", () => {
      expect(canManageTaskAttachments(makeViewer("SUPER_ADMIN"), makeTask("IN_PROGRESS"))).toBe(false);
    });

    it("blocks MEMBER for PENDING tasks (not a creator in normal flow)", () => {
      const member = makeViewer("MEMBER");
      const taskByOther = { ...makeTask("PENDING"), createdById: "admin-1" };
      expect(canManageTaskAttachments(member, taskByOther)).toBe(false);
    });

    it("allows current Responsible MEMBER to mutate attachments on an editable ASSIGNED task", () => {
      const member = makeViewer("MEMBER");
      const assignedTask: Task = {
        ...makeTask("ASSIGNED"),
        responsible: { id: member.userId, name: "Responsible Member", role: "MEMBER" },
      };
      expect(canMutateTaskAttachments(member, assignedTask)).toBe(true);
      expect(canManageTaskAttachments(member, assignedTask)).toBe(true);
    });

    it("blocks non-responsible MEMBER on an ASSIGNED task", () => {
      const member = makeViewer("MEMBER");
      const assignedTask: Task = {
        ...makeTask("ASSIGNED"),
        responsible: { id: "other-member", name: "Other Member", role: "MEMBER" },
      };
      expect(canMutateTaskAttachments(member, assignedTask)).toBe(false);
      expect(canManageTaskAttachments(member, assignedTask)).toBe(false);
    });

    it("evaluates canDeleteTaskAttachment correctly for all roles and uploaders", () => {
      const sa = makeViewer("SUPER_ADMIN");
      const ownerAdmin = { ...makeViewer("ADMIN"), userId: "admin-owner-1" };
      const member = { ...makeViewer("MEMBER"), userId: "member-resp-1" };

      const editableTask: Task = {
        ...makeTask("ASSIGNED"),
        createdById: ownerAdmin.userId,
        responsible: { id: member.userId, name: "Responsible Member", role: "MEMBER" },
      };

      const adminAttachment = {
        id: "att-1",
        file: {
          id: "f-1",
          originalName: "admin-brief.pdf",
          mimeType: "application/pdf",
          sizeBytes: 1024,
          uploadedBy: { id: ownerAdmin.userId, name: "Admin" },
          createdAt: "2026-09-28T00:00:00.000Z",
        },
        downloadUrl: "/api/v1/files/f-1/download",
      };

      const memberAttachment = {
        id: "att-2",
        file: {
          id: "f-2",
          originalName: "member-work.pdf",
          mimeType: "application/pdf",
          sizeBytes: 2048,
          uploadedBy: { id: member.userId, name: "Member" },
          createdAt: "2026-09-28T00:00:00.000Z",
        },
        downloadUrl: "/api/v1/files/f-2/download",
      };

      // Super Admin can delete both
      expect(canDeleteTaskAttachment(sa, editableTask, adminAttachment)).toBe(true);
      expect(canDeleteTaskAttachment(sa, editableTask, memberAttachment)).toBe(true);

      // Task Owner Admin can delete both
      expect(canDeleteTaskAttachment(ownerAdmin, editableTask, adminAttachment)).toBe(true);
      expect(canDeleteTaskAttachment(ownerAdmin, editableTask, memberAttachment)).toBe(true);

      // Responsible Member can ONLY delete their own upload
      expect(canDeleteTaskAttachment(member, editableTask, memberAttachment)).toBe(true);
      expect(canDeleteTaskAttachment(member, editableTask, adminAttachment)).toBe(false);

      // Unrelated Member cannot delete either
      const otherMember = { ...makeViewer("MEMBER"), userId: "other-user" };
      expect(canDeleteTaskAttachment(otherMember, editableTask, memberAttachment)).toBe(false);
      expect(canDeleteTaskAttachment(otherMember, editableTask, adminAttachment)).toBe(false);
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

    it("evaluates canSubmitTask correctly for roles and completion modes", () => {
      const reviewTask = makeTask("IN_PROGRESS", "REVIEW_REQUIRED");
      const directTask = makeTask("IN_PROGRESS", "DIRECT");

      // MEMBER + IN_PROGRESS + REVIEW_REQUIRED can submit
      expect(canSubmitTask(makeViewer("MEMBER"), reviewTask)).toBe(true);

      // MEMBER + IN_PROGRESS + DIRECT cannot submit
      expect(canSubmitTask(makeViewer("MEMBER"), directTask)).toBe(false);

      // Non-member roles cannot submit
      expect(canSubmitTask(makeViewer("ADMIN"), reviewTask)).toBe(false);
      expect(canSubmitTask(makeViewer("SUPER_ADMIN"), reviewTask)).toBe(false);
      expect(canSubmitTask(null, reviewTask)).toBe(false);

      // Non-IN_PROGRESS status cannot submit
      expect(canSubmitTask(makeViewer("MEMBER"), makeTask("ASSIGNED", "REVIEW_REQUIRED"))).toBe(false);
    });

    it("evaluates canResubmitTask correctly for roles and completion modes", () => {
      const reviewTask = makeTask("REVISION_REQUIRED", "REVIEW_REQUIRED");
      const directTask = makeTask("REVISION_REQUIRED", "DIRECT");

      // MEMBER + REVISION_REQUIRED + REVIEW_REQUIRED can resubmit
      expect(canResubmitTask(makeViewer("MEMBER"), reviewTask)).toBe(true);

      // MEMBER + REVISION_REQUIRED + DIRECT cannot resubmit
      expect(canResubmitTask(makeViewer("MEMBER"), directTask)).toBe(false);

      // Non-member roles cannot resubmit
      expect(canResubmitTask(makeViewer("ADMIN"), reviewTask)).toBe(false);
      expect(canResubmitTask(makeViewer("SUPER_ADMIN"), reviewTask)).toBe(false);
      expect(canResubmitTask(null, reviewTask)).toBe(false);

      // Non-REVISION_REQUIRED status cannot resubmit
      expect(canResubmitTask(makeViewer("MEMBER"), makeTask("IN_PROGRESS", "REVIEW_REQUIRED"))).toBe(false);
    });
  });

  describe("canReviewTaskSubmission", () => {
    it("allows SUPER_ADMIN and ADMIN to review submitted and resubmitted tasks", () => {
      const submittedTask = makeTask("SUBMITTED");
      const resubmittedTask = makeTask("RESUBMITTED");

      expect(canReviewTaskSubmission(makeViewer("SUPER_ADMIN"), submittedTask)).toBe(true);
      expect(canReviewTaskSubmission(makeViewer("ADMIN"), submittedTask)).toBe(true);
      expect(canReviewTaskSubmission(makeViewer("SUPER_ADMIN"), resubmittedTask)).toBe(true);
      expect(canReviewTaskSubmission(makeViewer("ADMIN"), resubmittedTask)).toBe(true);

      // Blocks MEMBER
      expect(canReviewTaskSubmission(makeViewer("MEMBER"), submittedTask)).toBe(false);

      // Blocks non-submitted statuses
      expect(canReviewTaskSubmission(makeViewer("SUPER_ADMIN"), makeTask("IN_PROGRESS"))).toBe(false);
      expect(canReviewTaskSubmission(makeViewer("ADMIN"), makeTask("IN_PROGRESS"))).toBe(false);
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
