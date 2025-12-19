import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricItemProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function MetricItem({
  label,
  value,
  icon,
  trend,
  trendValue,
}: MetricItemProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      case 'neutral':
        return <Minus className="w-3 h-3 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      case 'neutral':
        return 'text-gray-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-lg font-semibold">{value}</p>
      {trendValue && (
        <div className={`flex items-center gap-1 text-xs mt-1 ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}

interface MetricsGridProps {
  children: React.ReactNode;
  columns?: number;
}

export function MetricsGrid({ children, columns = 4 }: MetricsGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  }[columns] || 'grid-cols-2 md:grid-cols-4';

  return (
    <div className={`grid ${gridCols} gap-3`}>
      {children}
    </div>
  );
}
