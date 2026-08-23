"use client";

import Link from "next/link";
import { useState } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import { canAssignMemberToTeam, canEditTeam, canReassignTeamAdmin } from "@/lib/auth/permissions";
import { isOperixApiError } from "@/lib/api";
import { formatDisplayDate } from "@/utils/date";
import { teamApi } from "../../api/team.api";
import { useTeam } from "../../hooks/use-team";
import type { CreateTeamInput, UpdateTeamInput } from "../../types/team.types";
import { AssignMemberDialog } from "../AssignMemberDialog";
import { getTeamErrorView } from "../team-errors";
import { ReassignAdminDialog } from "../ReassignAdminDialog";
import { TeamForm } from "../TeamForm";
import styles from "./TeamDetails.module.css";

export interface TeamDetailsProps {
  teamId: string;
}

export const TeamDetails = ({ teamId }: TeamDetailsProps) => {
  const { viewer } = useAuth();
  const { team, loading, error, setTeam, refresh } = useTeam(teamId);
  const [editing, setEditing] = useState(false);
  const [updatePending, setUpdatePending] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignPending, setReassignPending] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignPending, setAssignPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [reassignError, setReassignError] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);

  if (!viewer) return null;

  const handleUpdate = async (input: CreateTeamInput | UpdateTeamInput) => {
    if (!team || updatePending || Object.keys(input).length === 0 || !canEditTeam(viewer)) return;
    setUpdatePending(true);
    setFormError(null);

    try {
      const updated = await teamApi.update(team.id, input as UpdateTeamInput);
      setTeam(updated);
      setEditing(false);
    } catch (updateError) {
      setFormError(getTeamErrorView(updateError).message);
    } finally {
      setUpdatePending(false);
    }
  };

  const handleReassign = async (adminId: string) => {
    if (!team || reassignPending || team.adminId === adminId || !canReassignTeamAdmin(viewer)) {
      return;
    }
    setReassignPending(true);
    setReassignError(null);

    try {
      const updated = await teamApi.reassignAdmin(team.id, { adminId });
      setTeam(updated);
      setReassignOpen(false);
    } catch (reassignUpdateError) {
      setReassignError(getTeamErrorView(reassignUpdateError).message);
    } finally {
      setReassignPending(false);
    }
  };

  const handleAssign = async (memberId: string) => {
    if (!team || assignPending || !canAssignMemberToTeam(viewer)) return;
    setAssignPending(true);
    setAssignError(null);

    try {
      const updated = await teamApi.assignMember(team.id, { memberId });
      setTeam(updated);
      setAssignOpen(false);
    } catch (assignUpdateError) {
      setAssignError(getTeamErrorView(assignUpdateError).message);
    } finally {
      setAssignPending(false);
    }
  };

  if (loading) return <LoadingState message="Loading Team details..." />;

  if (error || !team) {
    const view = getTeamErrorView(error);
    return (
      <ErrorState
        title={isOperixApiError(error) && error.code === "TEAM_NOT_FOUND" ? view.title : undefined}
        message={view.message}
        onRetry={() => void refresh()}
      />
    );
  }

  return (
    <section className={styles.section}>
      <Link className={styles.backLink} href="/teams">
        Back to Teams
      </Link>
      <article className={styles.card}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>{team.name}</h1>
            <p className={styles.subtitle}>Admin ID {team.adminId}</p>
          </div>
          <div className={styles.actions}>
            {canEditTeam(viewer) && (
              <button
                type="button"
                className={styles.button}
                onClick={() => {
                  setFormError(null);
                  setEditing(true);
                }}
              >
                Edit
              </button>
            )}
            {canReassignTeamAdmin(viewer) && (
              <button
                type="button"
                className={styles.button}
                onClick={() => {
                  setReassignError(null);
                  setReassignOpen(true);
                }}
              >
                Reassign Admin
              </button>
            )}
            {canAssignMemberToTeam(viewer) && (
              <button
                type="button"
                className={styles.button}
                onClick={() => {
                  setAssignError(null);
                  setAssignOpen(true);
                }}
              >
                Assign Member
              </button>
            )}
          </div>
        </header>
        <div className={styles.details}>
          <DetailItem label="Name" value={team.name} />
          <DetailItem label="Admin ID" value={team.adminId} />
          <DetailItem label="Created" value={formatDisplayDate(team.createdAt)} />
          <DetailItem label="Updated" value={formatDisplayDate(team.updatedAt)} />
        </div>
      </article>

      <Modal
        open={editing}
        title="Rename Team"
        description="Only the Team name is changed here."
        onClose={() => !updatePending && setEditing(false)}
      >
        <TeamForm
          mode="edit"
          team={team}
          pending={updatePending}
          error={formError}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      </Modal>

      <ReassignAdminDialog
        team={reassignOpen && canReassignTeamAdmin(viewer) ? team : null}
        pending={reassignPending}
        error={reassignError}
        onSubmit={handleReassign}
        onClose={() => !reassignPending && setReassignOpen(false)}
      />

      <AssignMemberDialog
        team={assignOpen && canAssignMemberToTeam(viewer) ? team : null}
        pending={assignPending}
        error={assignError}
        onSubmit={handleAssign}
        onClose={() => !assignPending && setAssignOpen(false)}
      />
    </section>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className={styles.item}>
    <span className={styles.label}>{label}</span>
    <span className={styles.value}>{value}</span>
  </div>
);
