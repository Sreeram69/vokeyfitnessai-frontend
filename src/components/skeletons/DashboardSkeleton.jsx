export const DashboardSkeleton = () => {
  return (
    <div className="space-y-10 w-full pb-24">
      {/* Curved glass banner placeholder with shimmer background */}
      <div className="h-44 rounded-3xl bg-[#0F1115]/50 border border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        <div className="p-8 space-y-4">
          <div className="h-6 w-1/3 bg-white/10 rounded-lg" />
          <div className="h-4 w-1/2 bg-white/5 rounded-lg" />
        </div>
      </div>

      {/* Stats Bento boxes placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="h-36 rounded-3xl bg-[#0F1115]/50 border border-white/5 relative overflow-hidden p-6 flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <div className="space-y-2">
              <div className="h-3 w-1/2 bg-white/10 rounded-md" />
              <div className="h-6 w-1/3 bg-white/15 rounded-md" />
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full" />
          </div>
        ))}
      </div>

      {/* Grid of chart placeholders */}
      <div className="grid lg:grid-cols-2 gap-8">
        {[...Array(2)].map((_, index) => (
          <div
            key={index}
            className="h-[380px] rounded-3xl bg-[#0F1115]/50 border border-white/5 relative overflow-hidden p-8 flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <div className="flex justify-between items-center mb-6">
              <div className="h-5 w-1/4 bg-white/15 rounded-lg" />
              <div className="h-4 w-12 bg-white/10 rounded-md" />
            </div>
            <div className="flex-1 flex items-end gap-3 pt-6 border-b border-white/5 pb-4">
              {[...Array(7)].map((_, sIdx) => {
                const heights = ["h-3/4", "h-1/2", "h-2/3", "h-1/3", "h-5/6", "h-3/5", "h-2/5"];
                return (
                  <div key={sIdx} className="flex-1 flex flex-col items-center gap-2">
                    <div className={`w-full ${heights[sIdx]} bg-white/10 rounded-t-lg`} />
                    <div className="h-2 w-8 bg-white/5 rounded-md" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;
