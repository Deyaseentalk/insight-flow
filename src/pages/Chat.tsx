import { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTaskContext } from "@/context/TaskContext";
import { toast } from "sonner";
import { ColumnId, COLUMNS } from "@/types/task";
import confetti from "canvas-confetti";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hey! I'm your **FoxBoard AI** 🦊\n\nI can help manage your goals:\n\n- **Create**: \"Add task: Morning jog, 2 hours\"\n- **Move**: \"Move Learn Spanish to Complete\"\n- **Done**: \"Mark Meditate as done\"\n- **Summary**: \"What did I finish?\"\n- **Suggest**: \"What should I work on next?\"",
      timestamp: new Date(),
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
    } catch {
      // Not valid JSON action
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: input.trim(), timestamp: new Date() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    let assistantContent = "";

    try {
      const taskContext = `\n\n[Current board state: ${tasks.map((t) => `"${t.title}" (${t.columnId}, ${t.priority}, ${t.estimatedHours}h, due: ${t.dueDate || "none"})`).join("; ")}]`;

      const apiMessages = updatedMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.role === "user" && m.id === userMsg.id ? m.content + taskContext : m.content,
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
                return [...prev, { id: crypto.randomUUID(), role: "assistant", content: cleanContent, timestamp: new Date() }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      parseAndExecuteActions(assistantContent);
    } catch (e) {
      console.error("Chat error:", e);
      toast.error(e instanceof Error ? e.message : "AI chat failed");
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: "Sorry, I couldn't process that. Please try again.", timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-display font-semibold text-foreground">FoxBoard AI</h1>
          <p className="text-xs text-muted-foreground">Your personal goal assistant</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            <div className="flex flex-col gap-1 max-w-[70%]">
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
              <span className={`text-[10px] text-muted-foreground ${msg.role === "user" ? "text-right" : "text-left"}`}>
                {formatTime(msg.timestamp)}
              </span>
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
      <div className="px-6 py-4 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex gap-3 items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask FoxBoard AI anything..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
          />
          <Button size="icon" onClick={handleSend} disabled={!input.trim() || loading} className="shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Try: "Create a task for reading" • "What should I work on?" • "Give me a summary"
        </p>
      </div>
    </div>
  );
};

export default Chat;
