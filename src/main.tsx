import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { AddTodoForm } from "@/components/AddTodoForm";
import { TodoList } from "@/components/TodoList";
import { AgentSidebar } from "@/components/AgentSidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./ThemeContext";
import { todoDB } from "@/lib/db";
import { getTool } from "@/lib/mcp-tools";
import type { Todo } from "@/lib/types";
import { toast } from "sonner";
import "./index.css";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initDB();
  }, []);

  const initDB = async () => {
    try {
      await todoDB.init();
      await loadTodos();
    } catch (error) {
      console.error("Failed to initialize database:", error);
      toast.error("Failed to initialize database");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTodos = async () => {
    try {
      const tool = getTool("list_todos");
      if (tool) {
        const result = await tool.execute({
          filter: "all",
        });
        setTodos(result);
      }
    } catch (error) {
      console.error("Failed to load todos:", error);
      toast.error("Failed to load todos");
    }
  };

  const handleAddTodo = async (
    title: string,
    description?: string,
    tags?: string[],
  ) => {
    try {
      const tool = getTool("create_todo");
      if (tool) {
        await tool.execute({
          title,
          description,
          tags,
        });
        await loadTodos();
        toast.success("Todo created!");
      }
    } catch (error) {
      console.error("Failed to create todo:", error);
      toast.error("Failed to create todo");
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      const tool = getTool("toggle_todo");
      if (tool) {
        await tool.execute({
          id,
        });
        await loadTodos();
      }
    } catch (error) {
      console.error("Failed to toggle todo:", error);
      toast.error("Failed to toggle todo");
    }
  };

  const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const tool = getTool("update_todo");
      if (tool) {
        await tool.execute({
          id,
          ...updates,
        });
        await loadTodos();
        toast.success("Todo updated!");
      }
    } catch (error) {
      console.error("Failed to update todo:", error);
      toast.error("Failed to update todo");
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const tool = getTool("delete_todo");
      if (tool) {
        await tool.execute({
          id,
        });
        await loadTodos();
        toast.success("Todo deleted!");
      }
    } catch (error) {
      console.error("Failed to delete todo:", error);
      toast.error("Failed to delete todo");
    }
  };

  const handleClearCompleted = async () => {
    try {
      const tool = getTool("clear_completed");
      if (tool) {
        const result = await tool.execute({});
        await loadTodos();
        toast.success(`Cleared ${result.deletedCount} completed todo(s)`);
      }
    } catch (error) {
      console.error("Failed to clear completed todos:", error);
      toast.error("Failed to clear completed todos");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-4 border-primary bg-card p-8 brutal-shadow-cyan">
          <p className="font-mono text-sm text-foreground">
            Initializing database...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b-4 border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center border-4 border-primary bg-primary">
                <Sparkles className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground">
                  MCP TODO
                </h1>
                <p className="font-mono text-xs text-muted-foreground">
                  Model Context Protocol • Agent-Powered
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsAgentOpen(!isAgentOpen)}
              className="border-4 border-primary bg-primary text-primary-foreground hover:bg-primary/90 brutal-shadow-cyan"
            >
              <Bot className="mr-2 h-5 w-5" />
              Toggle Agent
            </Button>
          </div>
        </div>
      </header>

      {/* Content Wrapper - contains main and sidebar */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main
          className={`container mx-auto flex-1 px-4 py-8 transition-[margin] duration-150 ease-out ${isAgentOpen ? "sm:mr-[400px] lg:mr-[500px]" : ""}`}
        >
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Add Todo Form */}
            <AddTodoForm onAdd={handleAddTodo} />

            {/* Todo List */}
            <TodoList
              todos={todos}
              onToggle={handleToggleTodo}
              onUpdate={handleUpdateTodo}
              onDelete={handleDeleteTodo}
              onClearCompleted={handleClearCompleted}
            />
          </div>
        </main>

        {/* Agent Sidebar */}
        <AgentSidebar isOpen={isAgentOpen} onTodosChange={loadTodos} />
      </div>

      {/* Footer */}
      <footer className="border-t-4 border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="font-mono text-sm text-muted-foreground">
              Built with React + TypeScript + IndexedDB
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              Powered by Model Context Protocol (MCP)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <App />
      </TooltipProvider>
    </ThemeProvider>
  </ErrorBoundary>,
);
