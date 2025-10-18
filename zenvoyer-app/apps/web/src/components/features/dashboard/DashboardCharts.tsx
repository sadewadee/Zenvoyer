/**
 * Dashboard Charts Component
 * Display charts menggunakan simple visualization
 */

'use client';

import React from 'react';

interface ChartData {
  label: string;
  value: number;
  percentage?: number;
}

interface BarChartProps {
  title: string;
  data: ChartData[];
  maxValue?: number;
}

/**
 * Simple bar chart component
 */
const BarChart: React.FC<BarChartProps> = ({ title, data, maxValue }) => {
  const max = maxValue || Math.max(...data.map((d) => d.value));
  const scale = 100 / max;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>

      <div className="space-y-4">
        {data.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
              <span className="text-sm font-semibold text-gray-900">
                {item.value}
                {item.percentage && ` (${item.percentage}%)`}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(item.value * scale, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface PieChartProps {
  title: string;
  data: ChartData[];
}

/**
 * Simple pie chart component (using CSS)
 */
const PieChart: React.FC<PieChartProps> = ({ title, data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>

      <div className="grid grid-cols-2 gap-6">
        {/* Legend */}
        <div className="space-y-3">
          {data.map((item, idx) => {
            const percentage = Math.round((item.value / total) * 100);
            return (
              <div key={idx} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: colors[idx % colors.length] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-600">
                    {percentage}% • {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Simple visual representation */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-32 h-32">
            {data.map((item, idx) => {
              const percentage = (item.value / total) * 100;
              const rotation = data
                .slice(0, idx)
                .reduce((sum, d) => sum + (d.value / total) * 360, 0);

              return (
                <div
                  key={idx}
                  className="absolute w-full h-full"
                  style={{
                    background: `conic-gradient(
                      ${colors[idx % colors.length]} 0deg,
                      ${colors[idx % colors.length]} ${percentage * 3.6}deg,
                      transparent ${percentage * 3.6}deg
                    )`,
                    transform: `rotate(${rotation}deg)`,
                    borderRadius: '50%',
                  }}
                />
              );
            })}
            <div className="absolute inset-0 bg-white rounded-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{total}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface LineChartProps {
  title: string;
  data: Array<{ label: string; value: number }>;
}

/**
 * Simple line chart component (ASCII-style)
 */
const LineChart: React.FC<LineChartProps> = ({ title, data }) => {
  const maxValue = Math.max(...data.map((d) => d.value));
  const scale = 100 / maxValue;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>

      <div className="space-y-4">
        {data.map((item, idx) => {
          const height = Math.max(2, Math.round(item.value * scale));
          return (
            <div key={idx}>
              <div className="flex items-end gap-2 h-24">
                <span className="text-xs font-medium text-gray-700 w-20 truncate">
                  {item.label}
                </span>
                <div className="flex-1 flex items-end gap-1">
                  <div
                    className="flex-1 bg-blue-600 rounded-t transition-all duration-500"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-900 w-12 text-right">
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { BarChart, PieChart, LineChart };
export default { BarChart, PieChart, LineChart };
