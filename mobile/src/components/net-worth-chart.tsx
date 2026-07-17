import Svg, { Circle, Line, Path } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/utils/net-worth';

type NetWorthSnapshot = {
  date: string;
  netWorth: number;
};

type NetWorthChartProps = {
  history: NetWorthSnapshot[];
  width?: number;
  height?: number;
};

function buildLinePath(points: { x: number; y: number }[]): string {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

function formatMonthLabel(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short' });
}

export function NetWorthChart({ history, width = 320, height = 120 }: NetWorthChartProps) {
  const theme = useTheme();

  if (history.length < 2) return null;

  const paddingX = 8;
  const paddingY = 12;
  const values = history.map((h) => h.netWorth);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  const points = history.map((snapshot, index) => {
    const x = paddingX + (index / (history.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((snapshot.netWorth - minValue) / valueRange) * (height - paddingY * 2);
    return { x, y };
  });

  const isTrendingUp = values[values.length - 1] >= values[0];
  const lineColor = isTrendingUp ? theme.success : theme.danger;

  const trendDescription = `Net worth chart, trending ${isTrendingUp ? 'up' : 'down'}, from ${formatCurrency(
    values[0]
  )} in ${formatMonthLabel(history[0].date)} to ${formatCurrency(values[values.length - 1])} in ${formatMonthLabel(
    history[history.length - 1].date
  )}`;

  return (
    <View accessible accessibilityLabel={trendDescription}>
      <Svg width={width} height={height}>
        <Line
          x1={paddingX}
          y1={height - paddingY}
          x2={width - paddingX}
          y2={height - paddingY}
          stroke={theme.border}
          strokeWidth={1}
        />
        <Path d={buildLinePath(points)} stroke={lineColor} strokeWidth={2.5} fill="none" />
        {points.map((point, index) => (
          <Circle key={index} cx={point.x} cy={point.y} r={3} fill={lineColor} />
        ))}
      </Svg>
    </View>
  );
}
