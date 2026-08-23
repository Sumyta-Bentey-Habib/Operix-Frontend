export const toReportDateInputValue = (value: string | null | undefined): string => {
  if (!value) return "";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : "";
};

export const reportDateInputToUtcIso = (value: string): string => `${value}T00:00:00.000Z`;

export const validateReportPeriod = (periodStart: string, periodEnd: string): string | null => {
  if (!periodStart || !periodEnd) {
    return "Report period start and end are required.";
  }

  if (periodStart > periodEnd) {
    return "Period start must be earlier than or equal to period end.";
  }

  return null;
};

export const formatReportPeriod = (periodStart: string, periodEnd: string): string =>
  `${toReportDateInputValue(periodStart)} → ${toReportDateInputValue(periodEnd)}`;
