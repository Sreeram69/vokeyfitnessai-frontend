const AddToWorkoutButton = ({ onAdd }) => {
  return (
    <button
      onClick={onAdd}
      className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold hover:from-orange-500 hover:to-orange-400 transition shadow-lg shadow-orange-500/30"
    >
      Add to Workout Plan
    </button>
  );
};

export default AddToWorkoutButton;