const points = [42, 50, 47, 58, 54, 66, 61, 72, 69, 78, 74, 86, 82, 91];

export function PerformanceChart() {
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${(index / (points.length - 1)) * 600} ${120 - point}`).join(" ");
  const area = `${path} L 600 130 L 0 130 Z`;
  return (
    <div className="relative mt-5 h-[190px] w-full overflow-hidden">
      <div className="absolute inset-0 flex flex-col justify-between py-2">
        {[0, 1, 2, 3].map((line) => <span key={line} className="block border-t border-dashed border-[#e8e8e5]" />)}
      </div>
      <svg viewBox="0 0 600 140" preserveAspectRatio="none" className="absolute inset-x-0 top-5 h-[145px] w-full overflow-visible" role="img" aria-label="Clicks trend rising over the last 28 days">
        <defs>
          <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#70d6ff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#70d6ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#area-fill)" />
        <path d={path} fill="none" stroke="#111111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] text-[#9a9a9a]"><span>Jun 19</span><span>Jun 26</span><span>Jul 3</span><span>Jul 16</span></div>
    </div>
  );
}
