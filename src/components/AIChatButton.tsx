import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTaskContext } from "@/context/TaskContext";
import { toast } from "sonner";
import { ColumnId, COLUMNS } from "@/types/task";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function AIChatButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hey! I'm your LifeBoard AI. I can help you manage tasks. Try:\n\n• **Create task**: \"Add task: Morning jog, 1 hour\"\n• **Move task**: \"Move Learn Spanish to Complete\"\n• **Mark done**: \"Mark Meditate as done\"\n• **Summary**: \"What did I finish today?\"\n• **Suggest**: \"What should I work on next?\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { tasks, addTask, moveTask } = useTaskContext();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const processCommand = (text: string): string => {
    const lower = text.toLowerCase().trim();

    // Create task
    const createMatch = lower.match(/(?:add|create) task[:\s]+(.+?)(?:,\s*(\d+)\s*h(?:ours?)?)?$/i);
    if (createMatch) {
      const title = createMatch[1].trim();
      const hours = Number(createMatch[2]) || 1;
      addTask({
        title: title.charAt(0).toUpperCase() + title.slice(1),
        description: "",
        priority: "medium",
        dueDate: null,
        estimatedHours: hours,
        labels: [],
        subtasks: [],
        hasAttachment: false,
        columnId: "todo",
      });
      return `✅ Created task **"${title}"** with ${hours}h estimate in To Do.`;
    }

    // Move task
    const moveMatch = lower.match(/move (.+?) to (to\s?do|in\s?progress|complete)/i);
    if (moveMatch) {
      const searchTitle = moveMatch[1].trim();
      const targetMap: Record<string, ColumnId> = {
        "to do": "todo",
        "todo": "todo",
        "in progress": "in-progress",
        "inprogress": "in-progress",
        complete: "complete",
      };
      const target = targetMap[moveMatch[2].toLowerCase().trim()];
      const task = tasks.find((t) => t.title.toLowerCase().includes(searchTitle));
      if (task && target) {
        moveTask(task.id, target);
        return `✅ Moved **"${task.title}"** to **${COLUMNS.find((c) => c.id === target)?.title}**.`;
      }
      return `❌ Couldn't find a task matching "${searchTitle}".`;
    }

    // Mark done
    const doneMatch = lower.match(/mark (.+?) (?:as )?(?:done|complete)/i);
    if (doneMatch) {
      const searchTitle = doneMatch[1].trim();
      const task = tasks.find((t) => t.title.toLowerCase().includes(searchTitle));
      if (task) {
        moveTask(task.id, "complete");
        return `✅ Marked **"${task.title}"** as complete!`;
      }
      return `❌ Couldn't find a task matching "${searchTitle}".`;
    }

    // Summary
    if (lower.includes("summary") || lower.includes("what did i finish") || lower.includes("today")) {
      const completed = tasks.filter((t) => t.columnId === "complete");
      if (completed.length === 0) return "No completed tasks yet. Keep going! 💪";
      const list = completed.map((t) => `• ${t.title} (${t.estimatedHours}h)`).join("\n");
      const totalHours = completed.reduce((s, t) => s + t.estimatedHours, 0);
      return `📊 **Completed tasks (${completed.length}):**\n\n${list}\n\n**Total: ${totalHours}h invested!**`;
    }

    // Suggest next
    if (lower.includes("suggest") || lower.includes("what should i") || lower.includes("next")) {
      const pending = tasks
        .filter((t) => t.columnId !== "complete")
        .sort((a, b) => {
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          if (pDiff !== 0) return pDiff;
          if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          if (a.dueDate) return -1;
          return 1;
        });
      if (pending.length === 0) return "🎉 All tasks are complete! Time to celebrate!";
      const top = pending[0];
      return `🎯 I'd suggest working on **"${top.title}"** next.\n\n• Priority: **${top.priority}**\n• Due: **${top.dueDate || "No deadline"}**\n• Estimated: **${top.estimatedHours}h**\n\nIt's your highest-priority task${top.dueDate ? " with an upcoming deadline" : ""}.`;
    }

    return "I can help with: **create tasks**, **move tasks**, **mark done**, **daily summary**, or **suggest next task**. Try one of those!";
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const response = processCommand(userMsg.content);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: response },
      ]);
      setLoading(false);
    }, 500);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/25 hover:scale-105 transition-transform"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-display font-semibold text-foreground">LifeBoard AI</p>
                <p className="text-[10px] text-muted-foreground">Professional & concise</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.content.split(/(\*\*.*?\*\*)/).map((part, i) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                      <strong key={i}>{part.slice(2, -2)}</strong>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 text-sm"
              />
              <Button size="icon" onClick={handleSend} disabled={!input.trim() || loading}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
