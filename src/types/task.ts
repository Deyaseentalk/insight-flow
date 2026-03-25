export type Priority = "low" | "medium" | "high" | "critical";
export type ColumnId = "todo" | "in-progress" | "complete";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  estimatedHours: number;
  labels: string[];
  subtasks: Subtask[];
  hasAttachment: boolean;
  columnId: ColumnId;
  createdAt: string;
  completedAt: string | null;
}

export interface Column {
  id: ColumnId;
  title: string;
  color: "violet" | "peacock" | "crimson";
}

export const COLUMNS: Column[] = [
  { id: "todo", title: "To Do", color: "violet" },
  { id: "in-progress", title: "In Progress", color: "peacock" },
  { id: "complete", title: "Complete", color: "crimson" },
];

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-emerald-500" },
  medium: { label: "Medium", color: "bg-yellow-500" },
  high: { label: "High", color: "bg-orange-500" },
  critical: { label: "Critical", color: "bg-red-500" },
};
