import Link from "next/link";
import { formatDisplayDate } from "@/utils/date";
import { obfuscateId } from "@/utils/id-obfuscator";
import { formatActivityCode, getActivityActorName } from "../../utils/activity-display";
import { resolveActivityTargetHref } from "../../utils/activity-target";
import type { ActivityRecord } from "../../types/activity.types";
import { ActivityMetadata } from "../ActivityMetadata";
import styles from "./ActivityItem.module.css";

export const ActivityItem = ({ activity }: { activity: ActivityRecord }) => {
  const href = resolveActivityTargetHref(activity);

  return (
    <article className={styles.item}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{formatActivityCode(activity.action)}</h3>
          <p className={styles.meta}>
            {getActivityActorName(activity)} · {formatDisplayDate(activity.createdAt)}
          </p>
        </div>
        <span className={styles.badge}>{activity.action}</span>
      </div>

      <dl className={styles.details}>
        <div>
          <dt>Entity Type</dt>
          <dd>{activity.entityType}</dd>
        </div>
        <div>
          <dt>Entity Ref</dt>
          <dd>
            {href ? (
              <Link className={styles.link} href={href}>
                {obfuscateId(activity.entityId, activity.entityType.slice(0, 3))}
              </Link>
            ) : (
              obfuscateId(activity.entityId, activity.entityType.slice(0, 3))
            )}
          </dd>
        </div>
      </dl>

      <ActivityMetadata metadata={activity.metadata} />
    </article>
  );
};
