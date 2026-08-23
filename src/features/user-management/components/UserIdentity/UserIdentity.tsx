import styles from "./UserIdentity.module.css";

export interface UserIdentityProps {
  name: string;
  email: string;
}

export const UserIdentity = ({ name, email }: UserIdentityProps) => (
  <span className={styles.identity}>
    <span className={styles.name}>{name}</span>
    <span className={styles.email}>{email}</span>
  </span>
);
