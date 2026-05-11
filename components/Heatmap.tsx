import type { HeatmapDay } from '@/lib/streaks';

export function Heatmap({ days }: { days: HeatmapDay[] }) {
  const max = Math.max(1, ...days.map((d) => d.reps));
  return (
    <div className="flex gap-[3px]" role="img" aria-label="30-day training intensity">
      {days.map((d) => {
        const opacity = d.reps === 0 ? 0 : 0.2 + 0.8 * (d.reps / max);
        return (
          <div
            key={d.day}
            className="h-3 flex-1 rounded-sm bg-emerald-500 dark:bg-emerald-400"
            style={{ opacity: opacity || 0.08 }}
            title={`${new Date(d.day).toLocaleDateString()}: ${d.reps} reps`}
          />
        );
      })}
    </div>
  );
}
