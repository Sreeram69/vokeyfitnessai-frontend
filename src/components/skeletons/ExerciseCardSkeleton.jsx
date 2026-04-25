const ExerciseCardSkeleton = () => {
  return (
    <div className="bg-[#0F1115] border border-white/10 rounded-3xl p-6 animate-pulse">
      <div className="h-52 rounded-2xl bg-[#030304] mb-5" />

      <div className="h-8 bg-[#030304] rounded mb-4" />
      <div className="h-4 bg-[#030304] rounded mb-3" />
      <div className="h-4 bg-[#030304] rounded mb-3" />
      <div className="h-4 bg-[#030304] rounded mb-6" />

      <div className="h-12 rounded-2xl bg-[#030304]" />
    </div>
  );
};

export default ExerciseCardSkeleton;
