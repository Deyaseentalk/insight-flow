import { useState, useEffect } from "react";
import { TaskProvider } from "@/context/TaskContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { KanbanBoard } from "@/components/KanbanBoard";
import { AIChatButton } from "@/components/AIChatButton";
import { TaskDialog } from "@/components/TaskDialog";
import { Outlet, useLocation } from "react-router-dom";

const Layout = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "n" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        setQuickAddOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const isDashboard = location.pathname === "/";

  return (
    <TaskProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            {isDashboard ? (
              <>
                <DashboardHeader />
                <KanbanBoard />
              </>
            ) : (
              <Outlet />
            )}
          </div>
          <AIChatButton />
          <TaskDialog
            open={quickAddOpen}
            onOpenChange={setQuickAddOpen}
            task={null}
          />
        </div>
      </SidebarProvider>
    </TaskProvider>
  );
};

export default Layout;
