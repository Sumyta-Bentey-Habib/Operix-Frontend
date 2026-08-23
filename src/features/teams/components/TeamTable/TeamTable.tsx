"use client";

import Link from "next/link";
import { canEditTeam, canReassignTeamAdmin } from "@/lib/auth/permissions";
import type { OperixViewer } from "@/types/auth";
import { formatDisplayDate } from "@/utils/date";
import type { Team } from "../../types/team.types";
import styles from "./TeamTable.module.css";

export interface TeamTableProps {
  teams: Team[];
  viewer: OperixViewer;
  onEdit: (team: Team) => void;
  onReassign: (team: Team) => void;
}

export const TeamTable = ({ teams, viewer, onEdit, onReassign }: TeamTableProps) => (
  <div className={styles.tableWrap}>
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Team Name</th>
          <th>Admin ID</th>
          <th>Created</th>
          <th>Updated</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {teams.map((team) => (
          <tr key={team.id}>
            <td>{team.name}</td>
            <td className={styles.mono}>{team.adminId}</td>
            <td>{formatDisplayDate(team.createdAt)}</td>
            <td>{formatDisplayDate(team.updatedAt)}</td>
            <td>
              <div className={styles.actions}>
                <Link className={styles.button} href={`/teams/${team.id}`}>
                  View
                </Link>
                {canEditTeam(viewer) && (
                  <button type="button" className={styles.button} onClick={() => onEdit(team)}>
                    Edit
                  </button>
                )}
                {canReassignTeamAdmin(viewer) && (
                  <button type="button" className={styles.button} onClick={() => onReassign(team)}>
                    Reassign Admin
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
