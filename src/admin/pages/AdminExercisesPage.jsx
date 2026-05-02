import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  AlertTriangle,
  Dumbbell,
  Target
} from "lucide-react";
import {
  createAdminExercise,
  updateAdminExercise,
  deleteAdminExercise
} from "../services/adminService";
import api from "../../api/axios"; // use base api to query exercise list
import { notifySuccess, notifyError } from "../../utils/toast";

export const AdminExercisesPage = () => {
  const [exercises, setExercises] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [bodyPart, setBodyPart] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Selected Action & States
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    bodyPart: "cardio",
    target: "heart rate",
    equipment: "body weight",
    gifUrl: "",
    difficulty: "beginner",
    description: "",
    instructions: "" // Comma-separated or newline-separated
  });

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const response = await api.get("/exercises", {
        params: {
          search: search || undefined,
          bodyPart: bodyPart || undefined,
          difficulty: difficulty || undefined,
          page,
          limit
        }
      });
      const res = response.data;
      
      let exercisesList = [];
      if (Array.isArray(res.data)) {
        exercisesList = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        exercisesList = res.data.data;
      }
      
      setExercises(exercisesList);
      setTotal(res.total || exercisesList.length || 0);
    } catch (err) {
      console.error(err);
      notifyError("Failed to fetch exercises list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [page, bodyPart, difficulty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchExercises();
  };

  const handleResetFilters = () => {
    setSearch("");
    setBodyPart("");
    setDifficulty("");
    setPage(1);
    setLoading(true);
    api.get("/exercises", { params: { page: 1, limit } })
      .then(response => {
        const res = response.data;
        
        let exercisesList = [];
        if (Array.isArray(res.data)) {
          exercisesList = res.data;
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          exercisesList = res.data.data;
        }
        
        setExercises(exercisesList);
        setTotal(res.total || exercisesList.length || 0);
      })
      .catch(() => notifyError("Failed to fetch exercises"))
      .finally(() => setLoading(false));
  };

  // Open Actions
  const openAddDialog = () => {
    setForm({
      name: "",
      bodyPart: "cardio",
      target: "cardiovascular system",
      equipment: "body weight",
      gifUrl: "",
      difficulty: "beginner",
      description: "",
      instructions: ""
    });
    setIsAddOpen(true);
  };

  const openEditDialog = (exercise) => {
    setSelectedExercise(exercise);
    setForm({
      name: exercise.name,
      bodyPart: exercise.bodyPart,
      target: exercise.target,
      equipment: exercise.equipment,
      gifUrl: exercise.gifUrl,
      difficulty: exercise.difficulty || "beginner",
      description: exercise.description || "",
      instructions: Array.isArray(exercise.instructions) 
        ? exercise.instructions.join("\n") 
        : (exercise.instructions || "")
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (exercise) => {
    setSelectedExercise(exercise);
    setIsDeleteOpen(true);
  };

  const openViewDialog = (exercise) => {
    setSelectedExercise(exercise);
    setIsViewOpen(true);
  };

  // CRUD Actions
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const instructionsArray = form.instructions
        .split("\n")
        .map(i => i.trim())
        .filter(i => i.length > 0);

      await createAdminExercise({
        ...form,
        instructions: instructionsArray
      });
      notifySuccess("Custom exercise added to library");
      setIsAddOpen(false);
      fetchExercises();
    } catch (err) {
      console.error(err);
      notifyError("Failed to add exercise");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const instructionsArray = form.instructions
        .split("\n")
        .map(i => i.trim())
        .filter(i => i.length > 0);

      await updateAdminExercise(selectedExercise.id, {
        ...form,
        instructions: instructionsArray
      });
      notifySuccess("Exercise updated successfully");
      setIsEditOpen(false);
      fetchExercises();
    } catch (err) {
      console.error(err);
      notifyError("Failed to update exercise");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteAdminExercise(selectedExercise.id);
      notifySuccess("Exercise deleted from database");
      setIsDeleteOpen(false);
      fetchExercises();
    } catch (err) {
      console.error(err);
      notifyError("Failed to delete exercise");
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  const difficultyColors = {
    beginner: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
    intermediate: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    advanced: "bg-red-500/10 text-red-500 border border-red-500/20"
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2">
            Exercise Library
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] font-mono mt-1">
            Build training modules, append workouts, upload media targets, and catalog difficulty splits.
          </p>
        </div>
        <button
          onClick={openAddDialog}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-xs font-bold font-mono uppercase rounded-2xl cursor-pointer"
        >
          <Plus size={16} /> ADD EXERCISE
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="premium-card p-5 bg-white dark:bg-[#0F1115] flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" size={16} />
            <input
              type="text"
              placeholder="Search exercises by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-black/10 dark:border-white/5 rounded-2xl bg-black/5 dark:bg-[#030304] focus:outline-none focus:border-primary/50 font-mono text-sm text-[#0F172A] dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="btn-primary px-5 py-2 font-mono text-xs font-bold uppercase rounded-2xl"
          >
            Query
          </button>
        </form>

        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto justify-end">
          {/* Body Part Filter */}
          <div className="relative">
            <select
              value={bodyPart}
              onChange={(e) => { setBodyPart(e.target.value); setPage(1); }}
              className="pl-3 pr-8 py-2 border border-black/10 dark:border-white/5 rounded-2xl bg-white dark:bg-[#030304] text-xs font-mono text-[#0F172A] dark:text-white outline-none appearance-none uppercase"
            >
              <option value="">ALL BODY PARTS</option>
              <option value="chest">CHEST</option>
              <option value="back">BACK</option>
              <option value="shoulders">SHOULDERS</option>
              <option value="upper legs">THIGHS</option>
              <option value="lower legs">CALVES</option>
              <option value="waist">ABS/WAIST</option>
              <option value="cardio">CARDIO</option>
              <option value="upper arms">ARMS</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="relative">
            <select
              value={difficulty}
              onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
              className="pl-3 pr-8 py-2 border border-black/10 dark:border-white/5 rounded-2xl bg-white dark:bg-[#030304] text-xs font-mono text-[#0F172A] dark:text-white outline-none appearance-none"
            >
              <option value="">ALL LEVELS</option>
              <option value="beginner">BEGINNER</option>
              <option value="intermediate">INTERMEDIATE</option>
              <option value="advanced">ADVANCED</option>
            </select>
          </div>

          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-black/10 dark:border-white/5 rounded-2xl bg-black/5 dark:bg-white/5 text-xs font-semibold font-mono hover:bg-black/10 dark:hover:bg-white/10 text-[#64748B] dark:text-[#94A3B8] transition cursor-pointer"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Exercises Table Grid */}
      <div className="premium-card bg-white dark:bg-[#0F1115] overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="font-mono text-xs text-[#64748B] dark:text-[#94A3B8]">Requesting exercise database catalog...</p>
          </div>
        ) : exercises.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 font-mono text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] tracking-widest bg-black/[0.01] dark:bg-white/[0.01]">
                  <th className="py-4 px-6 font-bold">Exercise</th>
                  <th className="py-4 px-6 font-bold">Details</th>
                  <th className="py-4 px-6 font-bold">Target Area</th>
                  <th className="py-4 px-6 font-bold">Difficulty</th>
                  <th className="py-4 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {exercises.map((e) => (
                  <tr key={e.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition duration-150">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {e.gifUrl ? (
                          <img
                            src={e.gifUrl}
                            alt={e.name}
                            className="w-10 h-10 rounded-xl object-cover bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5"
                            onError={(err) => { err.target.src = "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=100"; }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary dark:text-[#FDBA74]">
                            <Dumbbell size={16} />
                          </div>
                        )}
                        <div>
                          <p className="font-mono text-sm font-bold text-[#0F172A] dark:text-white leading-none capitalize">
                            {e.name}
                          </p>
                          <p className="font-mono text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-1 capitalize">
                            Eq: {e.equipment || "body weight"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 capitalize font-mono text-xs text-[#0F172A] dark:text-white font-medium">
                      {e.bodyPart}
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-[#64748B] dark:text-[#94A3B8] capitalize">
                        <Target size={12} className="text-secondary" />
                        {e.target}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-mono text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${difficultyColors[e.difficulty || "beginner"]}`}>
                        {e.difficulty || "beginner"}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Details */}
                        <button
                          onClick={() => openViewDialog(e)}
                          className="p-2 border border-black/10 dark:border-white/5 rounded-xl bg-white dark:bg-[#030304] hover:bg-black/5 dark:hover:bg-white/5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={13} />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditDialog(e)}
                          className="p-2 border border-black/10 dark:border-white/5 rounded-xl bg-white dark:bg-[#030304] hover:bg-black/5 dark:hover:bg-white/5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition cursor-pointer"
                          title="Edit Exercise"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => openDeleteDialog(e)}
                          className="p-2 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-500 rounded-xl transition cursor-pointer"
                          title="Delete Exercise"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center font-mono text-sm text-[#64748B] dark:text-[#94A3B8]">
            No exercises cataloged matching filters.
          </div>
        )}

        {/* Pagination bar */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between bg-black/[0.01] dark:bg-white/[0.01]">
            <span className="font-mono text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">
              Showing PAGE {page} of {totalPages} ({total} entries)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2 border border-black/10 dark:border-white/5 rounded-xl bg-white dark:bg-[#030304] hover:bg-black/5 dark:hover:bg-white/5 text-[#64748B] dark:text-[#94A3B8] disabled:opacity-50 disabled:pointer-events-none transition cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 border border-black/10 dark:border-white/5 rounded-xl bg-white dark:bg-[#030304] hover:bg-black/5 dark:hover:bg-white/5 text-[#64748B] dark:text-[#94A3B8] disabled:opacity-50 disabled:pointer-events-none transition cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION & EDIT DIALOGS */}
      <AnimatePresence>
        
        {/* ADD EXERCISE MODAL */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0F1115] border border-black/10 dark:border-white/5 shadow-2xl p-6 overflow-hidden z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                  <Plus className="text-primary dark:text-[#FDBA74]" size={18} />
                  Add Custom Exercise
                </h3>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#64748B] dark:text-[#94A3B8] transition"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">EXERCISE NAME</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Incline Dumbbell Press"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">MEDIA SOURCE (GIF/IMAGE URL)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={form.gifUrl}
                      onChange={(e) => setForm({ ...form, gifUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">BODY PART</label>
                    <select
                      value={form.bodyPart}
                      onChange={(e) => setForm({ ...form, bodyPart: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs uppercase"
                    >
                      <option value="chest">CHEST</option>
                      <option value="back">BACK</option>
                      <option value="shoulders">SHOULDERS</option>
                      <option value="upper legs">THIGHS</option>
                      <option value="lower legs">CALVES</option>
                      <option value="waist">ABS</option>
                      <option value="cardio">CARDIO</option>
                      <option value="upper arms">ARMS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">TARGET MUSCLE</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. pectorals"
                      value={form.target}
                      onChange={(e) => setForm({ ...form, target: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">EQUIPMENT</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. dumbbell"
                      value={form.equipment}
                      onChange={(e) => setForm({ ...form, equipment: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">DIFFICULTY</label>
                    <select
                      value={form.difficulty}
                      onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs uppercase"
                    >
                      <option value="beginner">BEGINNER</option>
                      <option value="intermediate">INTERMEDIATE</option>
                      <option value="advanced">ADVANCED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">EXERCISE DESCRIPTION</label>
                  <textarea
                    rows={3}
                    placeholder="Short description of the exercise form, breathing, triggers..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">INSTRUCTIONS (ONE STEP PER LINE)</label>
                  <textarea
                    rows={4}
                    placeholder="Step 1: Set the incline bench to 30 degrees&#10;Step 2: Grab dumbbells and sit down..."
                    value={form.instructions}
                    onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                    className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-[#64748B] dark:text-[#94A3B8] transition"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-5 py-2 font-bold uppercase rounded-xl"
                  >
                    SAVE EXERCISE
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* EDIT EXERCISE MODAL */}
        {isEditOpen && selectedExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0F1115] border border-black/10 dark:border-white/5 shadow-2xl p-6 overflow-hidden z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                  <Edit2 className="text-primary dark:text-[#FDBA74]" size={18} />
                  Edit Exercise Details
                </h3>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#64748B] dark:text-[#94A3B8] transition"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">EXERCISE NAME</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">MEDIA SOURCE (GIF/IMAGE URL)</label>
                    <input
                      type="url"
                      value={form.gifUrl}
                      onChange={(e) => setForm({ ...form, gifUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">BODY PART</label>
                    <select
                      value={form.bodyPart}
                      onChange={(e) => setForm({ ...form, bodyPart: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs uppercase"
                    >
                      <option value="chest">CHEST</option>
                      <option value="back">BACK</option>
                      <option value="shoulders">SHOULDERS</option>
                      <option value="upper legs">THIGHS</option>
                      <option value="lower legs">CALVES</option>
                      <option value="waist">ABS</option>
                      <option value="cardio">CARDIO</option>
                      <option value="upper arms">ARMS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">TARGET MUSCLE</label>
                    <input
                      type="text"
                      required
                      value={form.target}
                      onChange={(e) => setForm({ ...form, target: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">EQUIPMENT</label>
                    <input
                      type="text"
                      required
                      value={form.equipment}
                      onChange={(e) => setForm({ ...form, equipment: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">DIFFICULTY</label>
                    <select
                      value={form.difficulty}
                      onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs uppercase"
                    >
                      <option value="beginner">BEGINNER</option>
                      <option value="intermediate">INTERMEDIATE</option>
                      <option value="advanced">ADVANCED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">EXERCISE DESCRIPTION</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">INSTRUCTIONS (ONE STEP PER LINE)</label>
                  <textarea
                    rows={4}
                    value={form.instructions}
                    onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                    className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-[#64748B] dark:text-[#94A3B8] transition"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-5 py-2 font-bold uppercase rounded-xl"
                  >
                    SAVE CHANGES
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* VIEW DETAILS MODAL */}
        {isViewOpen && selectedExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsViewOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0F1115] border border-black/10 dark:border-white/5 shadow-2xl p-6 overflow-hidden z-10 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading text-lg font-bold text-[#0F172A] dark:text-white capitalize flex items-center gap-2">
                  <Dumbbell className="text-primary dark:text-[#FDBA74]" size={18} />
                  {selectedExercise.name}
                </h3>
                <button
                  onClick={() => setIsViewOpen(false)}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#64748B] dark:text-[#94A3B8] transition"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 font-mono text-xs">
                {selectedExercise.gifUrl && (
                  <div className="w-full h-48 rounded-2xl overflow-hidden bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/5">
                    <img
                      src={selectedExercise.gifUrl}
                      alt={selectedExercise.name}
                      className="w-full h-full object-contain"
                      onError={(err) => { err.target.src = "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400"; }}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 border-y border-black/5 dark:border-white/5 py-4">
                  <div>
                    <span className="text-[#64748B] dark:text-[#94A3B8] font-bold">BODY PART</span>
                    <p className="text-[#0F172A] dark:text-white font-bold capitalize mt-1">{selectedExercise.bodyPart}</p>
                  </div>
                  <div>
                    <span className="text-[#64748B] dark:text-[#94A3B8] font-bold">TARGET MUSCLE</span>
                    <p className="text-[#0F172A] dark:text-white font-bold capitalize mt-1">{selectedExercise.target}</p>
                  </div>
                  <div>
                    <span className="text-[#64748B] dark:text-[#94A3B8] font-bold">EQUIPMENT</span>
                    <p className="text-[#0F172A] dark:text-white font-bold capitalize mt-1">{selectedExercise.equipment}</p>
                  </div>
                  <div>
                    <span className="text-[#64748B] dark:text-[#94A3B8] font-bold">DIFFICULTY</span>
                    <p className="text-[#0F172A] dark:text-white font-bold capitalize mt-1">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${difficultyColors[selectedExercise.difficulty || "beginner"]}`}>
                        {selectedExercise.difficulty || "beginner"}
                      </span>
                    </p>
                  </div>
                </div>

                {selectedExercise.description && (
                  <div>
                    <span className="text-[#64748B] dark:text-[#94A3B8] font-bold block mb-1">DESCRIPTION</span>
                    <p className="text-[#0F172A] dark:text-white/80 leading-relaxed font-sans">{selectedExercise.description}</p>
                  </div>
                )}

                {selectedExercise.instructions && selectedExercise.instructions.length > 0 && (
                  <div>
                    <span className="text-[#64748B] dark:text-[#94A3B8] font-bold block mb-2">INSTRUCTIONS</span>
                    <ol className="space-y-2 list-decimal list-inside text-[#0F172A] dark:text-white/80 font-sans">
                      {Array.isArray(selectedExercise.instructions) ? (
                        selectedExercise.instructions.map((step, idx) => (
                          <li key={idx} className="leading-relaxed pl-1">{step}</li>
                        ))
                      ) : (
                        <li className="leading-relaxed list-none">{selectedExercise.instructions}</li>
                      )}
                    </ol>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {isDeleteOpen && selectedExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0F1115] border border-black/10 dark:border-white/5 shadow-2xl p-6 z-10"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 flex-shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-red-500 dark:text-red-400 mb-2">
                    Delete Exercise Record
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed mb-4 font-mono">
                    Are you sure you want to permanently delete the exercise <strong className="text-[#0F172A] dark:text-white capitalize">"{selectedExercise.name}"</strong>?
                    This will remove it from the searchable workout database library.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setIsDeleteOpen(false)}
                      className="px-4 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold font-mono text-[#64748B] dark:text-[#94A3B8] transition cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold font-mono uppercase cursor-pointer"
                    >
                      CONFIRM DELETE
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default AdminExercisesPage;
