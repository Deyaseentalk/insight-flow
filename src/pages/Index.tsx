import { useState, useEffect } from "react";
import { TaskProvider } from "@/context/TaskContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { KanbanBoard } from "@/components/KanbanBoard";
import { AIChatButton } from "@/components/AIChatButton";
import { TaskDialog } from "@/components/TaskDialog";

const Index = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

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

  return (
    <TaskProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
              <SidebarTrigger />
              <h1 className="text-lg font-display font-bold text-foreground">FoxBoard</h1>
            </header>
            <DashboardHeader />
            <KanbanBoard />
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

export default Index;
