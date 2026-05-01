import { useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminNavbar } from "../components/AdminNavbar";
import PageLoader from "../../components/ui/PageLoader";
import PageTransition from "../../components/ui/PageTransition";

// Lazy load admin pages for bundle size optimization
const AdminDashboardPage = lazy(() => import("../pages/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("../pages/AdminUsersPage"));
const AdminAnalyticsPage = lazy(() => import("../pages/AdminAnalyticsPage"));
const AdminExercisesPage = lazy(() => import("../pages/AdminExercisesPage"));
const AdminNutritionPage = lazy(() => import("../pages/AdminNutritionPage"));
const AdminNotificationsPage = lazy(() => import("../pages/AdminNotificationsPage"));
const AdminSettingsPage = lazy(() => import("../pages/AdminSettingsPage"));
const AdminAPIIntegrationsPage = lazy(() => import("../pages/AdminAPIIntegrationsPage"));

export const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[var(--bg)] dark:bg-[#030304] text-[#0F172A] dark:text-white overflow-hidden transition-colors duration-300">
      {/* Background Subtle Grid Pattern */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid-fade pointer-events-none opacity-[0.05] dark:opacity-20" />
      
      {/* Ambient Gradient Glows (SaaS accents) */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/5 dark:bg-secondary/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Sidebar Navigation */}
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden lg:ml-24 relative z-10">
        {/* Top Header Bar */}
        <AdminNavbar onMenuClick={() => setMobileOpen(true)} />

        {/* Dynamic Page content */}
        <main className="flex-1 p-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] md:p-6 lg:p-8 bg-transparent overflow-y-auto overflow-x-hidden relative">
          <div className="max-w-6xl mx-auto w-full">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<PageTransition><AdminDashboardPage /></PageTransition>} />
                <Route path="/dashboard" element={<PageTransition><AdminDashboardPage /></PageTransition>} />
                <Route path="/users" element={<PageTransition><AdminUsersPage /></PageTransition>} />
                <Route path="/analytics" element={<PageTransition><AdminAnalyticsPage /></PageTransition>} />
                <Route path="/connections" element={<PageTransition><AdminAPIIntegrationsPage /></PageTransition>} />
                <Route path="/exercises" element={<PageTransition><AdminExercisesPage /></PageTransition>} />
                <Route path="/nutrition" element={<PageTransition><AdminNutritionPage /></PageTransition>} />
                <Route path="/notifications" element={<PageTransition><AdminNotificationsPage /></PageTransition>} />
                <Route path="/settings" element={<PageTransition><AdminSettingsPage /></PageTransition>} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
