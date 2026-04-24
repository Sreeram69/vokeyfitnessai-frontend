import { useState } from "react";
import SidebarV2 from "./SidebarV2";
import TopbarV2 from "./TopbarV2";
import VokeyCoach from "../ui/VokeyCoach";

export const MainLayoutV2 = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[var(--bg)] dark:bg-[#030304] text-[#0F172A] dark:text-white overflow-hidden transition-colors duration-300">
      {/* Background Subtle Grid Pattern */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid-fade pointer-events-none opacity-[0.06] dark:opacity-30" />
      
      {/* Ambient Gradient Glows (SaaS accents) */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/5 dark:bg-secondary/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Sidebar Navigation */}
      <SidebarV2 mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden lg:ml-24 relative z-10">
        {/* Top Header Bar */}
        <TopbarV2 onMenuClick={() => setMobileOpen(true)} />

        {/* Dynamic Page content */}
        <main className="flex-1 p-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] md:p-6 lg:p-8 bg-transparent overflow-y-auto overflow-x-hidden relative">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Floating AI Coach Assistant Widget */}
      <VokeyCoach />
    </div>
  );
};

export default MainLayoutV2;
