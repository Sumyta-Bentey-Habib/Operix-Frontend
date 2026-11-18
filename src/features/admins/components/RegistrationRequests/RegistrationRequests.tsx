"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { AUTH_STRINGS } from "@/constants/auth-strings";
import { registrationApi } from "@/features/auth/api/registrationApi";
import type {
  ApproveRegistrationInput,
  RegistrationRequest,
  RegistrationRequestStatus,
} from "@/features/auth/types/registration.types";
import { isOperixApiError } from "@/lib/api";
import { formatDate } from "@/utils/date";
import { useRegistrationRequests } from "../../hooks/use-registration-requests";
import { RegistrationApprovalDialog } from "../RegistrationApprovalDialog";
import styles from "./RegistrationRequests.module.css";

type ReviewTab = Extract<RegistrationRequestStatus, "PENDING" | "APPROVED">;

type ResendPhase = "idle" | "sending" | "failed" | "cooldown";

interface ResendRowState {
  phase: ResendPhase;
  retryAfterSeconds?: number;
}

interface ToastState {
  message: string;
  tone: "success" | "warning";
}

const RESEND_COOLDOWN_SECONDS = 60;

const readRetryAfterSeconds = (details: unknown): number | null => {
  if (!details || typeof details !== "object") return null;
  const value = (details as Record<string, unknown>).retryAfterSeconds;
  return typeof value === "number" && Number.isFinite(value) ? Math.max(1, Math.ceil(value)) : null;
};

const formatCooldown = (seconds: number): string =>
  AUTH_STRINGS.adminApproval.resendCooldownTemplate.replace("{seconds}", String(seconds));

export const RegistrationRequests: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReviewTab>("PENDING");
  const { requests, loading, error, refresh } = useRegistrationRequests(activeTab);

  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [approvalPending, setApprovalPending] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [resendState, setResendState] = useState<Record<string, ResendRowState>>({});

  const setRowState = useCallback((requestId: string, next: ResendRowState) => {
    setResendState((current) => ({ ...current, [requestId]: next }));
  }, []);

  const hasCooldown = useMemo(
    () => Object.values(resendState).some((state) => state.phase === "cooldown"),
    [resendState],
  );

  useEffect(() => {
    if (!hasCooldown) return;
    const intervalId = window.setInterval(() => {
      setResendState((current) => {
        let changed = false;
        const next: Record<string, ResendRowState> = {};

        Object.entries(current).forEach(([requestId, state]) => {
          if (state.phase !== "cooldown") {
            next[requestId] = state;
            return;
          }
          const remaining = (state.retryAfterSeconds ?? 1) - 1;
          if (remaining <= 0) {
            next[requestId] = { phase: "idle" };
            changed = true;
            return;
          }
          next[requestId] = {
            phase: "cooldown",
            retryAfterSeconds: remaining,
          };
        });

        return changed ? next : current;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [hasCooldown]);

  const handleTabChange = (tab: ReviewTab) => {
    setActiveTab(tab);
    setToast(null);
    setApprovalError(null);
  };

  const handleApprove = async (requestId: string, input: ApproveRegistrationInput) => {
    setApprovalPending(true);
    setApprovalError(null);
    try {
      const result = await registrationApi.approveRequest(requestId, input);
      const accepted = result.setupEmail?.status === "ACCEPTED";
      setSelectedRequest(null);
      setToast({
        message: accepted
          ? AUTH_STRINGS.adminApproval.approvalAccepted
          : AUTH_STRINGS.adminApproval.approvalFailed,
        tone: accepted ? "success" : "warning",
      });
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Approval failed.";
      setApprovalError(message);
    } finally {
      setApprovalPending(false);
    }
  };

  const handleReject = async (request: RegistrationRequest) => {
    if (
      !window.confirm(
        `Are you sure you want to reject the registration request for ${request.name}?`,
      )
    ) {
      return;
    }
    try {
      await registrationApi.rejectRequest(request.id, {});
      setToast({
        message: AUTH_STRINGS.adminApproval.rejectionSuccess,
        tone: "success",
      });
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Rejection failed.";
      setApprovalError(message);
    }
  };

  const handleResend = async (request: RegistrationRequest) => {
    setRowState(request.id, { phase: "sending" });
    try {
      const result = await registrationApi.resendSetup(request.id);
      if (result.setupEmail?.status === "ACCEPTED") {
        setToast({
          message: AUTH_STRINGS.adminApproval.resendAccepted,
          tone: "success",
        });
        setRowState(request.id, {
          phase: "cooldown",
          retryAfterSeconds: RESEND_COOLDOWN_SECONDS,
        });
        return;
      }
      setRowState(request.id, { phase: "failed" });
      setToast({
        message: AUTH_STRINGS.adminApproval.resendFailed,
        tone: "warning",
      });
    } catch (err) {
      if (isOperixApiError(err) && err.status === 429) {
        const retryAfter = readRetryAfterSeconds(err.details) ?? RESEND_COOLDOWN_SECONDS;
        setRowState(request.id, {
          phase: "cooldown",
          retryAfterSeconds: retryAfter,
        });
        setToast({
          message: formatCooldown(retryAfter),
          tone: "warning",
        });
        return;
      }
      setRowState(request.id, { phase: "failed" });
      setToast({
        message: AUTH_STRINGS.adminApproval.resendFailed,
        tone: "warning",
      });
    }
  };

  const isApprovedTab = activeTab === "APPROVED";

  const emptyTitle = isApprovedTab
    ? AUTH_STRINGS.adminApproval.noApprovedRequestsTitle
    : AUTH_STRINGS.adminApproval.noPendingRequestsTitle;
  const emptyMessage = isApprovedTab
    ? AUTH_STRINGS.adminApproval.noApprovedRequestsMessage
    : AUTH_STRINGS.adminApproval.noPendingRequestsMessage;

  const renderResendControl = (request: RegistrationRequest) => {
    if (request.passwordConfiguredAt) {
      return <span className={styles.mutedCell}>—</span>;
    }

    const rowState = resendState[request.id] ?? { phase: "idle" as const };

    if (rowState.phase === "sending") {
      return (
        <button type="button" className={styles.resendBtn} disabled>
          {AUTH_STRINGS.adminApproval.resendSending}
        </button>
      );
    }

    if (rowState.phase === "cooldown") {
      const seconds = Math.max(1, rowState.retryAfterSeconds ?? 1);
      return (
        <button type="button" className={styles.resendBtn} disabled>
          {formatCooldown(seconds)}
        </button>
      );
    }

    return (
      <div className={styles.resendCell}>
        <button
          type="button"
          className={styles.resendBtn}
          onClick={() => void handleResend(request)}
        >
          {AUTH_STRINGS.adminApproval.resendAction}
        </button>
        {rowState.phase === "failed" && (
          <span className={styles.resendError}>{AUTH_STRINGS.adminApproval.resendFailed}</span>
        )}
      </div>
    );
  };

  const renderPasswordSetup = (request: RegistrationRequest) =>
    request.passwordConfiguredAt ? (
      <span className={styles.setupCompleted}>
        {AUTH_STRINGS.adminApproval.passwordSetupCompleted}
      </span>
    ) : (
      <span className={styles.setupPending}>{AUTH_STRINGS.adminApproval.passwordSetupPending}</span>
    );

  return (
    <div className={styles.container}>
      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "PENDING"}
          className={`${styles.tab} ${activeTab === "PENDING" ? styles.tabActive : ""}`}
          onClick={() => handleTabChange("PENDING")}
        >
          {AUTH_STRINGS.adminApproval.pendingTabLabel}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "APPROVED"}
          className={`${styles.tab} ${activeTab === "APPROVED" ? styles.tabActive : ""}`}
          onClick={() => handleTabChange("APPROVED")}
        >
          {AUTH_STRINGS.adminApproval.approvedTabLabel}
        </button>
      </div>

      {toast && (
        <div
          className={toast.tone === "warning" ? styles.warningToast : styles.successToast}
          role="status"
        >
          <span>{toast.tone === "warning" ? "!" : "✓"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {error && (
        <ErrorState
          message={error instanceof Error ? error.message : String(error)}
          onRetry={() => void refresh()}
        />
      )}

      {loading ? (
        <LoadingState message="Loading registration requests..." />
      ) : requests.length === 0 ? (
        <EmptyState title={emptyTitle} message={emptyMessage} />
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Applicant</th>
                <th className={styles.th}>Employee ID</th>
                {isApprovedTab ? (
                  <>
                    <th className={styles.th}>Role</th>
                    <th className={styles.th}>{AUTH_STRINGS.adminApproval.passwordSetupColumn}</th>
                    <th className={styles.th}>{AUTH_STRINGS.adminApproval.approvedColumn}</th>
                  </>
                ) : (
                  <>
                    <th className={styles.th}>Requested Designation</th>
                    <th className={styles.th}>Submitted Date</th>
                    <th className={styles.th}>Status</th>
                  </>
                )}
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.userCell}>
                      <span className={styles.userName}>{request.name}</span>
                      <span className={styles.userEmail}>{request.email}</span>
                    </div>
                  </td>
                  <td className={styles.td}>{request.selectedEmployeeId || "—"}</td>
                  {isApprovedTab ? (
                    <>
                      <td className={styles.td}>{request.selectedRole || "—"}</td>
                      <td className={styles.td}>{renderPasswordSetup(request)}</td>
                      <td className={styles.td}>
                        {request.approvedAt ? formatDate(request.approvedAt) : "—"}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className={styles.td}>{request.selectedDesignation || "—"}</td>
                      <td className={styles.td}>{formatDate(request.createdAt)}</td>
                      <td className={styles.td}>
                        <span className={styles.statusBadge}>{request.status}</span>
                      </td>
                    </>
                  )}
                  <td className={styles.td}>
                    {isApprovedTab ? (
                      renderResendControl(request)
                    ) : (
                      <div className={styles.actionsCell}>
                        <button
                          type="button"
                          className={styles.reviewBtn}
                          onClick={() => {
                            setApprovalError(null);
                            setSelectedRequest(request);
                          }}
                        >
                          {AUTH_STRINGS.adminApproval.reviewAction}
                        </button>
                        <button
                          type="button"
                          className={styles.rejectBtn}
                          onClick={() => void handleReject(request)}
                        >
                          {AUTH_STRINGS.adminApproval.rejectAction}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RegistrationApprovalDialog
        request={selectedRequest}
        pending={approvalPending}
        error={approvalError}
        onApprove={handleApprove}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
};
