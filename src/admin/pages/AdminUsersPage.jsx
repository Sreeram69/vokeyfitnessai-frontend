import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserCheck,
  UserX,
  Trash2,
  Edit2,
  Shield,
  User,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  Mail,
  Dumbbell
} from "lucide-react";
import {
  getAdminUsers,
  updateAdminUser,
  toggleSuspendUser,
  deleteAdminUser
} from "../services/adminService";
import { notifySuccess, notifyError, notifyInfo } from "../../utils/toast";

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Selected User for Dialogs
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form states for Edit
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    role: "user",
    status: "active",
    goal: "general",
    experienceLevel: "beginner"
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers({
        search: search || undefined,
        role: role || undefined,
        status: status || undefined,
        page,
        limit
      });
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
      notifyError("Failed to fetch users list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, role, status]);

  // Handle search with debounce/trigger
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleResetFilters = () => {
    setSearch("");
    setRole("");
    setStatus("");
    setPage(1);
    // Directly fetch with clean params
    setLoading(true);
    getAdminUsers({ page: 1, limit })
      .then(data => {
        setUsers(data.users);
        setTotal(data.total);
      })
      .catch(() => notifyError("Failed to fetch users"))
      .finally(() => setLoading(false));
  };

  // Dialog Action Triggers
  const openEditDialog = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role || "user",
      status: user.status || "active",
      goal: user.profile?.goal || "general",
      experienceLevel: user.profile?.experienceLevel || "beginner"
    });
    setIsEditOpen(true);
  };

  const openSuspendDialog = (user) => {
    setSelectedUser(user);
    setIsSuspendOpen(true);
  };

  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  // API Call Handlers
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateAdminUser(selectedUser._id, {
        username: editForm.username,
        email: editForm.email,
        role: editForm.role,
        status: editForm.status,
        profile: {
          goal: editForm.goal,
          experienceLevel: editForm.experienceLevel
        }
      });
      notifySuccess("User profile successfully updated");
      setIsEditOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      notifyError(err.response?.data?.message || "Failed to update user");
    }
  };

  const handleSuspendConfirm = async () => {
    const nextStatus = selectedUser.status === "suspended" ? "active" : "suspended";
    try {
      await toggleSuspendUser(selectedUser._id, nextStatus);
      notifySuccess(`User account ${nextStatus === 'suspended' ? 'suspended' : 'activated'}`);
      setIsSuspendOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      notifyError(err.response?.data?.message || "Failed to toggle suspension");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteAdminUser(selectedUser._id);
      notifySuccess("User deleted from platform registry");
      setIsDeleteOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      notifyError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2">
          User Directory
        </h1>
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8] font-mono mt-1">
          Monitor athletes, alter security permissions, toggle suspensions, and manage user nodes.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="premium-card p-5 bg-white dark:bg-[#0F1115] flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" size={16} />
            <input
              type="text"
              placeholder="Search by username or email..."
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
          {/* Role Filter */}
          <div className="relative">
            <select
              value={role}
              onChange={(e) => { setRole(e.target.value); setPage(1); }}
              className="pl-3 pr-8 py-2 border border-black/10 dark:border-white/5 rounded-2xl bg-white dark:bg-[#030304] text-xs font-mono text-[#0F172A] dark:text-white outline-none appearance-none"
            >
              <option value="">ALL ROLES</option>
              <option value="user">USER</option>
              <option value="admin">ADMIN</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="pl-3 pr-8 py-2 border border-black/10 dark:border-white/5 rounded-2xl bg-white dark:bg-[#030304] text-xs font-mono text-[#0F172A] dark:text-white outline-none appearance-none"
            >
              <option value="">ALL STATUSES</option>
              <option value="active">ACTIVE</option>
              <option value="suspended">SUSPENDED</option>
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

      {/* Users Data Grid/Table */}
      <div className="premium-card bg-white dark:bg-[#0F1115] overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="font-mono text-xs text-[#64748B] dark:text-[#94A3B8]">Requesting user ledger records...</p>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 font-mono text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] tracking-widest bg-black/[0.01] dark:bg-white/[0.01]">
                  <th className="py-4 px-6 font-bold">Athlete</th>
                  <th className="py-4 px-6 font-bold">Goals & Metrics</th>
                  <th className="py-4 px-6 font-bold">System Role</th>
                  <th className="py-4 px-6 font-bold">Status</th>
                  <th className="py-4 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition duration-150">
                    {/* User Profile Block */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary dark:text-[#FDBA74]">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="font-mono text-sm font-bold text-[#0F172A] dark:text-white leading-none">
                            {u.username}
                          </p>
                          <p className="font-mono text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-1 flex items-center gap-1">
                            <Mail size={10} /> {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Goals block */}
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded-lg font-mono text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase">
                          {u.profile?.goal || "general"}
                        </span>
                        <span className="px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded-lg font-mono text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase">
                          {u.profile?.experienceLevel || "beginner"}
                        </span>
                      </div>
                    </td>

                    {/* Role Block */}
                    <td className="py-4 px-6 font-mono text-xs">
                      {u.role === "admin" ? (
                        <span className="flex items-center gap-1 text-primary dark:text-[#FDBA74] font-bold">
                          <Shield size={12} /> ADMIN
                        </span>
                      ) : (
                        <span className="text-[#64748B] dark:text-[#94A3B8] font-medium">ATHLETE</span>
                      )}
                    </td>

                    {/* Status Block */}
                    <td className="py-4 px-6 font-mono text-xs">
                      {u.status === "suspended" ? (
                        <span className="px-2.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 font-bold uppercase text-[9px] tracking-wider">
                          SUSPENDED
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 dark:text-emerald-400 font-bold uppercase text-[9px] tracking-wider">
                          ACTIVE
                        </span>
                      )}
                    </td>

                    {/* Actions Block */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditDialog(u)}
                          className="p-2 border border-black/10 dark:border-white/5 rounded-xl bg-white dark:bg-[#030304] hover:bg-black/5 dark:hover:bg-white/5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Suspend/Activate Button */}
                        <button
                          onClick={() => openSuspendDialog(u)}
                          className={`p-2 border rounded-xl transition cursor-pointer ${
                            u.status === "suspended"
                              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10"
                              : "border-orange-500/20 bg-orange-500/5 text-orange-500 hover:bg-orange-500/10"
                          }`}
                          title={u.status === "suspended" ? "Unban Account" : "Suspend Account"}
                        >
                          {u.status === "suspended" ? <UserCheck size={13} /> : <UserX size={13} />}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => openDeleteDialog(u)}
                          className="p-2 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-500 rounded-xl transition cursor-pointer"
                          title="Purge Profile"
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
            No athletes found matching the query parameters.
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
        
        {/* EDIT PROFILE MODAL */}
        {isEditOpen && selectedUser && (
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
              className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0F1115] border border-black/10 dark:border-white/5 shadow-2xl p-6 overflow-hidden z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                  <Edit2 className="text-primary dark:text-[#FDBA74]" size={18} />
                  Alter Athlete Node
                </h3>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#64748B] dark:text-[#94A3B8] transition"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">USERNAME</label>
                    <input
                      type="text"
                      required
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">SECURITY ROLE</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white appearance-none"
                    >
                      <option value="user">USER (ATHLETE)</option>
                      <option value="admin">ADMIN (ENGINEER)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">SYSTEM STATUS</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white appearance-none"
                    >
                      <option value="active">ACTIVE</option>
                      <option value="suspended">SUSPENDED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">FITNESS GOAL</label>
                    <select
                      value={editForm.goal}
                      onChange={(e) => setEditForm({ ...editForm, goal: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white appearance-none"
                    >
                      <option value="general">GENERAL FITNESS</option>
                      <option value="fat loss">FAT LOSS</option>
                      <option value="muscle gain">MUSCLE GAIN</option>
                      <option value="strength">STRENGTH TRAINING</option>
                      <option value="endurance">CARDIO ENDURANCE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">FITNESS LEVEL</label>
                    <select
                      value={editForm.experienceLevel}
                      onChange={(e) => setEditForm({ ...editForm, experienceLevel: e.target.value })}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white appearance-none"
                    >
                      <option value="beginner">BEGINNER</option>
                      <option value="intermediate">INTERMEDIATE</option>
                      <option value="advanced">ADVANCED</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 mt-2">
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

        {/* SUSPENSION CONFIRMATION MODAL */}
        {isSuspendOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSuspendOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0F1115] border border-black/10 dark:border-white/5 shadow-2xl p-6 z-10"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 flex-shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#0F172A] dark:text-white mb-2">
                    {selectedUser.status === "suspended" ? "Unban Athlete Account" : "Suspend Athlete Account"}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed mb-4">
                    {selectedUser.status === "suspended"
                      ? `Are you sure you want to lift the suspension for ${selectedUser.username}? This will restore access to their dashboard, workout plans, and APIs.`
                      : `Are you sure you want to suspend ${selectedUser.username}? They will immediately be logged out and blocked from logging in, accessing plans, or calling APIs.`
                    }
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setIsSuspendOpen(false)}
                      className="px-4 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold font-mono text-[#64748B] dark:text-[#94A3B8] transition cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={handleSuspendConfirm}
                      className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase cursor-pointer ${
                        selectedUser.status === "suspended"
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                          : "bg-orange-500 hover:bg-orange-600 text-white"
                      }`}
                    >
                      {selectedUser.status === "suspended" ? "CONFIRM UNBAN" : "CONFIRM SUSPEND"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {isDeleteOpen && selectedUser && (
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
                  <Trash2 size={18} />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-red-500 dark:text-red-400 mb-2">
                    Purge Athlete Record
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed mb-4">
                    Are you sure you want to permanently delete the profile of <strong className="text-red-500 font-mono">{selectedUser.username}</strong>?
                    This will delete all their records, workout history, custom plans, and is <strong className="text-red-500 uppercase">irreversible</strong>.
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
                      CONFIRM PURGE
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

export default AdminUsersPage;
