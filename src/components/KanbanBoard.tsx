import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { COLUMNS, Task, ColumnId } from "@/types/task";
import { useTaskContext } from "@/context/TaskContext";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { TaskDialog } from "./TaskDialog";

export function KanbanBoard() {
  const { getTasksByColumn, moveTask } = useTaskContext();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultColumn, setDefaultColumn] = useState<ColumnId>("todo");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = event.active.data.current?.task as Task | undefined;
      if (task) setActiveTask(task);
    },
    []
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeTaskData = active.data.current?.task as Task | undefined;
      if (!activeTaskData) return;

      const overId = over.id as string;
      const isColumn = COLUMNS.some((c) => c.id === overId);
      const targetColumn = isColumn
        ? (overId as ColumnId)
        : (over.data.current?.task as Task)?.columnId;

      if (targetColumn && targetColumn !== activeTaskData.columnId) {
        moveTask(activeTaskData.id, targetColumn);
      }
    },
    [moveTask]
  );

  const handleDragEnd = useCallback(() => {
    setActiveTask(null);
  }, []);

  const handleAddTask = useCallback((columnId: ColumnId) => {
    setEditingTask(null);
    setDefaultColumn(columnId);
    setDialogOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  }, []);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-4 px-6 pb-6 overflow-x-auto scrollbar-thin">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={getTasksByColumn(column.id)}
              onAddTask={() => handleAddTask(column.id)}
              onEditTask={handleEditTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="w-[320px] opacity-90 rotate-2">
              <TaskCard task={activeTask} onEdit={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        defaultColumn={defaultColumn}
      />
    </>
  );
}
