function chartPoints(values: number[], maximum: number) {
  return values.map((value, index) => ({
    x: (index / Math.max(1, values.length - 1)) * 620,
    y: 160 - (value / maximum) * 145,
  }));
}

function smoothPath(values: number[], maximum: number) {
  const points = chartPoints(values, maximum);
  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const midpoint = (previous.x + point.x) / 2;
    return `${path} C ${midpoint} ${previous.y}, ${midpoint} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

function dateLabel(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00Z`));
}

export function PerformanceChart({
  currentValues,
  previousValues,
  dates,
}: {
  currentValues: number[];
  previousValues: number[];
  dates: string[];
}) {
  const currentPeriod = currentValues.length > 1 ? currentValues : [0, 0];
  const previousPeriod = previousValues.length > 1 ? previousValues : [0, 0];
  const rawMaximum = Math.max(1, ...currentPeriod, ...previousPeriod);
  const magnitude = 10 ** Math.max(0, Math.floor(Math.log10(rawMaximum)) - 1);
  const maximum = Math.ceil(rawMaximum / magnitude) * magnitude;
  const currentPath = smoothPath(currentPeriod, maximum);
  const previousPath = smoothPath(previousPeriod, maximum);
  const currentPoints = chartPoints(currentPeriod, maximum);
  const lastPoint = currentPoints[currentPoints.length - 1];
  const area = `${currentPath} L 620 170 L 0 170 Z`;
  const labelIndexes = [0, Math.floor((dates.length - 1) / 3), Math.floor(((dates.length - 1) * 2) / 3), dates.length - 1];

  return (
    <div className="mt-5">
      <div className="mb-4 flex items-center justify-between text-[10px] font-medium text-[#7f8984]">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-2"><span className="h-0.5 w-5 rounded-full bg-[#249fd0]" /> Current period</span>
          <span className="inline-flex items-center gap-2"><span className="w-5 border-t border-dashed border-[#aeb6b1]" /> Previous period</span>
        </div>
        <span className="hidden sm:inline">Daily clicks</span>
      </div>

      <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3">
        <div className="flex h-[190px] flex-col justify-between pb-5 text-right text-[9px] tabular-nums text-[#9aa29e]">
          <span>{maximum}</span><span>{Math.round(maximum * 0.75)}</span><span>{Math.round(maximum * 0.5)}</span><span>{Math.round(maximum * 0.25)}</span>
        </div>
        <div>
          <div className="relative h-[170px] overflow-hidden">
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 1, 2, 3].map((line) => <span key={line} className="block border-t border-[#edf0ed]" />)}
            </div>
            <svg viewBox="0 0 620 170" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" role="img" aria-label="Daily Google Search clicks for the current and previous 28-day periods">
              <path d={area} fill="#effaff" />
              <path d={previousPath} fill="none" stroke="#aeb6b1" strokeWidth="1.5" strokeDasharray="5 6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <path d={currentPath} fill="none" stroke="#249fd0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              <circle cx={lastPoint.x} cy={lastPoint.y} r="4" fill="white" stroke="#249fd0" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div className="mt-2 flex justify-between text-[9px] text-[#909995]">
            {labelIndexes.map((index, labelIndex) => <span key={`${index}-${labelIndex}`}>{dateLabel(dates[index])}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
