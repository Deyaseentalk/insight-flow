import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Inbox } from "lucide-react";
import { Column, Task } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

const COLOR_CLASSES: Record<string, string> = {
  violet: "bg-violet/15 text-violet",
  peacock: "bg-peacock/15 text-peacock",
  crimson: "bg-crimson/15 text-crimson",
};

const DOT_CLASSES: Record<string, string> = {
  violet: "bg-violet",
  peacock: "bg-peacock",
  crimson: "bg-crimson",
};

export function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onEditTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col min-w-[320px] w-[320px] md:flex-1 md:min-w-0">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${DOT_CLASSES[column.color]}`} />
          <h2 className="font-display font-semibold text-sm text-foreground">
            {column.title}
          </h2>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${COLOR_CLASSES[column.color]}`}
          >
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={onAddTask}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-3 p-2 rounded-xl transition-colors duration-200 min-h-[200px] scrollbar-thin overflow-y-auto
          ${isOver ? "bg-primary/5 border-2 border-dashed border-primary/20" : "bg-transparent"}`}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/50">
            <Inbox className="w-10 h-10 mb-2" />
            <p className="text-xs">No tasks yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
