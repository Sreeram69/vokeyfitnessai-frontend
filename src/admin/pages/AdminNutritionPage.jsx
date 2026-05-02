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
  Eye,
  Activity,
  Flame,
  Utensils
} from "lucide-react";
import {
  getAdminFoods,
  createAdminFood,
  updateAdminFood,
  deleteAdminFood
} from "../services/adminService";
import { notifySuccess, notifyError } from "../../utils/toast";

export const AdminNutritionPage = () => {
  const [foods, setFoods] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Selected Action & States
  const [selectedFood, setSelectedFood] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    servingSize: "100g",
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    category: "common",
    upc: ""
  });

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const response = await getAdminFoods({
        search: search || undefined,
        category: category || undefined,
        page,
        limit
      });
      
      setFoods(response.data || []);
      setTotal(response.total || 0);
    } catch (err) {
      console.error(err);
      notifyError("Failed to fetch food library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [page, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFoods();
  };

  const handleResetFilters = () => {
    setSearch("");
    setCategory("");
    setPage(1);
    setLoading(true);
    getAdminFoods({ page: 1, limit })
      .then(response => {
        setFoods(response.data || []);
        setTotal(response.total || 0);
      })
      .catch(() => notifyError("Failed to fetch foods"))
      .finally(() => setLoading(false));
  };

  // Open Actions
  const openAddDialog = () => {
    setForm({
      name: "",
      servingSize: "100g",
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      category: "common",
      upc: ""
    });
    setIsAddOpen(true);
  };

  const openEditDialog = (food) => {
    setSelectedFood(food);
    setForm({
      name: food.name,
      servingSize: food.servingSize,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      fiber: food.fiber || 0,
      sugar: food.sugar || 0,
      sodium: food.sodium || 0,
      category: food.category || "common",
      upc: food.upc || ""
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (food) => {
    setSelectedFood(food);
    setIsDeleteOpen(true);
  };

  const openViewDialog = (food) => {
    setSelectedFood(food);
    setIsViewOpen(true);
  };

  // CRUD Actions
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAdminFood(form);
      notifySuccess("New food item added to database");
      setIsAddOpen(false);
      fetchFoods();
    } catch (err) {
      console.error(err);
      notifyError(err.response?.data?.message || "Failed to add food item");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateAdminFood(selectedFood.name, form);
      notifySuccess("Food item updated successfully");
      setIsEditOpen(false);
      fetchFoods();
    } catch (err) {
      console.error(err);
      notifyError(err.response?.data?.message || "Failed to update food item");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteAdminFood(selectedFood.name);
      notifySuccess("Food item deleted successfully");
      setIsDeleteOpen(false);
      fetchFoods();
    } catch (err) {
      console.error(err);
      notifyError("Failed to delete food item");
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2">
            Nutrition Database
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] font-mono mt-1">
            Manage calorie standards, macro distributions, serving size guides, and barcode mappings.
          </p>
        </div>
        <button
          onClick={openAddDialog}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-xs font-bold font-mono uppercase rounded-2xl cursor-pointer"
        >
          <Plus size={16} /> ADD FOOD ITEM
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="premium-card p-5 bg-white dark:bg-[#0F1115] flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" size={16} />
            <input
              type="text"
              placeholder="Search food by name..."
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
          {/* Category Filter */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="pl-3 pr-8 py-2 border border-black/10 dark:border-white/5 rounded-2xl bg-white dark:bg-[#030304] text-xs font-mono text-[#0F172A] dark:text-white outline-none appearance-none uppercase"
            >
              <option value="">ALL CATEGORIES</option>
              <option value="common">COMMON</option>
              <option value="branded">BRANDED</option>
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

      {/* Foods Table Grid */}
      <div className="premium-card bg-white dark:bg-[#0F1115] overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="font-mono text-xs text-[#64748B] dark:text-[#94A3B8]">Requesting food database library...</p>
          </div>
        ) : foods.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 font-mono text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] tracking-widest bg-black/[0.01] dark:bg-white/[0.01]">
                  <th className="py-4 px-6 font-bold">Food Item</th>
                  <th className="py-4 px-6 font-bold">Calories</th>
                  <th className="py-4 px-6 font-bold">Macros (P / C / F)</th>
                  <th className="py-4 px-6 font-bold">Category</th>
                  <th className="py-4 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {foods.map((f, idx) => (
                  <tr key={idx} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition duration-150">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] dark:text-[#34D399]">
                          <Utensils size={16} />
                        </div>
                        <div>
                          <p className="font-mono text-sm font-bold text-[#0F172A] dark:text-white leading-none capitalize">
                            {f.name}
                          </p>
                          <p className="font-mono text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                            Serving: {f.servingSize || "1 serving"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono text-sm text-[#0F172A] dark:text-white font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Flame size={14} className="text-orange-500" />
                        {f.calories} kcal
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-primary font-bold">P: {f.protein}g</span>
                        <span className="text-text-secondary/30">•</span>
                        <span className="text-[#FFD600] font-bold">C: {f.carbs}g</span>
                        <span className="text-text-secondary/30">•</span>
                        <span className="text-danger font-bold">F: {f.fats}g</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        f.category === "branded" 
                          ? "bg-purple-500/10 text-purple-500 border border-purple-500/20" 
                          : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                      }`}>
                        {f.category || "common"}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Details */}
                        <button
                          onClick={() => openViewDialog(f)}
                          className="p-2 border border-black/10 dark:border-white/5 rounded-xl bg-white dark:bg-[#030304] hover:bg-black/5 dark:hover:bg-white/5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={13} />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditDialog(f)}
                          className="p-2 border border-black/10 dark:border-white/5 rounded-xl bg-white dark:bg-[#030304] hover:bg-black/5 dark:hover:bg-white/5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition cursor-pointer"
                          title="Edit Food"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => openDeleteDialog(f)}
                          className="p-2 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-500 rounded-xl transition cursor-pointer"
                          title="Delete Food"
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
            No food items cataloged matching filters.
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
        
        {/* ADD FOOD MODAL */}
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
                  Add Custom Food Item
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
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">FOOD NAME</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Greek Yogurt (Vanilla)"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">SERVING SIZE</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 100g or 1 cup"
                      value={form.servingSize}
                      onChange={(e) => setForm({ ...form, servingSize: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">CALORIES (kcal)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.calories}
                      onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">PROTEIN (g)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      value={form.protein}
                      onChange={(e) => setForm({ ...form, protein: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">CARBS (g)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      value={form.carbs}
                      onChange={(e) => setForm({ ...form, carbs: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">FATS (g)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      value={form.fats}
                      onChange={(e) => setForm({ ...form, fats: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">FIBER (g)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.fiber}
                      onChange={(e) => setForm({ ...form, fiber: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">SUGAR (g)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.sugar}
                      onChange={(e) => setForm({ ...form, sugar: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">SODIUM (mg)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.sodium}
                      onChange={(e) => setForm({ ...form, sodium: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">CATEGORY</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs uppercase"
                    >
                      <option value="common">COMMON</option>
                      <option value="branded">BRANDED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">UPC BARCODE (OPTIONAL)</label>
                  <input
                    type="text"
                    placeholder="e.g. 038000200615"
                    value={form.upc}
                    onChange={(e) => setForm({ ...form, upc: e.target.value })}
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
                    SAVE FOOD
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* EDIT FOOD MODAL */}
        {isEditOpen && selectedFood && (
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
                  Edit Food Details
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
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">FOOD NAME</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">SERVING SIZE</label>
                    <input
                      type="text"
                      required
                      value={form.servingSize}
                      onChange={(e) => setForm({ ...form, servingSize: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">CALORIES (kcal)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.calories}
                      onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">PROTEIN (g)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      value={form.protein}
                      onChange={(e) => setForm({ ...form, protein: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">CARBS (g)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      value={form.carbs}
                      onChange={(e) => setForm({ ...form, carbs: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">FATS (g)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      value={form.fats}
                      onChange={(e) => setForm({ ...form, fats: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">FIBER (g)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.fiber}
                      onChange={(e) => setForm({ ...form, fiber: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">SUGAR (g)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.sugar}
                      onChange={(e) => setForm({ ...form, sugar: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">SODIUM (mg)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.sodium}
                      onChange={(e) => setForm({ ...form, sodium: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">CATEGORY</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white text-xs uppercase"
                    >
                      <option value="common">COMMON</option>
                      <option value="branded">BRANDED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">UPC BARCODE</label>
                  <input
                    type="text"
                    value={form.upc}
                    onChange={(e) => setForm({ ...form, upc: e.target.value })}
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
        {isViewOpen && selectedFood && (
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
              className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0F1115] border border-black/10 dark:border-white/5 shadow-2xl p-6 overflow-hidden z-10 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading text-lg font-bold text-[#0F172A] dark:text-white capitalize flex items-center gap-2">
                  <Utensils className="text-primary dark:text-[#FDBA74]" size={18} />
                  {selectedFood.name}
                </h3>
                <button
                  onClick={() => setIsViewOpen(false)}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#64748B] dark:text-[#94A3B8] transition"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-2 gap-4 border-b border-black/5 dark:border-white/5 pb-4">
                  <div>
                    <span className="text-[#64748B] dark:text-[#94A3B8] font-bold">CALORIES</span>
                    <p className="text-orange-500 font-bold text-base mt-1 flex items-center gap-1">
                      <Flame size={16} />
                      {selectedFood.calories} kcal
                    </p>
                  </div>
                  <div>
                    <span className="text-[#64748B] dark:text-[#94A3B8] font-bold">SERVING SIZE</span>
                    <p className="text-[#0F172A] dark:text-white font-bold mt-1 capitalize">{selectedFood.servingSize || "1 serving"}</p>
                  </div>
                  <div>
                    <span className="text-[#64748B] dark:text-[#94A3B8] font-bold">CATEGORY</span>
                    <p className="text-[#0F172A] dark:text-white font-bold mt-1 uppercase">{selectedFood.category || "common"}</p>
                  </div>
                  <div>
                    <span className="text-[#64748B] dark:text-[#94A3B8] font-bold">UPC BARCODE</span>
                    <p className="text-[#0F172A] dark:text-white font-bold mt-1">{selectedFood.upc || "N/A"}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-[#64748B] dark:text-[#94A3B8] tracking-wider uppercase text-[10px]">Macro Profile</h4>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 text-center">
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold">PROTEIN</span>
                      <p className="text-lg font-black text-primary mt-1">{selectedFood.protein}g</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-center">
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold">CARBS</span>
                      <p className="text-lg font-black text-amber-500 dark:text-[#FFD600] mt-1">{selectedFood.carbs}g</p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 text-center">
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold">FATS</span>
                      <p className="text-lg font-black text-red-500 mt-1">{selectedFood.fats}g</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-[#64748B] dark:text-[#94A3B8] tracking-wider uppercase text-[10px]">Micronutrients & Others</h4>
                  <div className="grid grid-cols-3 gap-2 font-mono text-[11px] font-bold">
                    <div className="p-2 bg-black/5 dark:bg-white/5 rounded-xl text-center">
                      <span className="text-[9px] text-[#64748B] dark:text-[#94A3B8]">Fiber</span>
                      <p className="text-[#0F172A] dark:text-white mt-0.5">{selectedFood.fiber || 0}g</p>
                    </div>
                    <div className="p-2 bg-black/5 dark:bg-white/5 rounded-xl text-center">
                      <span className="text-[9px] text-[#64748B] dark:text-[#94A3B8]">Sugar</span>
                      <p className="text-[#0F172A] dark:text-white mt-0.5">{selectedFood.sugar || 0}g</p>
                    </div>
                    <div className="p-2 bg-black/5 dark:bg-white/5 rounded-xl text-center">
                      <span className="text-[9px] text-[#64748B] dark:text-[#94A3B8]">Sodium</span>
                      <p className="text-[#0F172A] dark:text-white mt-0.5">{selectedFood.sodium || 0}mg</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setIsViewOpen(false)}
                    className="px-6 py-2.5 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-[#0F172A] dark:text-white font-bold transition uppercase"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {isDeleteOpen && selectedFood && (
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
              className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#0F1115] border border-black/10 dark:border-white/5 shadow-2xl p-6 overflow-hidden z-10"
            >
              <h3 className="font-heading text-lg font-bold text-red-500 mb-3 flex items-center gap-2">
                Remove Food Item
              </h3>
              <p className="font-mono text-xs text-[#64748B] dark:text-[#94A3B8] mb-6 leading-relaxed">
                Are you absolutely sure you want to remove <strong className="text-[#0F172A] dark:text-white capitalize">"{selectedFood.name}"</strong> from the global database library? This cannot be undone.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-[#64748B] dark:text-[#94A3B8] transition font-mono text-xs"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition font-mono text-xs font-bold"
                >
                  CONFIRM REMOVE
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default AdminNutritionPage;
