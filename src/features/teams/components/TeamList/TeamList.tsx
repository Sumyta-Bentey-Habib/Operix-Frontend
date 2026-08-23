"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/context/AuthContext";
import { canCreateTeam } from "@/lib/auth/permissions";
import { teamApi } from "../../api/team.api";
import { useTeams } from "../../hooks/use-teams";
import type { CreateTeamInput, Team, UpdateTeamInput } from "../../types/team.types";
import { AdminPicker } from "../AdminPicker";
import { getTeamErrorView } from "../team-errors";
import { ReassignAdminDialog } from "../ReassignAdminDialog";
import { TeamForm } from "../TeamForm";
import { TeamTable } from "../TeamTable";
import styles from "./TeamList.module.css";

export const TeamList = () => {
  const { viewer } = useAuth();
  const { teams, meta, loading, error, setPage, refresh } = useTeams();
  const [creating, setCreating] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [createPending, setCreatePending] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [updatePending, setUpdatePending] = useState(false);
  const [reassignTeam, setReassignTeam] = useState<Team | null>(null);
  const [reassignPending, setReassignPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [reassignError, setReassignError] = useState<string | null>(null);

  if (!viewer) return null;

  const handleCreate = async (input: CreateTeamInput | UpdateTeamInput) => {
    if (createPending || !canCreateTeam(viewer)) return;
    setCreatePending(true);
    setFormError(null);

    try {
      await teamApi.create(input as CreateTeamInput);
      setCreating(false);
      setSelectedAdminId("");
      await refresh();
    } catch (createError) {
      setFormError(getTeamErrorView(createError).message);
    } finally {
      setCreatePending(false);
    }
  };

  const handleUpdate = async (input: CreateTeamInput | UpdateTeamInput) => {
    if (!editingTeam || updatePending || Object.keys(input).length === 0) return;
    setUpdatePending(true);
    setFormError(null);

    try {
      await teamApi.update(editingTeam.id, input as UpdateTeamInput);
      setEditingTeam(null);
      await refresh();
    } catch (updateError) {
      setFormError(getTeamErrorView(updateError).message);
    } finally {
      setUpdatePending(false);
    }
  };

  const handleReassign = async (adminId: string) => {
    if (!reassignTeam || reassignPending || reassignTeam.adminId === adminId) return;
    setReassignPending(true);
    setReassignError(null);

    try {
      await teamApi.reassignAdmin(reassignTeam.id, { adminId });
      setReassignTeam(null);
      await refresh();
    } catch (reassignUpdateError) {
      setReassignError(getTeamErrorView(reassignUpdateError).message);
    } finally {
      setReassignPending(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Management</p>
          <h1 className={styles.title}>Teams</h1>
          <p className={styles.description}>
            Manage Team responsibility and membership commands without fabricating member counts or
            assignment state that the backend does not expose.
          </p>
        </div>
        {canCreateTeam(viewer) && (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              setFormError(null);
              setSelectedAdminId("");
              setCreating(true);
            }}
          >
            Create Team
          </button>
        )}
      </div>

      {loading && <LoadingState message="Loading Teams..." />}
      {error && !loading && (
        <ErrorState message={getTeamErrorView(error).message} onRetry={() => void refresh()} />
      )}
      {!loading && !error && teams.length === 0 && (
        <EmptyState title="No Teams found" message="No Teams are available in this scope yet." />
      )}
      {!loading && !error && teams.length > 0 && (
        <>
          <TeamTable
            teams={teams}
            viewer={viewer}
            onEdit={(team) => {
              setFormError(null);
              setEditingTeam(team);
            }}
            onReassign={(team) => {
              setReassignError(null);
              setReassignTeam(team);
            }}
          />
          <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
        </>
      )}

      {canCreateTeam(viewer) && (
        <Modal
          open={creating}
          title="Create Team"
          description="Create a Team with an active Admin. The backend validates Admin status again."
          onClose={() => !createPending && setCreating(false)}
        >
          <TeamForm
            mode="create"
            adminId={selectedAdminId}
            pending={createPending}
            error={formError}
            onSubmit={handleCreate}
            onCancel={() => setCreating(false)}
          >
            <AdminPicker
              selectedAdminId={selectedAdminId}
              onSelect={(admin) => setSelectedAdminId(admin.id)}
            />
          </TeamForm>
        </Modal>
      )}

      <Modal
        open={Boolean(editingTeam)}
        title="Rename Team"
        description="Only the Team name is changed here. Admin reassignment uses a separate command."
        onClose={() => !updatePending && setEditingTeam(null)}
      >
        {editingTeam && (
          <TeamForm
            mode="edit"
            team={editingTeam}
            pending={updatePending}
            error={formError}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTeam(null)}
          />
        )}
      </Modal>

      <ReassignAdminDialog
        team={reassignTeam}
        pending={reassignPending}
        error={reassignError}
        onSubmit={handleReassign}
        onClose={() => !reassignPending && setReassignTeam(null)}
      />
    </section>
  );
};
