import type { PieSliceData, ComputedPieSlice } from "./KpiGrid.types";

export const calculatePieTotal = (items: readonly PieSliceData[]): number => {
  return items.reduce((sum, item) => sum + item.count, 0);
};

export function computePieSlices(
  items: PieSliceData[],
  total: number,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
): ComputedPieSlice[] {
  if (total === 0) return [];
  const activeItems = items.filter((item) => item.count > 0);
  let currentAngle = -Math.PI / 2;

  return activeItems.map((item) => {
    const sliceAngle = (item.count / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const isSingleSlice = total === item.count;

    if (isSingleSlice) {
      return {
        ...item,
        pathD: `M ${cx} ${cy - outerR} A ${outerR} ${outerR} 0 1 1 ${cx - 0.001} ${cy - outerR} L ${cx - 0.001} ${cy - innerR} A ${innerR} ${innerR} 0 1 0 ${cx} ${cy - innerR} Z`,
        percentage: 100,
      };
    }

    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);

    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const pathD = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
    const percentage = Math.round((item.count / total) * 100);

    return { ...item, pathD, percentage };
  });
}
