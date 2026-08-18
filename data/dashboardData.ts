import {
  UserProfile,
  DateFilterRange,
  PaymentGoal,
  EngagementRateData,
  TotalBalanceData,
  MetricCardData,
  Transaction,
  MandatoryPaymentsData,
} from "@/types/dashboard";

export const USER_PROFILE_DATA: UserProfile = {
  name: "Sujon",
  greeting: "Welcome Back,",
  role: "Super Admin",
  avatarUrl:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
};

export const DATE_FILTER_DATA: DateFilterRange = {
  startDate: "29 Jun, 2025",
  endDate: "29 August, 2025",
  label: "29 Jun, 2025 - 29 August, 2025",
};

export const PAYMENT_GOAL_DATA: PaymentGoal = {
  title: "Payment Goal",
  subtitle: "Total amount goal",
  cardType: "VISA",
  cardLabel: "Credit Card",
  balance: 78989.09,
  currencySymbol: "৳",
  cardNumberMasked: "9090",
  expiryDate: "09/28",
};

export const ENGAGEMENT_RATE_DATA: EngagementRateData = {
  title: "Engagement Rate",
  activePeriod: "annually",
  periods: {
    annually: [
      { month: "JAN", rate: 55, isHighlight: false },
      { month: "FEB", rate: 38, isHighlight: false },
      { month: "MAR", rate: 65, isHighlight: false },
      {
        month: "APR",
        rate: 96,
        isHighlight: true,
        highlightBadge: "+78%",
      },
      { month: "MAY", rate: 82, isHighlight: true },
      { month: "JUN", rate: 70, isHighlight: false },
    ],
    monthly: [
      { month: "JAN", rate: 68, isHighlight: false },
      {
        month: "FEB",
        rate: 92,
        isHighlight: true,
        highlightBadge: "+64%",
      },
      { month: "MAR", rate: 50, isHighlight: false },
      { month: "APR", rate: 75, isHighlight: false },
      { month: "MAY", rate: 88, isHighlight: true },
      { month: "JUN", rate: 58, isHighlight: false },
    ],
  },
};

export const TOTAL_BALANCE_DATA: TotalBalanceData = {
  title: "Total Balance",
  amount: 32678.90,
  currencySymbol: "৳",
  trendPoints: [10, 18, 14, 22, 18, 25, 20, 28, 24, 30, 26, 34],
};

export const WEEKLY_REVENUE_DATA: MetricCardData = {
  label: "Weekly Revenue",
  value: "+3.945 BDT",
  percentageChange: "+12.8%",
  isPositive: true,
};

export const AMOUNT_OF_CREDIT_DATA: MetricCardData = {
  label: "Amount of credit",
  value: "৳8,945.89",
  percentageChange: "+1.5%",
  isPositive: true,
};

export const PAYMENT_HISTORY_DATA: Transaction[] = [
  {
    id: "tx-1",
    name: "Dribbble Design",
    category: "140.00 Work",
    iconType: "dribbble",
    date: "15 Jun 2025",
    time: "10:50 PM",
    status: "Successful",
    amount: 1345.10,
    currency: "BDT",
    isNegative: true,
  },
  {
    id: "tx-2",
    name: "Google Pay",
    category: "Google Suite",
    iconType: "google",
    date: "13 Jun 2025",
    time: "11:15 PM",
    status: "Successful",
    amount: 2345.89,
    currency: "BDT",
    isNegative: true,
  },
  {
    id: "tx-3",
    name: "Amazon Shopping",
    category: "Cloud/Retail",
    iconType: "amazon",
    date: "10 Jun 2025",
    time: "10:18 PM",
    status: "Successful",
    amount: 3125.67,
    currency: "BDT",
    isNegative: true,
  },
];

export const MANDATORY_PAYMENTS_DATA: MandatoryPaymentsData = {
  title: "Mandatory Payments",
  subtitle: "Upcoming payments",
  payees: [
    {
      id: "payee-1",
      name: "Marcus Vance",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      role: "Engineering Lead",
    },
    {
      id: "payee-2",
      name: "Sarah Chen",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      role: "Product Designer",
    },
    {
      id: "payee-3",
      name: "David Kim",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      role: "DevOps Engineer",
    },
  ],
};
