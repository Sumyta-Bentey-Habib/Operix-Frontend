import { describe, expect, it } from "vitest";
import {
  canAssignTask,
  canClaimTask,
  canCreateGlobalTask,
  canCreateTask,
  canDeleteTaskAttachment,
  canDirectCompleteTask,
  canResubmitTask,
  canReviewTaskSubmission,
  canStartTask,
  canSubmitTask,
  canUploadTaskAttachment,
  canViewTaskCore,
  isTaskAttachmentLifecycleEditable,
} from "@/lib/auth/permissions";
import type { OperixViewer } from "@/types/auth";
import type { Task } from "@/features/tasks/types/task.types";
import type { AttachmentResponse } from "@/features/tasks/types/task-attachment.types";

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

      const otherTeamTask = {
        ...makeTask("PENDING"),
        scope: "TEAM" as const,
        teamId: "team-other",
      };
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

  describe("isTaskAttachmentLifecycleEditable, canUploadTaskAttachment, and canDeleteTaskAttachment", () => {
    it("evaluates isTaskAttachmentLifecycleEditable correctly", () => {
      expect(isTaskAttachmentLifecycleEditable(makeTask("PENDING"))).toBe(true);
      expect(isTaskAttachmentLifecycleEditable(makeTask("ASSIGNED"))).toBe(true);

      const startedAssigned: Task = {
        ...makeTask("ASSIGNED"),
        startedAt: "2026-09-28T00:00:00.000Z",
      };
      expect(isTaskAttachmentLifecycleEditable(startedAssigned)).toBe(false);
      expect(isTaskAttachmentLifecycleEditable(makeTask("IN_PROGRESS"))).toBe(false);
      expect(isTaskAttachmentLifecycleEditable(makeTask("SUBMITTED"))).toBe(false);
      expect(isTaskAttachmentLifecycleEditable(makeTask("UNDER_REVIEW"))).toBe(false);
      expect(isTaskAttachmentLifecycleEditable(makeTask("REVISION_REQUIRED"))).toBe(false);
      expect(isTaskAttachmentLifecycleEditable(makeTask("RESUBMITTED"))).toBe(false);
      expect(isTaskAttachmentLifecycleEditable(makeTask("COMPLETED"))).toBe(false);
      expect(isTaskAttachmentLifecycleEditable(makeTask("CANCELLED"))).toBe(false);
    });

    describe("canUploadTaskAttachment matrix", () => {
      const responsibleMember = { ...makeViewer("MEMBER"), userId: "resp-member-1" };
      const unrelatedMember = { ...makeViewer("MEMBER"), userId: "other-member" };
      const ownerAdmin = { ...makeViewer("ADMIN"), userId: "owner-admin-1" };
      const otherAdmin = { ...makeViewer("ADMIN"), userId: "other-admin-1" };
      const sa = makeViewer("SUPER_ADMIN");

      const sentGlobalTask: Task = {
        ...makeTask("ASSIGNED"),
        scope: "GLOBAL",
        owner: { id: ownerAdmin.userId, name: "Owner Admin", role: "ADMIN" },
        createdById: ownerAdmin.userId,
        responsible: { id: responsibleMember.userId, name: "Responsible", role: "MEMBER" },
        distribution: {
          status: "SENT",
          scheduledAt: "2026-09-28T00:00:00.000Z",
          sentAt: "2026-09-28T00:00:00.000Z",
        },
      };

      const pendingDistributionTask: Task = {
        ...makeTask("ASSIGNED"),
        scope: "GLOBAL",
        owner: { id: ownerAdmin.userId, name: "Owner Admin", role: "ADMIN" },
        createdById: ownerAdmin.userId,
        responsible: { id: responsibleMember.userId, name: "Responsible", role: "MEMBER" },
        distribution: {
          status: "PENDING",
          scheduledAt: "2026-09-29T00:00:00.000Z",
          sentAt: null,
        },
      };

      it("allows Responsible MEMBER on GLOBAL SENT ASSIGNED task (startedAt=null)", () => {
        expect(canUploadTaskAttachment(responsibleMember, sentGlobalTask)).toBe(true);
      });

      it("blocks unrelated MEMBER on GLOBAL SENT ASSIGNED task", () => {
        expect(canUploadTaskAttachment(unrelatedMember, sentGlobalTask)).toBe(false);
      });

      it("blocks Owner ADMIN on GLOBAL SENT ASSIGNED task", () => {
        expect(canUploadTaskAttachment(ownerAdmin, sentGlobalTask)).toBe(false);
      });

      it("blocks SUPER_ADMIN on GLOBAL SENT ASSIGNED task", () => {
        expect(canUploadTaskAttachment(sa, sentGlobalTask)).toBe(false);
      });

      it("allows Responsible MEMBER on PENDING distribution ASSIGNED task", () => {
        expect(canUploadTaskAttachment(responsibleMember, pendingDistributionTask)).toBe(true);
      });

      it("allows Owner ADMIN on PENDING distribution ASSIGNED task", () => {
        expect(canUploadTaskAttachment(ownerAdmin, pendingDistributionTask)).toBe(true);
      });

      it("allows SUPER_ADMIN on PENDING distribution ASSIGNED task", () => {
        expect(canUploadTaskAttachment(sa, pendingDistributionTask)).toBe(true);
      });

      it("blocks Responsible MEMBER when task is IN_PROGRESS", () => {
        const inProgressTask: Task = {
          ...sentGlobalTask,
          status: "IN_PROGRESS",
          startedAt: "2026-09-28T10:00:00.000Z",
        };
        expect(canUploadTaskAttachment(responsibleMember, inProgressTask)).toBe(false);
      });

      it("blocks non-owner ADMIN on editable task with PENDING distribution", () => {
        expect(canUploadTaskAttachment(otherAdmin, pendingDistributionTask)).toBe(false);
      });

      it("blocks null viewer", () => {
        expect(canUploadTaskAttachment(null, sentGlobalTask)).toBe(false);
      });
    });

    describe("canDeleteTaskAttachment matrix", () => {
      const sa = makeViewer("SUPER_ADMIN");
      const ownerAdmin = { ...makeViewer("ADMIN"), userId: "admin-owner-1" };
      const responsibleMember = { ...makeViewer("MEMBER"), userId: "member-resp-1" };
      const otherMember = { ...makeViewer("MEMBER"), userId: "member-other-2" };

      const sentGlobalTask: Task = {
        ...makeTask("ASSIGNED"),
        scope: "GLOBAL",
        owner: { id: ownerAdmin.userId, name: "Owner Admin", role: "ADMIN" },
        createdById: ownerAdmin.userId,
        responsible: { id: responsibleMember.userId, name: "Responsible Member", role: "MEMBER" },
        distribution: {
          status: "SENT",
          scheduledAt: "2026-09-28T00:00:00.000Z",
          sentAt: "2026-09-28T00:00:00.000Z",
        },
      };

      const pendingDistributionTask: Task = {
        ...sentGlobalTask,
        distribution: {
          status: "PENDING",
          scheduledAt: "2026-09-29T00:00:00.000Z",
          sentAt: null,
        },
      };

      const adminAttachment: AttachmentResponse = {
        id: "att-admin",
        file: {
          id: "f-1",
          originalName: "admin-brief.pdf",
          mimeType: "application/pdf",
          sizeBytes: 1024,
          uploadedBy: { id: ownerAdmin.userId, name: "Owner Admin" },
          createdAt: "2026-09-28T00:00:00.000Z",
        },
        downloadUrl: "/api/v1/files/f-1/download",
      };

      const superAdminAttachment: AttachmentResponse = {
        id: "att-sa",
        file: {
          id: "f-sa",
          originalName: "sa-guideline.pdf",
          mimeType: "application/pdf",
          sizeBytes: 1024,
          uploadedBy: { id: sa.userId, name: "Super Admin" },
          createdAt: "2026-09-28T00:00:00.000Z",
        },
        downloadUrl: "/api/v1/files/f-sa/download",
      };

      const memberAttachment: AttachmentResponse = {
        id: "att-member",
        file: {
          id: "f-2",
          originalName: "member-work.pdf",
          mimeType: "application/pdf",
          sizeBytes: 2048,
          uploadedBy: { id: responsibleMember.userId, name: "Responsible Member" },
          createdAt: "2026-09-28T00:00:00.000Z",
        },
        downloadUrl: "/api/v1/files/f-2/download",
      };

      const otherMemberAttachment: AttachmentResponse = {
        id: "att-other-member",
        file: {
          id: "f-3",
          originalName: "other-member-notes.pdf",
          mimeType: "application/pdf",
          sizeBytes: 2048,
          uploadedBy: { id: otherMember.userId, name: "Other Member" },
          createdAt: "2026-09-28T00:00:00.000Z",
        },
        downloadUrl: "/api/v1/files/f-3/download",
      };

      it("allows Responsible Member to delete their own upload on GLOBAL SENT task", () => {
        expect(canDeleteTaskAttachment(responsibleMember, sentGlobalTask, memberAttachment)).toBe(
          true,
        );
      });

      it("blocks Responsible Member from deleting Admin upload", () => {
        expect(canDeleteTaskAttachment(responsibleMember, sentGlobalTask, adminAttachment)).toBe(
          false,
        );
      });

      it("blocks Responsible Member from deleting Super Admin upload", () => {
        expect(
          canDeleteTaskAttachment(responsibleMember, sentGlobalTask, superAdminAttachment),
        ).toBe(false);
      });

      it("blocks Responsible Member from deleting other Member upload", () => {
        expect(
          canDeleteTaskAttachment(responsibleMember, sentGlobalTask, otherMemberAttachment),
        ).toBe(false);
      });

      it("blocks Owner Admin from deleting any attachment on GLOBAL SENT task", () => {
        expect(canDeleteTaskAttachment(ownerAdmin, sentGlobalTask, adminAttachment)).toBe(false);
        expect(canDeleteTaskAttachment(ownerAdmin, sentGlobalTask, memberAttachment)).toBe(false);
      });

      it("blocks Super Admin from deleting any attachment on GLOBAL SENT task", () => {
        expect(canDeleteTaskAttachment(sa, sentGlobalTask, adminAttachment)).toBe(false);
        expect(canDeleteTaskAttachment(sa, sentGlobalTask, memberAttachment)).toBe(false);
      });

      it("allows Owner Admin to delete attachments when distribution is PENDING", () => {
        expect(canDeleteTaskAttachment(ownerAdmin, pendingDistributionTask, adminAttachment)).toBe(
          true,
        );
        expect(canDeleteTaskAttachment(ownerAdmin, pendingDistributionTask, memberAttachment)).toBe(
          true,
        );
      });

      it("allows Super Admin to delete attachments when distribution is PENDING", () => {
        expect(canDeleteTaskAttachment(sa, pendingDistributionTask, adminAttachment)).toBe(true);
        expect(canDeleteTaskAttachment(sa, pendingDistributionTask, memberAttachment)).toBe(true);
      });

      it("blocks unrelated Member from deleting any attachment", () => {
        expect(
          canDeleteTaskAttachment(otherMember, pendingDistributionTask, memberAttachment),
        ).toBe(false);
        expect(canDeleteTaskAttachment(otherMember, pendingDistributionTask, adminAttachment)).toBe(
          false,
        );
      });

      it("blocks delete when task is IN_PROGRESS", () => {
        const inProgressTask: Task = {
          ...pendingDistributionTask,
          status: "IN_PROGRESS",
          startedAt: "2026-09-28T10:00:00.000Z",
        };
        expect(canDeleteTaskAttachment(responsibleMember, inProgressTask, memberAttachment)).toBe(
          false,
        );
        expect(canDeleteTaskAttachment(ownerAdmin, inProgressTask, adminAttachment)).toBe(false);
        expect(canDeleteTaskAttachment(sa, inProgressTask, adminAttachment)).toBe(false);
      });
    });
  });

  describe("canStartTask and canSubmitTask", () => {
    it("allows MEMBER who is responsible to start an ASSIGNED task", () => {
      const viewer = makeViewer("MEMBER");
      const task: Task = {
        ...makeTask("ASSIGNED"),
        responsible: { id: viewer.userId, name: "Tupur", role: "MEMBER" },
      };
      expect(canStartTask(viewer, task)).toBe(true);
    });

    it("blocks MEMBER who is NOT the responsible user", () => {
      const viewer = makeViewer("MEMBER");
      const task: Task = {
        ...makeTask("ASSIGNED"),
        responsible: { id: "other-user", name: "Other", role: "MEMBER" },
      };
      expect(canStartTask(viewer, task)).toBe(false);
    });

    it("blocks MEMBER on a non-ASSIGNED task", () => {
      const viewer = makeViewer("MEMBER");
      const task: Task = {
        ...makeTask("IN_PROGRESS"),
        responsible: { id: viewer.userId, name: "Tupur", role: "MEMBER" },
      };
      expect(canStartTask(viewer, task)).toBe(false);
    });

    it("blocks SUPER_ADMIN from starting a task", () => {
      const viewer = makeViewer("SUPER_ADMIN");
      const task: Task = {
        ...makeTask("ASSIGNED"),
        responsible: { id: viewer.userId, name: "SA", role: "SUPER_ADMIN" },
      };
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
      expect(canSubmitTask(makeViewer("MEMBER"), makeTask("ASSIGNED", "REVIEW_REQUIRED"))).toBe(
        false,
      );
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
      expect(
        canResubmitTask(makeViewer("MEMBER"), makeTask("IN_PROGRESS", "REVIEW_REQUIRED")),
      ).toBe(false);
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
      expect(canReviewTaskSubmission(makeViewer("SUPER_ADMIN"), makeTask("IN_PROGRESS"))).toBe(
        false,
      );
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
