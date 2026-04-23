const EmptyState = ({ message }) => {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-full glass flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">📭</span>
      </div>
      <p className="text-xl text-[#94A3B8] font-medium">{message}</p>
    </div>
  );
};

export default EmptyState;