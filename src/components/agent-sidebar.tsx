/**
 * AgentSidebar Component
 * Design: Neo-brutalism - sliding sidebar with cyan accent, bold borders
 * Typography: JetBrains Mono for chat messages
 * Animation: Sharp slide-in with momentum (150ms cubic-bezier)
 */

import { useState, useRef, useEffect } from "react";
import { Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { agentService, type AgentMessage } from "@/lib/agent-service";

interface AgentSidebarProps {
  isOpen: boolean;
  onTodosChange: () => void;
}

export function AgentSidebar({ isOpen, onTodosChange }: AgentSidebarProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: "0",
      role: "agent",
      content:
        "Hi! I'm your MCP-powered todo agent. I can help you manage your todos through natural language. Try asking me to list, create, complete, or delete todos!",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [
    isOpen,
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [
    messages,
  ]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);
    setInput("");
    setIsProcessing(true);

    try {
      const agentResponse = await agentService.processPrompt(
        userMessage.content,
      );
      setMessages((prev) => [
        ...prev,
        agentResponse,
      ]);

      // Trigger todos refresh if any tools were called
      if (agentResponse.toolCalls && agentResponse.toolCalls.length > 0) {
        onTodosChange();
      }
    } catch (error) {
      const errorMessage: AgentMessage = {
        id: Date.now().toString(),
        role: "agent",
        content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [
        ...prev,
        errorMessage,
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`
        absolute right-0 top-0 h-full w-full sm:w-[400px] lg:w-[500px]
        bg-sidebar border-l-4 border-sidebar-border z-40
        transition-transform duration-150 ease-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="shrink-0 border-b-4 border-sidebar-border bg-sidebar-accent p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-sidebar-primary bg-sidebar-primary">
              <Bot className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-sidebar-foreground">
                MCP Agent
              </h2>
              <p className="font-mono text-xs text-sidebar-foreground/60">
                Powered by Model Context Protocol
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="relative min-h-0 flex-1">
          {/* Top fade */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-sidebar to-transparent" />
          {/* Bottom fade */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 bg-gradient-to-t from-sidebar to-transparent" />
          <div ref={scrollRef} className="h-full overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`
                    flex gap-3
                    ${message.role === "user" ? "justify-end" : "justify-start"}
                  `}
                >
                  {message.role === "agent" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-sidebar-primary bg-sidebar-primary">
                      <Bot className="h-5 w-5 text-sidebar-primary-foreground" />
                    </div>
                  )}

                  <div
                    className={`
                      max-w-[80%] border-2 p-3
                      ${
                        message.role === "user"
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-sidebar-border bg-sidebar-accent text-sidebar-foreground"
                      }
                    `}
                  >
                    <p className="whitespace-pre-wrap break-words font-mono text-sm">
                      {message.content}
                    </p>

                    {message.toolCalls && message.toolCalls.length > 0 && (
                      <div className="mt-2 border-t-2 border-sidebar-border pt-2">
                        <p className="font-mono text-xs text-sidebar-foreground/60">
                          Tools used:{" "}
                          {message.toolCalls
                            .map((tc) => tc.toolName)
                            .join(", ")}
                        </p>
                      </div>
                    )}

                    <p className="mt-1 font-mono text-xs text-sidebar-foreground/40">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>

                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-accent bg-accent text-accent-foreground font-mono font-bold">
                      U
                    </div>
                  )}
                </div>
              ))}

              {isProcessing && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-sidebar-primary bg-sidebar-primary">
                    <Bot className="h-5 w-5 animate-pulse text-sidebar-primary-foreground" />
                  </div>
                  <div className="border-2 border-sidebar-border bg-sidebar-accent p-3">
                    <p className="font-mono text-sm text-sidebar-foreground/60">
                      Processing...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 border-t-4 border-sidebar-border bg-sidebar p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me to manage your todos..."
              disabled={isProcessing}
              className="border-2 border-sidebar-primary bg-sidebar-accent font-mono text-sm placeholder:text-sidebar-foreground/40"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              className="border-2 border-sidebar-primary bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <p className="mt-2 font-mono text-xs text-sidebar-foreground/40">
            Try: "List all todos" or "Add a todo: Buy groceries"
          </p>
        </div>
      </div>
    </div>
  );
}
