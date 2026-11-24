import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { HourlyForecastPoint } from '../../types/airQuality';
import { AQIStandard } from '../../lib/aqi';
import { BarChart3 } from 'lucide-react';

interface HourlyChartProps {
  hourlyPoints: HourlyForecastPoint[];
  standard: AQIStandard;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: HourlyForecastPoint }>;
  standard: AQIStandard;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, standard }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    const aqi = standard === 'cpcb' ? data.cpcbAqi : data.usepaAqi;
    const category = standard === 'cpcb' ? data.cpcbCategory : data.usepaCategory;

    return (
      <div className="bg-slate-900/95 border border-slate-700/80 p-2.5 rounded-xl shadow-xl text-xs backdrop-blur-md min-w-[140px]">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
          <span className="font-bold text-white text-xs">{data.formattedTime}</span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.2 rounded"
            style={{
              backgroundColor: `${category.color}20`,
              color: category.color
            }}
          >
            {category.name}
          </span>
        </div>

        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-slate-400 text-[11px]">AQI:</span>
          <span className="font-black text-sm font-mono" style={{ color: category.color }}>
            {aqi}
          </span>
        </div>

        <div className="flex items-baseline justify-between text-[10px] text-slate-400 mt-0.5">
          <span>Dominant:</span>
          <span className="text-slate-200 font-semibold">{data.dominantPollutant}</span>
        </div>

        <div className="flex items-baseline justify-between text-[10px] text-slate-400 mt-0.5">
          <span>Weather:</span>
          <span className="text-slate-200">
            {data.temperature}°C • {data.windSpeed} km/h
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const HourlyChart: React.FC<HourlyChartProps> = ({ hourlyPoints, standard }) => {
  // Map points to chart data
  const chartData = hourlyPoints.map((p) => ({
    ...p,
    aqi: standard === 'cpcb' ? p.cpcbAqi : p.usepaAqi
  }));

  const maxVal = Math.max(...chartData.map((d) => d.aqi), 250);
  const yDomainMax = Math.min(Math.ceil((maxVal + 40) / 50) * 50, 500);

  return (
    <section
      role="region"
      aria-label="24-hour hourly air quality forecast chart"
      className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-sm space-y-3"
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
            <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            24-Hour Hourly Trend
          </h2>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          Touch chart for hour details
        </span>
      </div>

      {/* Chart container */}
      <div className="w-full h-52 -ml-2 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="formattedTime"
              interval={3}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
            />

            <YAxis
              domain={[0, yDomainMax]}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              width={35}
            />

            {/* Category reference line indicators */}
            <ReferenceLine y={50} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.4} />
            <ReferenceLine y={100} stroke="#84cc16" strokeDasharray="3 3" strokeOpacity={0.4} />
            <ReferenceLine y={200} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.4} />
            {yDomainMax >= 300 && (
              <ReferenceLine y={300} stroke="#f97316" strokeDasharray="3 3" strokeOpacity={0.4} />
            )}

            <Tooltip
              content={<CustomChartTooltip standard={standard} />}
              cursor={{ stroke: '#38bdf8', strokeWidth: 1.5, strokeDasharray: '4 4' }}
            />

            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#38bdf8"
              strokeWidth={2.5}
              fill="url(#aqiAreaGradient)"
              activeDot={{ r: 5, fill: '#38bdf8', stroke: '#0f172a', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category threshold legend */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 px-1 font-medium">
        <span className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1" />
          Good (0-50)
        </span>
        <span className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-lime-500 mr-1" />
          Sat (51-100)
        </span>
        <span className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-amber-500 mr-1" />
          Mod (101-200)
        </span>
        <span className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-orange-500 mr-1" />
          Poor (201-300)
        </span>
      </div>
    </section>
  );
};
