import type { JsonValue } from "../../types/activity.types";
import styles from "./ActivityMetadata.module.css";

const renderValue = (value: JsonValue): string => {
  if (value === null) return "null";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
};

export const ActivityMetadata = ({ metadata }: { metadata: JsonValue | null }) => {
  if (metadata === null) {
    return <p className={styles.empty}>No metadata.</p>;
  }

  if (typeof metadata !== "object" || Array.isArray(metadata)) {
    return <p className={styles.value}>{renderValue(metadata)}</p>;
  }

  const entries = Object.entries(metadata);

  if (entries.length === 0) {
    return <p className={styles.empty}>No metadata.</p>;
  }

  return (
    <div className={styles.metadata}>
      {entries.map(([key, value]) => (
        <div className={styles.row} key={key}>
          <dt className={styles.key}>{key}</dt>
          <dd className={styles.value}>{renderValue(value)}</dd>
        </div>
      ))}
    </div>
  );
};
