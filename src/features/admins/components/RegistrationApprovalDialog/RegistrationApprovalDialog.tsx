"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { AUTH_STRINGS } from "@/constants/auth-strings";
import type {
  RegistrationRequest,
  ApproveRegistrationInput,
} from "@/features/auth/types/registration.types";
import { teamApi } from "@/features/teams/api/team.api";
import type { Team } from "@/features/teams/types/team.types";
import { ShieldCheckIcon, CheckCircleIcon } from "@/components/icons";
import styles from "./RegistrationApprovalDialog.module.css";

interface RegistrationApprovalFormProps {
  request: RegistrationRequest;
  pending?: boolean;
  error?: string | null;
  onApprove: (requestId: string, input: ApproveRegistrationInput) => Promise<void>;
  onClose: () => void;
}

const RegistrationApprovalForm: React.FC<RegistrationApprovalFormProps> = ({
  request,
  pending = false,
  error = null,
  onApprove,
  onClose,
}) => {
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [employeeId, setEmployeeId] = useState(request.employeeId || "");
  const [designation, setDesignation] = useState(request.designation || "");
  const [teamId, setTeamId] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    let isMounted = true;
    teamApi
      .list({ page: 1, limit: 100 })
      .then((res) => {
        if (isMounted) {
          setTeams(res.data);
        }
      })
      .catch(() => {
        // Best effort loading
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleApprove = async () => {
    await onApprove(request.id, {
      role,
      employeeId: employeeId.trim() || null,
      designation: designation.trim() || null,
      teamId: role === "MEMBER" && teamId ? teamId : null,
    });
  };

  return (
    <div className={styles.dialogBody}>
      {/* Applicant Summary */}
      <div className={styles.applicantSummary}>
        <div className={styles.applicantHeader}>
          <span className={styles.applicantName}>{request.name}</span>
          <span className={styles.applicantBadge}>{request.status}</span>
        </div>
        <span className={styles.applicantEmail}>{request.email}</span>
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">
          {error}
        </div>
      )}

      {/* Role Decision Selection */}
      <div>
        <p className={styles.sectionTitle}>{AUTH_STRINGS.adminApproval.roleSectionTitle}</p>
        <div className={styles.roleSelectorGrid}>
          <button
            type="button"
            className={`${styles.roleOptionCard} ${role === "ADMIN" ? styles.roleOptionSelected : ""}`}
            onClick={() => setRole("ADMIN")}
          >
            <div className={styles.roleOptionTitle}>
              <span>{AUTH_STRINGS.adminApproval.roleAdminLabel}</span>
              {role === "ADMIN" && <CheckCircleIcon size={18} />}
            </div>
            <p className={styles.roleOptionDesc}>{AUTH_STRINGS.adminApproval.roleAdminDesc}</p>
          </button>

          <button
            type="button"
            className={`${styles.roleOptionCard} ${role === "MEMBER" ? styles.roleOptionSelected : ""}`}
            onClick={() => setRole("MEMBER")}
          >
            <div className={styles.roleOptionTitle}>
              <span>{AUTH_STRINGS.adminApproval.roleMemberLabel}</span>
              {role === "MEMBER" && <CheckCircleIcon size={18} />}
            </div>
            <p className={styles.roleOptionDesc}>{AUTH_STRINGS.adminApproval.roleMemberDesc}</p>
          </button>
        </div>
      </div>

      {/* Profile Assignment Fields */}
      <div className={styles.formGroup}>
        <label className={styles.fieldLabel} htmlFor="approval-employee-id">
          {AUTH_STRINGS.adminApproval.employeeIdLabel}
        </label>
        <input
          id="approval-employee-id"
          type="text"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="e.g. EMP-9042"
          className={styles.textInput}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.fieldLabel} htmlFor="approval-designation">
          {AUTH_STRINGS.adminApproval.designationLabel}
        </label>
        <input
          id="approval-designation"
          type="text"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          placeholder="e.g. Quality Control Officer"
          className={styles.textInput}
        />
      </div>

      {role === "MEMBER" && teams.length > 0 && (
        <div className={styles.formGroup}>
          <label className={styles.fieldLabel} htmlFor="approval-team-id">
            {AUTH_STRINGS.adminApproval.teamAssignmentLabel}
          </label>
          <select
            id="approval-team-id"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className={styles.selectInput}
          >
            <option value="">{AUTH_STRINGS.adminApproval.noTeamOption}</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Informational Callout */}
      <div className={styles.infoCallout}>
        <span className={styles.infoIcon}>
          <ShieldCheckIcon size={18} />
        </span>
        <span>
          Approving this request will create the user account in <strong>{role}</strong> role and
          automatically dispatch an invitation email with a password setup link.
        </span>
      </div>

      {/* Dialog Actions */}
      <div className={styles.dialogActions}>
        <button type="button" disabled={pending} className={styles.cancelBtn} onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          disabled={pending}
          className={styles.approveBtn}
          onClick={handleApprove}
        >
          {pending
            ? AUTH_STRINGS.adminApproval.approvingBtn
            : AUTH_STRINGS.adminApproval.approveBtn}
        </button>
      </div>
    </div>
  );
};

export interface RegistrationApprovalDialogProps {
  request: RegistrationRequest | null;
  pending?: boolean;
  error?: string | null;
  onApprove: (requestId: string, input: ApproveRegistrationInput) => Promise<void>;
  onClose: () => void;
}

export const RegistrationApprovalDialog: React.FC<RegistrationApprovalDialogProps> = ({
  request,
  pending = false,
  error = null,
  onApprove,
  onClose,
}) => {
  return (
    <Modal
      open={Boolean(request)}
      title={AUTH_STRINGS.adminApproval.dialogTitle}
      description={AUTH_STRINGS.adminApproval.dialogDescription}
      onClose={() => !pending && onClose()}
    >
      {request && (
        <RegistrationApprovalForm
          key={request.id}
          request={request}
          pending={pending}
          error={error}
          onApprove={onApprove}
          onClose={onClose}
        />
      )}
    </Modal>
  );
};
