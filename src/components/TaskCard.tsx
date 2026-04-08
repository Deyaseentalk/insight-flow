import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Calendar,
  Clock,
  GripVertical,
  Paperclip,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { Task, PRIORITY_CONFIG, ColumnId } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useTaskContext } from "@/context/TaskContext";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const COLUMN_TINT: Record<ColumnId, string> = {
  "todo": "border-violet/30 bg-violet/5 hover:border-violet/50 hover:shadow-violet/10",
  "in-progress": "border-peacock/30 bg-peacock/5 hover:border-peacock/50 hover:shadow-peacock/10",
  "complete": "border-crimson/30 bg-crimson/5 hover:border-crimson/50 hover:shadow-crimson/10",
};

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { deleteTask } = useTaskContext();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = PRIORITY_CONFIG[task.priority];
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const subtaskProgress =
    task.subtasks.length > 0
      ? (completedSubtasks / task.subtasks.length) * 100
      : 0;

  const isOverdue =
    task.dueDate &&
    task.columnId !== "complete" &&
    new Date(task.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl border pl-7 pr-4 py-4 cursor-pointer
        transition-all duration-200 hover:shadow-lg
        ${COLUMN_TINT[task.columnId]}
        ${isDragging ? "opacity-50 shadow-2xl scale-105 z-50" : ""}
        animate-fade-in`}
      onClick={() => onEdit(task)}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 transition-opacity cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Header: Priority + Actions */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${priority.color}`} />
          <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
            {priority.label}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            deleteTask(task.id);
          }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Title */}
      <h3 className="font-display font-semibold text-sm text-foreground mb-1 leading-snug">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.map((label) => (
            <Badge
              key={label}
              variant="secondary"
              className="text-[10px] px-2 py-0 h-5 bg-muted text-muted-foreground border-0"
            >
              {label}
            </Badge>
          ))}
        </div>
      )}

      {/* Subtask progress */}
      {task.subtasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">
              {completedSubtasks}/{task.subtasks.length} subtasks
            </span>
          </div>
          <Progress value={subtaskProgress} className="h-1 bg-muted" />
        </div>
      )}

      {/* Footer: Due date, hours, attachment */}
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        {task.dueDate && (
          <div
            className={`flex items-center gap-1 ${
              isOverdue ? "text-destructive font-medium" : ""
            }`}
          >
            <Calendar className="w-3 h-3" />
            {new Date(task.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {task.estimatedHours}h
        </div>
        {task.hasAttachment && <Paperclip className="w-3 h-3" />}
        <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
