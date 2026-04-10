import { Clock, CheckCircle2, Timer, TrendingUp, Zap } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";
import { useState, useEffect } from "react";

function AnimatedProgress({ value }: { value: number }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timeout);
  }, [value]);

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  return (
    <div className="flex items-center gap-5 w-full">
      <div className="relative w-24 h-24 flex-shrink-0">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48" cy="48" r="40"
            stroke="hsl(var(--muted))"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="48" cy="48" r="40"
            stroke="hsl(var(--violet))"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: "drop-shadow(0 0 6px hsl(var(--violet) / 0.4))",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-display font-bold text-foreground">
            {Math.round(animatedValue)}%
          </span>
          <span className="text-[10px] text-muted-foreground">done</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 flex-1">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-violet" />
          <span className="text-sm font-medium text-foreground">Overall Progress</span>
        </div>
        <div className="w-48 h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${animatedValue}%`,
              background: `linear-gradient(90deg, hsl(var(--violet)), hsl(var(--peacock)))`,
              boxShadow: `0 0 10px hsl(var(--violet) / 0.3)`,
            }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {animatedValue >= 100
            ? "All tasks complete! 🎉"
            : animatedValue >= 50
            ? "Great progress, keep going!"
            : "Let's get things done!"}
        </span>
      </div>
    </div>
  );
}

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

      <div className="mt-4 flex items-center gap-4 w-full">
        <div className="flex-1">
          <AnimatedProgress value={progress} />
        </div>
        {overdueTasks > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium ml-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            {overdueTasks} overdue
          </div>
        )}
      </div>
    </div>
  );
}
