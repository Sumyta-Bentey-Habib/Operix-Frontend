"use client";

import React, { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { AUTH_STRINGS } from "@/constants/auth-strings";
import { registrationApi } from "@/features/auth/api/registrationApi";
import type {
  RegistrationRequest,
  ApproveRegistrationInput,
} from "@/features/auth/types/registration.types";
import { formatDate } from "@/utils/date";
import { useRegistrationRequests } from "../../hooks/use-registration-requests";
import { RegistrationApprovalDialog } from "../RegistrationApprovalDialog";
import styles from "./RegistrationRequests.module.css";

export const RegistrationRequests: React.FC = () => {
  const { requests, loading, error, refresh } = useRegistrationRequests();

  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [approvalPending, setApprovalPending] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleApprove = async (requestId: string, input: ApproveRegistrationInput) => {
    setApprovalPending(true);
    setApprovalError(null);
    try {
      await registrationApi.approveRequest(requestId, input);
      setSelectedRequest(null);
      setSuccessMessage(AUTH_STRINGS.adminApproval.approvalSuccess);
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
      setSuccessMessage(AUTH_STRINGS.adminApproval.rejectionSuccess);
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Rejection failed.";
      setApprovalError(message);
    }
  };

  if (loading) {
    return <LoadingState message="Loading registration requests..." />;
  }

  if (error && requests.length === 0) {
    return (
      <div className={styles.container}>
        <EmptyState
          title={AUTH_STRINGS.adminApproval.noPendingRequestsTitle}
          message={AUTH_STRINGS.adminApproval.noPendingRequestsMessage}
        />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        title={AUTH_STRINGS.adminApproval.noPendingRequestsTitle}
        message={AUTH_STRINGS.adminApproval.noPendingRequestsMessage}
      />
    );
  }

  return (
    <div className={styles.container}>
      {successMessage && (
        <div className={styles.successToast} role="status">
          <span>✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <ErrorState
          message={error instanceof Error ? error.message : String(error)}
          onRetry={() => void refresh()}
        />
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Applicant</th>
              <th className={styles.th}>Requested Designation</th>
              <th className={styles.th}>Employee ID</th>
              <th className={styles.th}>Submitted Date</th>
              <th className={styles.th}>Status</th>
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
                <td className={styles.td}>{request.designation || "—"}</td>
                <td className={styles.td}>{request.employeeId || "—"}</td>
                <td className={styles.td}>{formatDate(request.createdAt)}</td>
                <td className={styles.td}>
                  <span className={styles.statusBadge}>{request.status}</span>
                </td>
                <td className={styles.td}>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
