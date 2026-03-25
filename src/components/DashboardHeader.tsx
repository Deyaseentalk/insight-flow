import { Clock, CheckCircle2, Timer, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTaskContext } from "@/context/TaskContext";

export function DashboardHeader() {
  const { tasks } = useTaskContext();

  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const completedHours = tasks
    .filter((t) => t.columnId === "complete")
    .reduce((sum, t) => sum + t.estimatedHours, 0);
  const remainingHours = totalHours - completedHours;
  const progress = totalHours > 0 ? (completedHours / totalHours) * 100 : 0;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.columnId === "complete").length;
  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate || t.columnId === "complete") return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  const stats = [
    {
      icon: Clock,
      label: "Total Hours",
      value: `${totalHours}h`,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: CheckCircle2,
      label: "Completed",
      value: `${completedHours}h`,
      color: "text-peacock",
      bgColor: "bg-peacock/10",
    },
    {
      icon: Timer,
      label: "Remaining",
      value: `${remainingHours}h`,
      color: "text-violet",
      bgColor: "bg-violet/10",
    },
    {
      icon: TrendingUp,
      label: "Tasks Done",
      value: `${completedTasks}/${totalTasks}`,
      color: "text-crimson",
      bgColor: "bg-crimson/10",
    },
  ];

  return (
    <div className="px-6 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl bg-card border border-border p-3 animate-fade-in"
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-display font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Overall Progress
            </span>
            <span className="text-xs font-bold text-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-muted" />
        </div>
        {overdueTasks > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            {overdueTasks} overdue
          </div>
        )}
      </div>
    </div>
  );
}
