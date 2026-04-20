import { Suspense, lazy } from "react";
import {
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import { AnimatePresence } from "framer-motion";

import PageTransition from "../components/ui/PageTransition";
import PageLoader from "../components/ui/PageLoader";

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

// Layout
import MainLayoutV2 from "../components/layout/MainLayoutV2";

// Lazy Loaded Public Pages
const LandingPageV2 = lazy(() => import("../pages/LandingPageV2"));
const AuthPage = lazy(() => import("../pages/AuthPage"));
const PrivacyPolicyPage = lazy(() => import("../pages/PrivacyPolicyPage"));

// Lazy Loaded Protected Pages
const DashboardV2 = lazy(() => import("../pages/DashboardV2"));
const OnboardingPage = lazy(() => import("../pages/OnboardingPage"));
const ExercisePageV2 = lazy(() => import("../pages/ExercisePageV2"));
const WorkoutPlansPage = lazy(() => import("../pages/WorkoutPlansPage"));
const ActiveWorkoutPage = lazy(() => import("../pages/ActiveWorkoutPage"));
const NutritionPage = lazy(() => import("../pages/NutritionPage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const FavoritesPage = lazy(() => import("../pages/FavoritesPage"));
const CustomPlanPage = lazy(() => import("../pages/CustomPlanPage"));
const NotificationsPage = lazy(() => import("../pages/NotificationsPage"));
const OAuthCallbackPage = lazy(() => import("../pages/OAuthCallbackPage"));

// Lazy Loaded Admin Page Layout
const AdminLayout = lazy(() => import("../admin/layouts/AdminLayout"));

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* PUBLIC ROUTES */}
        <Route
          path="/"
          element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <LandingPageV2 />
              </PageTransition>
            </Suspense>
          }
        />

        <Route
          path="/privacy-policy"
          element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <PrivacyPolicyPage />
              </PageTransition>
            </Suspense>
          }
        />

        <Route
          path="/login"
          element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <AuthPage />
              </PageTransition>
            </Suspense>
          }
        />

        <Route
          path="/register"
          element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <AuthPage />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/verify-login-otp"
          element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <AuthPage />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/oauth/callback"
          element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <OAuthCallbackPage />
              </PageTransition>
            </Suspense>
          }
        />

        {/* ONBOARDING */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <PageTransition>
                  <OnboardingPage />
                </PageTransition>
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayoutV2>
                <Suspense fallback={<PageLoader />}>
                  <PageTransition>
                    <DashboardV2 />
                  </PageTransition>
                </Suspense>
              </MainLayoutV2>
            </ProtectedRoute>
          }
        />

        {/* EXERCISES */}
        <Route
          path="/exercises"
          element={
            <ProtectedRoute>
              <MainLayoutV2>
                <Suspense fallback={<PageLoader />}>
                  <PageTransition>
                    <ExercisePageV2 />
                  </PageTransition>
                </Suspense>
              </MainLayoutV2>
            </ProtectedRoute>
          }
        />

        {/* FAVORITES */}
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <MainLayoutV2>
                <Suspense fallback={<PageLoader />}>
                  <PageTransition>
                    <FavoritesPage />
                  </PageTransition>
                </Suspense>
              </MainLayoutV2>
            </ProtectedRoute>
          }
        />

        {/* CUSTOM PLAN */}
        <Route
          path="/custom-plan"
          element={
            <ProtectedRoute>
              <MainLayoutV2>
                <Suspense fallback={<PageLoader />}>
                  <PageTransition>
                    <CustomPlanPage />
                  </PageTransition>
                </Suspense>
              </MainLayoutV2>
            </ProtectedRoute>
          }
        />

        {/* WORKOUT PLANS */}
        <Route
          path="/plans"
          element={
            <ProtectedRoute>
              <MainLayoutV2>
                <Suspense fallback={<PageLoader />}>
                  <PageTransition>
                    <WorkoutPlansPage />
                  </PageTransition>
                </Suspense>
              </MainLayoutV2>
            </ProtectedRoute>
          }
        />

        {/* ACTIVE WORKOUT */}
        <Route
          path="/active-workout"
          element={
            <ProtectedRoute>
              <MainLayoutV2>
                <Suspense fallback={<PageLoader />}>
                  <PageTransition>
                    <ActiveWorkoutPage />
                  </PageTransition>
                </Suspense>
              </MainLayoutV2>
            </ProtectedRoute>
          }
        />

        {/* NUTRITION */}
        <Route
          path="/nutrition"
          element={
            <ProtectedRoute>
              <MainLayoutV2>
                <Suspense fallback={<PageLoader />}>
                  <PageTransition>
                    <NutritionPage />
                  </PageTransition>
                </Suspense>
              </MainLayoutV2>
            </ProtectedRoute>
          }
        />

        {/* SETTINGS */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayoutV2>
                <Suspense fallback={<PageLoader />}>
                  <PageTransition>
                    <SettingsPage />
                  </PageTransition>
                </Suspense>
              </MainLayoutV2>
            </ProtectedRoute>
          }
        />

        {/* NOTIFICATIONS */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <MainLayoutV2>
                <Suspense fallback={<PageLoader />}>
                  <PageTransition>
                    <NotificationsPage />
                  </PageTransition>
                </Suspense>
              </MainLayoutV2>
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <Suspense fallback={<PageLoader />}>
                <AdminLayout />
              </Suspense>
            </AdminRoute>
          }
        />

        {/* FALLBACK ROUTE */}
        <Route
          path="*"
          element={
            <Navigate to="/" replace />
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;