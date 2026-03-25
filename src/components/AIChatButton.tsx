import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTaskContext } from "@/context/TaskContext";
import { toast } from "sonner";
import { ColumnId, COLUMNS } from "@/types/task";
import confetti from "canvas-confetti";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export function AIChatButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hey! I'm your FoxBoard AI 🚀\n\nI can help manage your goals:\n\n• **Create**: \"Add task: Morning jog, 2 hours\"\n• **Move**: \"Move Learn Spanish to Complete\"\n• **Done**: \"Mark Meditate as done\"\n• **Summary**: \"What did I finish?\"\n• **Suggest**: \"What should I work on next?\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { tasks, addTask, moveTask } = useTaskContext();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const parseAndExecuteActions = (text: string) => {
    const actionMatch = text.match(/<action>([\s\S]*?)<\/action>/);
    if (!actionMatch) return;

    try {
      const action = JSON.parse(actionMatch[1]);

      if (action.action === "create") {
        addTask({
          title: action.title || "New Task",
          description: action.description || "",
          priority: action.priority || "medium",
          dueDate: action.dueDate || null,
          estimatedHours: action.estimatedHours || 1,
          labels: action.labels || [],
          subtasks: [],
          hasAttachment: false,
          columnId: (action.columnId as ColumnId) || "todo",
        });
        toast.success(`Task "${action.title}" created!`);
      }

      if (action.action === "move") {
        const task = tasks.find((t) =>
          t.title.toLowerCase().includes(action.searchTitle?.toLowerCase() || "")
        );
        if (task && action.targetColumn) {
          moveTask(task.id, action.targetColumn as ColumnId);
          toast.success(`Moved "${task.title}" to ${COLUMNS.find((c) => c.id === action.targetColumn)?.title}`);
          if (action.targetColumn === "complete") {
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
          }
        }
      }

      if (action.action === "summary") {
        // AI handles the text response
      }
      if (action.action === "suggest") {
        // AI handles the text response
      }
    } catch {
      // Not valid JSON action, just display text
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    let assistantContent = "";

    try {
      // Include task context in the user message
      const taskContext = `\n\n[Current board state: ${tasks.map((t) => `"${t.title}" (${t.columnId}, ${t.priority}, ${t.estimatedHours}h, due: ${t.dueDate || "none"})`).join("; ")}]`;

      const apiMessages = updatedMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.role === "user" && m.id === userMsg.id
            ? m.content + taskContext
            : m.content,
        }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                const cleanContent = assistantContent.replace(/<action>[\s\S]*?<\/action>/g, "").trim();
                if (last?.role === "assistant" && last.id !== "welcome") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: cleanContent } : m
                  );
                }
                return [...prev, { id: crypto.randomUUID(), role: "assistant", content: cleanContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Parse actions after full response
      parseAndExecuteActions(assistantContent);
    } catch (e) {
      console.error("Chat error:", e);
      toast.error(e instanceof Error ? e.message : "AI chat failed");
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, I couldn't process that. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/25 hover:scale-110 transition-all duration-200 hover:shadow-2xl hover:shadow-primary/40"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-display font-semibold text-foreground">FoxBoard AI</p>
                <p className="text-[10px] text-muted-foreground">Powered by Lovable Cloud</p>
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
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
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
              <div className="flex justify-start animate-fade-in">
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
