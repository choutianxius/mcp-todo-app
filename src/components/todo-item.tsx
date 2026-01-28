/**
 * TodoItem Component
 * Design: Neo-brutalism - bold borders, hard shadows, high contrast
 * Typography: JetBrains Mono for content, sharp interactions
 */

import { useState } from "react";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Todo } from "@/lib/types";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({
  todo,
  onToggle,
  onUpdate,
  onDelete,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(
    todo.description || "",
  );

  const handleSave = () => {
    onUpdate(todo.id, {
      title: editTitle,
      description: editDescription || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
    setIsEditing(false);
  };

  return (
    <div
      className={`
        border-4 border-border bg-card p-4 transition-all duration-150
        ${todo.completed ? "opacity-60" : "brutal-shadow-sm hover:brutal-shadow"}
      `}
    >
      {isEditing ? (
        <div className="space-y-3">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="border-2 border-primary bg-background font-mono text-sm"
            placeholder="Todo title"
          />
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="border-2 border-primary bg-background font-mono text-sm"
            placeholder="Description (optional)"
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              size="sm"
              className="border-2 border-accent bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleCancel}
              size="sm"
              variant="outline"
              className="border-2 border-border bg-background hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={() => onToggle(todo.id)}
            className="mt-1 h-5 w-5 border-2 border-primary data-[state=checked]:bg-accent data-[state=checked]:border-accent"
          />

          <div className="flex-1 min-w-0">
            <h3
              className={`font-mono text-sm font-medium break-words ${
                todo.completed
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {todo.title}
            </h3>

            {todo.description && (
              <p className="mt-1 font-mono text-xs text-muted-foreground break-words">
                {todo.description}
              </p>
            )}

            {todo.tags && todo.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {todo.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="border-2 border-secondary bg-secondary/20 px-2 py-0.5 font-mono text-xs text-secondary-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {new Date(todo.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex gap-1">
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
              variant="outline"
              className="h-8 w-8 border-2 border-border bg-background p-0 hover:bg-muted"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => onDelete(todo.id)}
              size="sm"
              variant="outline"
              className="h-8 w-8 border-2 border-destructive bg-background p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
