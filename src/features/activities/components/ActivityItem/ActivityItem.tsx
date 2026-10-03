import Link from "next/link";
import {
  ArrowUpRightIcon,
  CheckCircleIcon,
  ClockIcon,
  FileDocIcon,
  LockIcon,
  ShieldCheckIcon,
} from "@/components/icons";
import { formatDisplayDate } from "@/utils/date";
import type { ActivityRecord } from "../../types/activity.types";
import { formatActivityCode, getActivityActorName } from "../../utils/activity-display";
import { resolveActivityTargetHref } from "../../utils/activity-target";
import { ActivityMetadata } from "../ActivityMetadata";
import styles from "./ActivityItem.module.css";

const getActionMeta = (action: string) => {
  const upper = action.toUpperCase();
  if (upper.includes("PASSWORD") || upper.includes("AUTH") || upper.includes("SECURITY") || upper.includes("LOCK")) {
    return { Icon: LockIcon, toneClass: styles.securityTone };
  }
  if (upper.includes("APPROV") || upper.includes("SUCCESS") || upper.includes("COMPLET")) {
    return { Icon: CheckCircleIcon, toneClass: styles.successTone };
  }
  if (upper.includes("REGISTER") || upper.includes("REQUEST") || upper.includes("CREATE") || upper.includes("SUBMIT")) {
    return { Icon: FileDocIcon, toneClass: styles.infoTone };
  }
  if (upper.includes("REJECT") || upper.includes("CANCEL") || upper.includes("DELETE") || upper.includes("DENY")) {
    return { Icon: ShieldCheckIcon, toneClass: styles.dangerTone };
  }
  return { Icon: ClockIcon, toneClass: styles.defaultTone };
};

export const ActivityItem = ({ activity }: { activity: ActivityRecord }) => {
  const actorName = getActivityActorName(activity);
  const actorInitial = actorName ? actorName.charAt(0).toUpperCase() : "S";
  const targetHref = resolveActivityTargetHref(activity);
  const { Icon, toneClass } = getActionMeta(activity.action);

  return (
    <article className={styles.itemContainer}>
      <div className={styles.timelineLine} />
      <div className={`${styles.nodeAvatar} ${toneClass}`}>
        <Icon size={16} />
      </div>

      <div className={styles.cardBody}>
        <header className={styles.header}>
          <div className={styles.actorTitleGroup}>
            <div className={styles.actorAvatarCircle} title={actorName}>
              {actorInitial}
            </div>
            <div>
              <div className={styles.titleRow}>
                <h3 className={styles.title}>{formatActivityCode(activity.action)}</h3>
                {targetHref && (
                  <Link href={targetHref} className={styles.targetLink}>
                    <span>View Target</span>
                    <ArrowUpRightIcon size={13} />
                  </Link>
                )}
              </div>
              <p className={styles.meta}>
                <span className={styles.actorName}>{actorName}</span>
                <span className={styles.metaDot}>•</span>
                <span className={styles.metaTime}>{formatDisplayDate(activity.createdAt)}</span>
              </p>
            </div>
          </div>
          <span className={styles.actionChip}>{activity.action}</span>
        </header>

        <dl className={styles.details}>
          <div className={styles.detailRow}>
            <dt className={styles.detailTerm}>Entity Type</dt>
            <dd className={styles.detailVal}>
              <span className={styles.entityTag}>{activity.entityType}</span>
            </dd>
          </div>
        </dl>

        <ActivityMetadata metadata={activity.metadata} />
      </div>
    </article>
  );
};

