import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Task, Priority, ColumnId, COLUMNS } from "@/types/task";
import { useTaskContext } from "@/context/TaskContext";
import { Plus, X } from "lucide-react";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  defaultColumn?: ColumnId;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultColumn = "todo",
}: TaskDialogProps) {
  const { addTask, updateTask } = useTaskContext();
  const isEditing = !!task;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("1");
  const [columnId, setColumnId] = useState<ColumnId>(defaultColumn);
  const [labels, setLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState("");
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setDueDate(task.dueDate || "");
      setEstimatedHours(String(task.estimatedHours));
      setColumnId(task.columnId);
      setLabels([...task.labels]);
      setSubtasks([...task.subtasks]);
    } else {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setEstimatedHours("1");
      setColumnId(defaultColumn);
      setLabels([]);
      setSubtasks([]);
    }
  }, [task, open, defaultColumn]);

  const handleSave = () => {
    if (!title.trim()) return;
    const data = {
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || null,
      estimatedHours: Number(estimatedHours) || 1,
      labels,
      subtasks,
      hasAttachment: task?.hasAttachment || false,
      columnId,
    };
    if (isEditing) {
      updateTask(task.id, data);
    } else {
      addTask(data);
    }
    onOpenChange(false);
  };

  const addLabel = () => {
    if (labelInput.trim() && !labels.includes(labelInput.trim())) {
      setLabels([...labels, labelInput.trim()]);
      setLabelInput("");
    }
  };

  const addSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks([
        ...subtasks,
        { id: crypto.randomUUID(), title: subtaskInput.trim(), completed: false },
      ]);
      setSubtaskInput("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? "Edit Task" : "New Task"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your goal?"
              className="mt-1"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              className="mt-1 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Column</Label>
              <Select value={columnId} onValueChange={(v) => setColumnId(v as ColumnId)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLUMNS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="due">Due Date</Label>
              <Input
                id="due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="hours">Est. Hours</Label>
              <Input
                id="hours"
                type="number"
                min="0.5"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Labels */}
          <div>
            <Label>Labels</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="Add label"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLabel())}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon" onClick={addLabel}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {labels.map((l) => (
                  <span
                    key={l}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                  >
                    {l}
                    <button onClick={() => setLabels(labels.filter((x) => x !== l))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Subtasks */}
          <div>
            <Label>Subtasks</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                placeholder="Add subtask"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSubtask())}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon" onClick={addSubtask}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {subtasks.length > 0 && (
              <div className="space-y-2 mt-2">
                {subtasks.map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={s.completed}
                      onCheckedChange={(checked) =>
                        setSubtasks(
                          subtasks.map((x) =>
                            x.id === s.id ? { ...x, completed: !!checked } : x
                          )
                        )
                      }
                    />
                    <span
                      className={`text-sm flex-1 ${
                        s.completed ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {s.title}
                    </span>
                    <button
                      onClick={() => setSubtasks(subtasks.filter((x) => x.id !== s.id))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              {isEditing ? "Save Changes" : "Create Task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
