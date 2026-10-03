"use client";

export interface UserIdentityProps {
  name: string;
  email: string;
  avatarUrl?: string | null;
  className?: string;
}

const GRADIENTS = [
  "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)",
  "linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)",
  "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
  "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
];

const getInitials = (name: string): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getGradient = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
};

export const UserIdentity = ({ name, email, avatarUrl, className = "" }: UserIdentityProps) => {
  const initials = getInitials(name);
  const gradient = getGradient(name);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-[0.8rem] font-extrabold text-white shadow-sm select-none"
        style={{ background: gradient }}
        aria-hidden="true"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="size-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="truncate text-[0.92rem] font-bold text-[var(--text-primary)]">
          {name}
        </span>
        <span className="truncate text-[0.78rem] text-[var(--text-secondary)]">
          {email}
        </span>
      </div>
    </div>
  );
};
