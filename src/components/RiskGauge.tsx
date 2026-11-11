import React from 'react';

interface RiskGaugeProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  size = 140,
  strokeWidth = 12,
  label,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  let color = '#16A34A'; // Green (Low)
  let levelText = 'Low Risk';
  let badgeBg = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';

  if (progress >= 75) {
    color = '#DC2626'; // Red (Very High)
    levelText = 'Very High Risk';
    badgeBg = 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800';
  } else if (progress >= 50) {
    color = '#EA580C'; // Orange (High)
    levelText = 'High Risk';
    badgeBg = 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300 dark:border-orange-800';
  } else if (progress >= 25) {
    color = '#F59E0B'; // Amber (Moderate)
    levelText = 'Moderate Risk';
    badgeBg = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800"
            fill="transparent"
          />
          {/* Progress Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {progress}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            / 100
          </span>
        </div>
      </div>

      <div className={`mt-3 px-3 py-1 text-xs font-bold rounded-full border shadow-xs ${badgeBg}`}>
        {label || levelText}
      </div>
    </div>
  );
};
