export type PaymentStatus = "Successful" | "Pending" | "Failed";
export type ReportStatus = "Generated" | "Pending" | "Failed";

export interface Transaction {
  id: string;
  name: string;
  category: string;
  iconType: "dribbble" | "google" | "amazon";
  date: string;
  time: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  isNegative: boolean;
}

export interface PaymentGoal {
  title: string;
  subtitle: string;
  cardType: "VISA" | "MASTERCARD";
  cardLabel: string;
  balance: number;
  currencySymbol: string;
  cardNumberMasked: string;
  expiryDate: string;
}

export interface MonthlyEngagement {
  month: string;
  rate: number;
  isHighlight?: boolean;
  highlightBadge?: string;
}

export interface EngagementRateData {
  title: string;
  activePeriod: "monthly" | "annually";
  periods: {
    monthly: MonthlyEngagement[];
    annually: MonthlyEngagement[];
  };
}

export interface TotalBalanceData {
  title: string;
  amount: number;
  currencySymbol: string;
  trendPoints: number[];
}

export interface MetricCardData {
  label: string;
  value: string;
  percentageChange: string;
  isPositive: boolean;
}

export interface MandatoryPayee {
  id: string;
  name: string;
  avatarUrl: string;
  role?: string;
}

export interface MandatoryPaymentsData {
  title: string;
  subtitle: string;
  payees: MandatoryPayee[];
}

export interface UserProfile {
  name: string;
  greeting: string;
  avatarUrl: string;
  role: string;
}

export interface DateFilterRange {
  startDate: string;
  endDate: string;
  label: string;
}

export interface NavItem {
  id: string;
  label: string;
  iconName: string;
  href?: string;
  isActive?: boolean;
  badgeCount?: number;
  isLogout?: boolean;
}

export interface TopNavTab {
  id: string;
  label: string;
  href: string;
  isActive?: boolean;
}

/* Reports section types */
export interface ReportSummaryMetric {
  id: string;
  label: string;
  amount: number;
  currencySymbol: string;
  percentageChange: string;
  isPositive: boolean;
}

export interface ChartDataPoint {
  month: string;
  revenue: number;
  expenses: number;
}

export interface RevenueExpensesChartData {
  title: string;
  revenueLabel: string;
  expensesLabel: string;
  dataPoints: ChartDataPoint[];
}

export interface ReportItem {
  id: string;
  name: string;
  type: string;
  generatedDate: string;
  status: ReportStatus;
}
