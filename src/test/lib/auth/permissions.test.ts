import { describe, expect, it } from "vitest";
import {
  canAssignTask,
  canClaimTask,
  canCreateGlobalTask,
  canCreateTask,
  canEditTaskDefinition,
  canDeleteTaskAttachment,
  canDirectCompleteTask,
  canRequestSubmissionAiReview,
  canResubmitTask,
  canReviewTaskSubmission,
  canStartTask,
  canSubmitTask,
  canUploadTaskAttachment,
  canViewTaskCore,
  getTaskAttachmentUploadState,
  getSubmissionEditState,
  isTaskAttachmentLifecycleEditable,
} from "@/lib/auth/permissions";
import type { OperixViewer } from "@/types/auth";
import type { Task } from "@/features/tasks/types/task.types";
import type { Submission } from "@/features/submissions/types/submission.types";
import type { AttachmentResponse } from "@/features/tasks/types/task-attachment.types";
import { MAX_TASK_ATTACHMENTS } from "@/features/tasks/utils/task-attachment-validation";

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
  owner: { id: "user-test", name: "Task owner", role: "ADMIN" },
  reviewer: { id: "user-test", name: "Task reviewer", role: "ADMIN" },
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

  describe("canEditTaskDefinition", () => {
    it("allows Super Admin and the owner Admin only before execution", () => {
      const pending = makeTask("PENDING");
      const assigned = makeTask("ASSIGNED");
      expect(canEditTaskDefinition(makeViewer("SUPER_ADMIN"), pending)).toBe(true);
      expect(canEditTaskDefinition(makeViewer("ADMIN"), assigned)).toBe(true);
      expect(
        canEditTaskDefinition(makeViewer("ADMIN"), {
          ...assigned,
          owner: { id: "other-admin", name: "Other", role: "ADMIN" },
        }),
      ).toBe(false);
      expect(canEditTaskDefinition(makeViewer("MEMBER"), pending)).toBe(false);
    });

    it("locks started, active, terminal, and sent Global Tasks for every role", () => {
      const superAdmin = makeViewer("SUPER_ADMIN");
      expect(
        canEditTaskDefinition(superAdmin, {
          ...makeTask("ASSIGNED"),
          startedAt: "2026-01-01T01:00:00.000Z",
        }),
      ).toBe(false);
      expect(canEditTaskDefinition(superAdmin, makeTask("IN_PROGRESS"))).toBe(false);
      expect(canEditTaskDefinition(superAdmin, makeTask("COMPLETED"))).toBe(false);
      expect(
        canEditTaskDefinition(superAdmin, {
          ...makeTask("PENDING"),
          scope: "GLOBAL",
          distribution: {
            status: "SENT",
            scheduledAt: "2026-01-01T00:00:00.000Z",
            sentAt: "2026-01-01T00:00:00.000Z",
          },
        }),
      ).toBe(false);
    });
  });

  describe("getSubmissionEditState", () => {
    const submission: Submission = {
      id: "submission-1",
      taskId: "task-1",
      submittedById: "user-test",
      version: 2,
      submissionText: "Done",
      submittedAt: "2026-01-01T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      attachments: [],
    };

    it("allows the original current Responsible before the deadline and with no deadline", () => {
      const member = makeViewer("MEMBER");
      const submittedTask = {
        ...makeTask("SUBMITTED"),
        responsible: { id: member.userId, name: "Member", role: "MEMBER" },
        dueAt: "2026-01-02T00:00:00.000Z",
      };
      expect(
        getSubmissionEditState(member, submittedTask, submission, true, new Date("2026-01-01")),
      ).toEqual({ canEdit: true, deadlineOverride: false });
      expect(
        getSubmissionEditState(member, { ...submittedTask, dueAt: null }, submission, true),
      ).toEqual({ canEdit: true, deadlineOverride: false });
    });

    it("locks normal actors at the deadline and lets Super Admin override only that lock", () => {
      const member = makeViewer("MEMBER");
      const submittedTask = {
        ...makeTask("SUBMITTED"),
        responsible: { id: member.userId, name: "Member", role: "MEMBER" },
        dueAt: "2026-01-01T00:00:00.000Z",
      };
      const now = new Date("2026-01-01T00:00:00.000Z");
      expect(getSubmissionEditState(member, submittedTask, submission, true, now)).toEqual({
        canEdit: false,
        reason: "DEADLINE_PASSED",
      });
      expect(
        getSubmissionEditState(makeViewer("SUPER_ADMIN"), submittedTask, submission, true, now),
      ).toEqual({ canEdit: true, deadlineOverride: true });
    });

    it("never bypasses latest-version or reviewed workflow locks", () => {
      const superAdmin = makeViewer("SUPER_ADMIN");
      expect(getSubmissionEditState(superAdmin, makeTask("SUBMITTED"), submission, false)).toEqual({
        canEdit: false,
        reason: "NOT_LATEST",
      });
      expect(getSubmissionEditState(superAdmin, makeTask("COMPLETED"), submission, true)).toEqual({
        canEdit: false,
        reason: "WORKFLOW_LOCKED",
      });
    });
  });

  describe("canAssignTask", () => {
    it("allows an owner ADMIN to assign their Task", () => {
      const teamTask = { ...makeTask("PENDING"), scope: "TEAM" as const, teamId: "team-1" };
      expect(canAssignTask(makeViewer("ADMIN"), teamTask)).toBe(true);
    });

    it("blocks a non-owner ADMIN even when the Task is in their Team", () => {
      const otherOwnerTask = {
        ...makeTask("PENDING"),
        scope: "TEAM" as const,
        teamId: "team-1",
        owner: { id: "other-admin", name: "Other Admin", role: "ADMIN" as const },
      };
      expect(canAssignTask(makeViewer("ADMIN"), otherOwnerTask)).toBe(false);
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

    it("allows the current Responsible User or Super Admin to complete a GLOBAL direct task", () => {
      const globalTask = {
        ...makeTask("IN_PROGRESS"),
        scope: "GLOBAL" as const,
        completionMode: "DIRECT" as const,
        responsible: { id: "user-test", name: "Assigned Member", role: "MEMBER" },
      };
      expect(canDirectCompleteTask(makeViewer("ADMIN"), globalTask)).toBe(true);
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
      expect(isTaskAttachmentLifecycleEditable(makeTask("IN_PROGRESS"))).toBe(true);
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

      it("allows Responsible MEMBER when task is IN_PROGRESS", () => {
        const inProgressTask: Task = {
          ...sentGlobalTask,
          status: "IN_PROGRESS",
          startedAt: "2026-09-28T10:00:00.000Z",
        };
        expect(canUploadTaskAttachment(responsibleMember, inProgressTask)).toBe(true);
      });

      it("allows Owner ADMIN and SUPER_ADMIN on TEAM IN_PROGRESS task", () => {
        const teamInProgressTask: Task = {
          ...pendingDistributionTask,
          scope: "TEAM",
          status: "IN_PROGRESS",
          startedAt: "2026-09-28T10:00:00.000Z",
          distribution: null,
        };
        expect(canUploadTaskAttachment(ownerAdmin, teamInProgressTask)).toBe(true);
        expect(canUploadTaskAttachment(sa, teamInProgressTask)).toBe(true);
      });

      it("blocks Owner ADMIN and SUPER_ADMIN on GLOBAL SENT IN_PROGRESS task", () => {
        const sentGlobalInProgress: Task = {
          ...sentGlobalTask,
          status: "IN_PROGRESS",
          startedAt: "2026-09-28T10:00:00.000Z",
        };
        expect(canUploadTaskAttachment(ownerAdmin, sentGlobalInProgress)).toBe(false);
        expect(canUploadTaskAttachment(sa, sentGlobalInProgress)).toBe(false);
      });

      it("blocks non-owner ADMIN on editable task with PENDING distribution", () => {
        expect(canUploadTaskAttachment(otherAdmin, pendingDistributionTask)).toBe(false);
      });

      it("blocks null viewer", () => {
        expect(canUploadTaskAttachment(null, sentGlobalTask)).toBe(false);
      });

      it("explains upload availability and stays consistent with upload permission plus capacity", () => {
        const submittedTask: Task = {
          ...pendingDistributionTask,
          status: "SUBMITTED",
        };
        const sentGlobalInProgress: Task = {
          ...sentGlobalTask,
          status: "IN_PROGRESS",
          startedAt: "2026-09-28T10:00:00.000Z",
        };

        expect(getTaskAttachmentUploadState(unrelatedMember, sentGlobalTask, 0)).toEqual({
          canUpload: false,
          reason: "NOT_RESPONSIBLE",
        });
        expect(getTaskAttachmentUploadState(ownerAdmin, submittedTask, 0)).toEqual({
          canUpload: false,
          reason: "LIFECYCLE_LOCKED",
        });
        expect(getTaskAttachmentUploadState(ownerAdmin, sentGlobalTask, 0)).toEqual({
          canUpload: false,
          reason: "DISTRIBUTION_LOCKED",
        });
        expect(
          getTaskAttachmentUploadState(responsibleMember, sentGlobalTask, MAX_TASK_ATTACHMENTS),
        ).toEqual({
          canUpload: false,
          reason: "LIMIT_REACHED",
        });
        expect(getTaskAttachmentUploadState(responsibleMember, sentGlobalInProgress, 0)).toEqual({
          canUpload: true,
          reason: "ALLOWED",
        });

        const cases: Array<[OperixViewer | null, Task, number]> = [
          [responsibleMember, sentGlobalInProgress, 0],
          [ownerAdmin, sentGlobalTask, 0],
          [ownerAdmin, submittedTask, 0],
          [unrelatedMember, sentGlobalTask, 0],
          [responsibleMember, sentGlobalTask, MAX_TASK_ATTACHMENTS],
          [null, sentGlobalTask, 0],
        ];

        cases.forEach(([viewer, task, attachmentCount]) => {
          expect(getTaskAttachmentUploadState(viewer, task, attachmentCount).canUpload).toBe(
            canUploadTaskAttachment(viewer, task) && attachmentCount < MAX_TASK_ATTACHMENTS,
          );
        });
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

      it("allows delete when task is TEAM IN_PROGRESS according to authority", () => {
        const teamInProgressTask: Task = {
          ...pendingDistributionTask,
          scope: "TEAM",
          status: "IN_PROGRESS",
          startedAt: "2026-09-28T10:00:00.000Z",
          distribution: null,
        };
        expect(
          canDeleteTaskAttachment(responsibleMember, teamInProgressTask, memberAttachment),
        ).toBe(true);
        expect(
          canDeleteTaskAttachment(responsibleMember, teamInProgressTask, adminAttachment),
        ).toBe(false);
        expect(canDeleteTaskAttachment(ownerAdmin, teamInProgressTask, adminAttachment)).toBe(true);
        expect(canDeleteTaskAttachment(sa, teamInProgressTask, adminAttachment)).toBe(true);
      });

      it("allows Responsible Member own-delete on GLOBAL SENT IN_PROGRESS task", () => {
        const sentGlobalInProgress: Task = {
          ...sentGlobalTask,
          status: "IN_PROGRESS",
          startedAt: "2026-09-28T10:00:00.000Z",
        };
        expect(
          canDeleteTaskAttachment(responsibleMember, sentGlobalInProgress, memberAttachment),
        ).toBe(true);
        expect(
          canDeleteTaskAttachment(responsibleMember, sentGlobalInProgress, adminAttachment),
        ).toBe(false);
        expect(canDeleteTaskAttachment(ownerAdmin, sentGlobalInProgress, adminAttachment)).toBe(
          false,
        );
        expect(canDeleteTaskAttachment(sa, sentGlobalInProgress, adminAttachment)).toBe(false);
      });

      it("locks delete once the task is SUBMITTED", () => {
        const submittedTask: Task = {
          ...pendingDistributionTask,
          status: "SUBMITTED",
          startedAt: "2026-09-28T10:00:00.000Z",
        };
        expect(canDeleteTaskAttachment(responsibleMember, submittedTask, memberAttachment)).toBe(
          false,
        );
        expect(canDeleteTaskAttachment(ownerAdmin, submittedTask, adminAttachment)).toBe(false);
        expect(canDeleteTaskAttachment(sa, submittedTask, adminAttachment)).toBe(false);
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

    it("allows any current Responsible User to start an assigned task", () => {
      const viewer = makeViewer("SUPER_ADMIN");
      const task: Task = {
        ...makeTask("ASSIGNED"),
        responsible: { id: viewer.userId, name: "SA", role: "SUPER_ADMIN" },
      };
      expect(canStartTask(viewer, task)).toBe(true);
    });

    it("evaluates canSubmitTask correctly for roles and completion modes", () => {
      const memberViewer = makeViewer("MEMBER");
      const reviewTask: Task = {
        ...makeTask("IN_PROGRESS", "REVIEW_REQUIRED"),
        responsible: { id: memberViewer.userId, name: "Tupur", role: "MEMBER" },
      };
      const directTask: Task = {
        ...makeTask("IN_PROGRESS", "DIRECT"),
        responsible: { id: memberViewer.userId, name: "Tupur", role: "MEMBER" },
      };
      const unrelatedReviewTask: Task = {
        ...reviewTask,
        responsible: { id: "other-user", name: "Other", role: "MEMBER" },
      };

      // MEMBER + IN_PROGRESS + REVIEW_REQUIRED can submit
      expect(canSubmitTask(memberViewer, reviewTask)).toBe(true);

      // Unrelated MEMBER cannot submit
      expect(canSubmitTask(memberViewer, unrelatedReviewTask)).toBe(false);

      // MEMBER + IN_PROGRESS + DIRECT cannot submit
      expect(canSubmitTask(memberViewer, directTask)).toBe(false);

      // A responsible Admin can submit their own individual review Task.
      expect(canSubmitTask(makeViewer("ADMIN"), reviewTask)).toBe(true);
      expect(canSubmitTask(makeViewer("SUPER_ADMIN"), reviewTask)).toBe(false);
      expect(canSubmitTask(null, reviewTask)).toBe(false);

      // Non-IN_PROGRESS status cannot submit
      expect(canSubmitTask(memberViewer, makeTask("ASSIGNED", "REVIEW_REQUIRED"))).toBe(false);
    });

    it("evaluates canResubmitTask correctly for roles and completion modes", () => {
      const memberViewer = makeViewer("MEMBER");
      const reviewTask: Task = {
        ...makeTask("REVISION_REQUIRED", "REVIEW_REQUIRED"),
        responsible: { id: memberViewer.userId, name: "Tupur", role: "MEMBER" },
      };
      const directTask: Task = {
        ...makeTask("REVISION_REQUIRED", "DIRECT"),
        responsible: { id: memberViewer.userId, name: "Tupur", role: "MEMBER" },
      };
      const unrelatedReviewTask: Task = {
        ...reviewTask,
        responsible: { id: "other-user", name: "Other", role: "MEMBER" },
      };

      // MEMBER + REVISION_REQUIRED + REVIEW_REQUIRED can resubmit
      expect(canResubmitTask(memberViewer, reviewTask)).toBe(true);

      // Unrelated MEMBER cannot resubmit
      expect(canResubmitTask(memberViewer, unrelatedReviewTask)).toBe(false);

      // MEMBER + REVISION_REQUIRED + DIRECT cannot resubmit
      expect(canResubmitTask(memberViewer, directTask)).toBe(false);

      // A responsible Admin can resubmit their own individual review Task.
      expect(canResubmitTask(makeViewer("ADMIN"), reviewTask)).toBe(true);
      expect(canResubmitTask(makeViewer("SUPER_ADMIN"), reviewTask)).toBe(false);
      expect(canResubmitTask(null, reviewTask)).toBe(false);

      // Non-REVISION_REQUIRED status cannot resubmit
      expect(canResubmitTask(memberViewer, makeTask("IN_PROGRESS", "REVIEW_REQUIRED"))).toBe(false);
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

  describe("canRequestSubmissionAiReview", () => {
    it("allows the explicit reviewer while the Task awaits review", () => {
      expect(canRequestSubmissionAiReview(makeViewer("ADMIN"), makeTask("SUBMITTED"))).toBe(true);
      expect(canRequestSubmissionAiReview(makeViewer("ADMIN"), makeTask("RESUBMITTED"))).toBe(true);
    });

    it("allows a Super Admin who is the explicit reviewer", () => {
      const submitted = makeTask("SUBMITTED");

      // Pre-existing review permission is broader than the review API.
      expect(canReviewTaskSubmission(makeViewer("SUPER_ADMIN"), submitted)).toBe(true);
      expect(canRequestSubmissionAiReview(makeViewer("SUPER_ADMIN"), submitted)).toBe(true);
    });

    it("denies MEMBER and unauthenticated viewers", () => {
      expect(canRequestSubmissionAiReview(makeViewer("MEMBER"), makeTask("SUBMITTED"))).toBe(false);
      expect(canRequestSubmissionAiReview(null, makeTask("SUBMITTED"))).toBe(false);
    });

    it("denies an Admin who is not the explicit reviewer", () => {
      expect(
        canRequestSubmissionAiReview(makeViewer("ADMIN"), {
          ...makeTask("SUBMITTED"),
          reviewer: { id: "other-admin", name: "Other Admin", role: "ADMIN" },
        }),
      ).toBe(false);
    });

    it("does not derive explicit review authority from viewer scope", () => {
      const globalAdmin: OperixViewer = { ...makeViewer("ADMIN"), scope: { type: "GLOBAL" } };
      expect(canRequestSubmissionAiReview(globalAdmin, makeTask("SUBMITTED"))).toBe(true);
    });

    it("denies DIRECT completion Tasks, which never accept submissions", () => {
      expect(
        canRequestSubmissionAiReview(makeViewer("ADMIN"), makeTask("SUBMITTED", "DIRECT")),
      ).toBe(false);
    });

    it("denies Task statuses that are not awaiting a review decision", () => {
      const blockedStatuses: Task["status"][] = [
        "PENDING",
        "ASSIGNED",
        "IN_PROGRESS",
        "UNDER_REVIEW",
        "COMPLETED",
        "REVISION_REQUIRED",
        "CANCELLED",
      ];

      for (const status of blockedStatuses) {
        expect(canRequestSubmissionAiReview(makeViewer("ADMIN"), makeTask(status))).toBe(false);
      }
    });

    it("never grants AI review where real review is denied", () => {
      for (const status of ["SUBMITTED", "RESUBMITTED"] as Task["status"][]) {
        const aiAllowed = canRequestSubmissionAiReview(makeViewer("ADMIN"), makeTask(status));
        expect(aiAllowed).toBe(canReviewTaskSubmission(makeViewer("ADMIN"), makeTask(status)));
      }
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
