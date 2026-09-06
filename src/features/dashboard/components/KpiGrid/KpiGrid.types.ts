export type ModernKpiBadgeType = "emerald" | "blue" | "purple" | "amber";

export interface ModernKpiMetricItem {
  label: string;
  value: string | number;
  color?: string;
}

export interface ModernKpiCardData {
  title: string;
  badge?: string;
  badgeType?: ModernKpiBadgeType;
  value: string | number;
  metrics: ModernKpiMetricItem[];
}

export interface ModernKpiCardProps {
  card: ModernKpiCardData;
}

export interface ModernKpiGridProps {
  cards: ModernKpiCardData[];
}

export interface PieSliceData {
  key: string;
  label: string;
  count: number;
  color: string;
}

export interface ComputedPieSlice extends PieSliceData {
  pathD: string;
  percentage: number;
}

export interface StatusPieChartProps {
  items: PieSliceData[];
  title?: string;
  subtitle?: string;
}

export interface StatusPieSvgProps {
  items: PieSliceData[];
  slices: ComputedPieSlice[];
  total: number;
  hoveredKey: string | null;
  onHover: (key: string | null) => void;
  cx?: number;
  cy?: number;
  outerR?: number;
  innerR?: number;
}

export interface StatusPieLegendItemProps {
  item: PieSliceData;
  percentage: number;
  isHovered: boolean;
  onHover: (key: string | null) => void;
}
