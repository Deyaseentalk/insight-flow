import React, { createContext, useContext, useState, useCallback } from "react";
import { Task, ColumnId } from "@/types/task";
import { toast } from "sonner";

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "completedAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, toColumn: ColumnId) => void;
  getTasksByColumn: (columnId: ColumnId) => Task[];
}

const TaskContext = createContext<TaskContextType | null>(null);

const SAMPLE_TASKS: Task[] = [
  {
    id: "1",
    title: "Learn Spanish basics",
    description: "Complete first 30 lessons on Duolingo and practice daily conversations",
    priority: "high",
    dueDate: "2026-04-15",
    estimatedHours: 20,
    labels: ["learning", "language"],
    subtasks: [
      { id: "s1", title: "Download Duolingo", completed: true },
      { id: "s2", title: "Complete 10 lessons", completed: true },
      { id: "s3", title: "Complete 20 lessons", completed: false },
      { id: "s4", title: "Complete 30 lessons", completed: false },
    ],
    hasAttachment: false,
    columnId: "in-progress",
    createdAt: "2026-03-01",
    completedAt: null,
  },
  {
    id: "2",
    title: "Run a half marathon",
    description: "Train consistently and complete a half marathon by summer",
    priority: "medium",
    dueDate: "2026-06-30",
    estimatedHours: 50,
    labels: ["fitness", "challenge"],
    subtasks: [
      { id: "s5", title: "Create training plan", completed: false },
      { id: "s6", title: "Run 10K consistently", completed: false },
      { id: "s7", title: "Register for event", completed: false },
    ],
    hasAttachment: true,
    columnId: "todo",
    createdAt: "2026-03-10",
    completedAt: null,
  },
  {
    id: "3",
    title: "Read 12 books this year",
    description: "One book per month — mix of fiction, self-help, and biographies",
    priority: "low",
    dueDate: "2026-12-31",
    estimatedHours: 60,
    labels: ["reading", "growth"],
    subtasks: [
      { id: "s8", title: "Book 1: Atomic Habits", completed: true },
      { id: "s9", title: "Book 2: Sapiens", completed: true },
      { id: "s10", title: "Book 3: Current read", completed: false },
    ],
    hasAttachment: false,
    columnId: "in-progress",
    createdAt: "2026-01-05",
    completedAt: null,
  },
  {
    id: "4",
    title: "Meditate daily for 30 days",
    description: "Build a consistent morning meditation habit using Headspace",
    priority: "medium",
    dueDate: "2026-04-01",
    estimatedHours: 15,
    labels: ["wellness", "habit"],
    subtasks: [
      { id: "s11", title: "Week 1 streak", completed: true },
      { id: "s12", title: "Week 2 streak", completed: true },
      { id: "s13", title: "Week 3 streak", completed: true },
      { id: "s14", title: "Week 4 streak", completed: true },
    ],
    hasAttachment: false,
    columnId: "complete",
    createdAt: "2026-03-01",
    completedAt: "2026-03-30",
  },
  {
    id: "5",
    title: "Declutter entire apartment",
    description: "Go room by room, donate unused items, organize storage",
    priority: "critical",
    dueDate: "2026-04-05",
    estimatedHours: 8,
    labels: ["home", "organization"],
    subtasks: [
      { id: "s15", title: "Kitchen", completed: true },
      { id: "s16", title: "Bedroom", completed: false },
      { id: "s17", title: "Living room", completed: false },
    ],
    hasAttachment: true,
    columnId: "todo",
    createdAt: "2026-03-20",
    completedAt: null,
  },
  {
    id: "6",
    title: "Build personal portfolio site",
    description: "Design and deploy a personal website showcasing projects",
    priority: "high",
    dueDate: "2026-05-15",
    estimatedHours: 25,
    labels: ["tech", "career"],
    subtasks: [
      { id: "s18", title: "Wireframe design", completed: true },
      { id: "s19", title: "Build homepage", completed: false },
      { id: "s20", title: "Add projects section", completed: false },
      { id: "s21", title: "Deploy", completed: false },
    ],
    hasAttachment: false,
    columnId: "todo",
    createdAt: "2026-03-15",
    completedAt: null,
  },
];

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);

  const addTask = useCallback(
    (taskData: Omit<Task, "id" | "createdAt" | "completedAt">) => {
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString().split("T")[0],
        completedAt: null,
      };
      setTasks((prev) => [...prev, newTask]);
      toast.success(`Task "${newTask.title}" created`);
    },
    []
  );

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id);
      if (task) toast.success(`Task "${task.title}" deleted`);
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const moveTask = useCallback((id: string, toColumn: ColumnId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const completedAt =
          toColumn === "complete"
            ? new Date().toISOString().split("T")[0]
            : null;
        return { ...t, columnId: toColumn, completedAt };
      })
    );
    toast.success("Task moved");
  }, []);

  const getTasksByColumn = useCallback(
    (columnId: ColumnId) => tasks.filter((t) => t.columnId === columnId),
    [tasks]
  );

  return (
    <TaskContext.Provider
      value={{ tasks, addTask, updateTask, deleteTask, moveTask, getTasksByColumn }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTaskContext must be used within TaskProvider");
  return ctx;
}
