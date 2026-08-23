const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export const formatDisplayDate = (value: string): string => dateFormatter.format(new Date(value));
