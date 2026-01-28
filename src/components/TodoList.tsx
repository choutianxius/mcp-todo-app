/**
 * TodoList Component
 * Design: Neo-brutalism - bold headers, high contrast filtering
 * Typography: Space Grotesk for headings, JetBrains Mono for content
 */

import { useState } from "react";
import { Filter, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TodoItem } from "./TodoItem";
import type { Todo } from "@/lib/types";

interface TodoListProps {
	todos: Todo[];
	onToggle: (id: string) => void;
	onUpdate: (id: string, updates: Partial<Todo>) => void;
	onDelete: (id: string) => void;
	onClearCompleted: () => void;
}

type FilterType = "all" | "pending" | "completed";

export function TodoList({
	todos,
	onToggle,
	onUpdate,
	onDelete,
	onClearCompleted,
}: TodoListProps) {
	const [filter, setFilter] = useState<FilterType>("all");

	const filteredTodos = todos.filter((todo) => {
		if (filter === "pending") return !todo.completed;
		if (filter === "completed") return todo.completed;
		return true;
	});

	const completedCount = todos.filter((t) => t.completed).length;
	const pendingCount = todos.filter((t) => !t.completed).length;

	return (
		<div className="space-y-4">
			{/* Header with stats */}
			<div className="border-4 border-border bg-card p-4 brutal-shadow-sm">
				<h2 className="font-display text-2xl font-bold text-foreground">
					Your Todos
				</h2>
				<div className="mt-2 flex gap-4 font-mono text-sm text-muted-foreground">
					<span className="text-accent">{pendingCount} pending</span>
					<span className="text-secondary">{completedCount} completed</span>
					<span className="text-foreground">{todos.length} total</span>
				</div>
			</div>

			{/* Filter buttons */}
			<div className="flex flex-wrap gap-2">
				<Button
					onClick={() => setFilter("all")}
					variant={filter === "all" ? "default" : "outline"}
					size="sm"
					className={
						filter === "all"
							? "border-2 border-primary bg-primary text-primary-foreground"
							: "border-2 border-border bg-background hover:bg-muted"
					}
				>
					<Filter className="mr-2 h-4 w-4" />
					All
				</Button>

				<Button
					onClick={() => setFilter("pending")}
					variant={filter === "pending" ? "default" : "outline"}
					size="sm"
					className={
						filter === "pending"
							? "border-2 border-accent bg-accent text-accent-foreground"
							: "border-2 border-border bg-background hover:bg-muted"
					}
				>
					Pending
				</Button>

				<Button
					onClick={() => setFilter("completed")}
					variant={filter === "completed" ? "default" : "outline"}
					size="sm"
					className={
						filter === "completed"
							? "border-2 border-secondary bg-secondary text-secondary-foreground"
							: "border-2 border-border bg-background hover:bg-muted"
					}
				>
					Completed
				</Button>

				{completedCount > 0 && (
					<Button
						onClick={onClearCompleted}
						variant="outline"
						size="sm"
						className="ml-auto border-2 border-destructive bg-background text-destructive hover:bg-destructive hover:text-destructive-foreground"
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Clear Completed
					</Button>
				)}
			</div>

			{/* Todo items */}
			<div className="space-y-3">
				{filteredTodos.length === 0 ? (
					<div className="border-4 border-dashed border-border bg-muted/20 p-8 text-center">
						<p className="font-mono text-sm text-muted-foreground">
							{filter === "all" &&
								"No todos yet. Add one above or ask the agent!"}
							{filter === "pending" && "No pending todos. Great job!"}
							{filter === "completed" && "No completed todos yet."}
						</p>
					</div>
				) : (
					filteredTodos.map((todo) => (
						<TodoItem
							key={todo.id}
							todo={todo}
							onToggle={onToggle}
							onUpdate={onUpdate}
							onDelete={onDelete}
						/>
					))
				)}
			</div>
		</div>
	);
}
