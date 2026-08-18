import {
  ReportSummaryMetric,
  RevenueExpensesChartData,
  ReportItem,
} from "@/types/dashboard";

export const REPORTS_SUMMARY_METRICS: ReportSummaryMetric[] = [
  {
    id: "total-revenue",
    label: "Total Revenue",
    amount: 148290.0,
    currencySymbol: "৳",
    percentageChange: "+14.2%",
    isPositive: true,
  },
  {
    id: "expenses",
    label: "Expenses",
    amount: 45189.5,
    currencySymbol: "৳",
    percentageChange: "+6.1%",
    isPositive: true,
  },
  {
    id: "net-profit",
    label: "Net Profit",
    amount: 103100.5,
    currencySymbol: "৳",
    percentageChange: "+18.7%",
    isPositive: true,
  },
  {
    id: "pending-invoices",
    label: "Pending Invoices",
    amount: 12450.0,
    currencySymbol: "৳",
    percentageChange: "-2.4%",
    isPositive: false,
  },
];

export const REVENUE_EXPENSES_CHART_DATA: RevenueExpensesChartData = {
  title: "Revenue vs Expenses",
  revenueLabel: "Revenue",
  expensesLabel: "Expenses",
  dataPoints: [
    { month: "Mar", revenue: 65, expenses: 40 },
    { month: "Apr", revenue: 85, expenses: 55 },
    { month: "May", revenue: 90, expenses: 38 },
    { month: "Jun", revenue: 72, expenses: 50 },
    { month: "Jul", revenue: 98, expenses: 45 },
    { month: "Aug", revenue: 82, expenses: 62 },
  ],
};

export const RECENT_REPORTS_DATA: ReportItem[] = [
  {
    id: "rep-1",
    name: "Q2 Financial Statement",
    type: "Tax & Balance",
    generatedDate: "24 Aug 2025",
    status: "Generated",
  },
  {
    id: "rep-2",
    name: "Payroll Ledger July",
    type: "Internal Expenses",
    generatedDate: "02 Aug 2025",
    status: "Generated",
  },
  {
    id: "rep-3",
    name: "Subscription Churn Analytics",
    type: "Marketing ROI",
    generatedDate: "28 Jul 2025",
    status: "Pending",
  },
  {
    id: "rep-4",
    name: "Annual Corporate Tax Draft",
    type: "Compliance Report",
    generatedDate: "15 Jul 2025",
    status: "Generated",
  },
  {
    id: "rep-5",
    name: "Merchant Fee Reconciliation",
    type: "Gateway Audit",
    generatedDate: "30 Jun 2025",
    status: "Generated",
  },
];
