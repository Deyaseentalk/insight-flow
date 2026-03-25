import { useState, useEffect, useCallback } from "react";
import { TaskProvider } from "@/context/TaskContext";
import { TopBar } from "@/components/TopBar";
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

  // Keyboard shortcut: N to add task
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
      <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
        <TopBar darkMode={darkMode} onToggleDark={() => setDarkMode(!darkMode)} />
        <DashboardHeader />
        <KanbanBoard />
        <AIChatButton />
        <TaskDialog
          open={quickAddOpen}
          onOpenChange={setQuickAddOpen}
          task={null}
        />
      </div>
    </TaskProvider>
  );
};

export default Index;
