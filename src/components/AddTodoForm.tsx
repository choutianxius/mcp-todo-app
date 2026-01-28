/**
 * AddTodoForm Component
 * Design: Neo-brutalism - bold input fields with thick borders
 * Typography: JetBrains Mono for inputs
 */

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AddTodoFormProps {
  onAdd: (title: string, description?: string, tags?: string[]) => void;
}

export function AddTodoForm({ onAdd }: AddTodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onAdd(
      title.trim(),
      description.trim() || undefined,
      tags.length > 0 ? tags : undefined,
    );

    setTitle("");
    setDescription("");
    setTagsInput("");
    setIsExpanded(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-4 border-primary bg-card p-4 brutal-shadow-cyan"
    >
      <div className="space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder="Add a new todo..."
          className="border-2 border-primary bg-background font-mono text-sm placeholder:text-muted-foreground"
        />

        {isExpanded && (
          <>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="border-2 border-primary bg-background font-mono text-sm placeholder:text-muted-foreground"
              rows={3}
            />

            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Tags (comma-separated, optional)"
              className="border-2 border-primary bg-background font-mono text-sm placeholder:text-muted-foreground"
            />
          </>
        )}

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={!title.trim()}
            className="border-2 border-accent bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Todo
          </Button>

          {isExpanded && (
            <Button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                setDescription("");
                setTagsInput("");
              }}
              variant="outline"
              className="border-2 border-border bg-background hover:bg-muted"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
