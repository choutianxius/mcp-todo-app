/**
 * Agent Service
 * Simulates MCP client behavior by interpreting user prompts
 * and executing appropriate MCP tools
 */

import { mcpTools, getTool } from "./mcp-tools";

export interface AgentMessage {
	id: string;
	role: "user" | "agent";
	content: string;
	timestamp: number;
	toolCalls?: ToolCall[];
}

export interface ToolCall {
	toolName: string;
	args: any;
	result?: any;
	error?: string;
}

/**
 * Simple prompt interpretation logic
 * In a real implementation, this would use an LLM to understand intent
 * For this demo, we use keyword matching and pattern recognition
 */
export class AgentService {
	/**
	 * Process a user prompt and execute appropriate tools
	 */
	async processPrompt(prompt: string): Promise<AgentMessage> {
		const lowerPrompt = prompt.toLowerCase();
		const toolCalls: ToolCall[] = [];
		let responseText = "";

		try {
			// List todos
			if (
				this.matchesPattern(lowerPrompt, [
					"list",
					"show",
					"get",
					"what",
					"display",
				])
			) {
				const tool = getTool("list_todos");
				if (tool) {
					const filter = this.extractFilter(lowerPrompt);
					const result = await tool.execute({ filter });
					toolCalls.push({ toolName: "list_todos", args: { filter }, result });

					if (result.length === 0) {
						responseText = `No ${filter === "all" ? "" : filter + " "}todos found.`;
					} else {
						responseText = `Found ${result.length} ${filter === "all" ? "" : filter + " "}todo(s):\n\n`;
						responseText += result
							.map(
								(t: any, i: number) =>
									`${i + 1}. ${t.completed ? "✓" : "○"} ${t.title}${t.description ? "\n   " + t.description : ""}`,
							)
							.join("\n");
					}
				}
			}
			// Create todo
			else if (
				this.matchesPattern(lowerPrompt, ["add", "create", "new", "make"])
			) {
				const title = this.extractTitle(prompt);
				const description = this.extractDescription(prompt);
				const tags = this.extractTags(prompt);

				if (!title) {
					responseText =
						'I need a title to create a todo. Try: "Add a todo: Buy groceries"';
				} else {
					const tool = getTool("create_todo");
					if (tool) {
						const result = await tool.execute({ title, description, tags });
						toolCalls.push({
							toolName: "create_todo",
							args: { title, description, tags },
							result,
						});
						responseText = `Created todo: "${title}"${description ? "\nDescription: " + description : ""}${tags && tags.length > 0 ? "\nTags: " + tags.join(", ") : ""}`;
					}
				}
			}
			// Mark complete
			else if (
				this.matchesPattern(lowerPrompt, ["complete", "done", "finish", "mark"])
			) {
				// First list todos to find the right one
				const listTool = getTool("list_todos");
				if (listTool) {
					const todos = await listTool.execute({ filter: "pending" });

					if (todos.length === 0) {
						responseText = "No pending todos to complete.";
					} else {
						// Try to match by title or number
						const todoMatch = this.findTodoMatch(prompt, todos);

						if (todoMatch) {
							const toggleTool = getTool("toggle_todo");
							if (toggleTool) {
								const result = await toggleTool.execute({ id: todoMatch.id });
								toolCalls.push({
									toolName: "toggle_todo",
									args: { id: todoMatch.id },
									result,
								});
								responseText = `Marked "${todoMatch.title}" as complete!`;
							}
						} else {
							responseText =
								'Which todo would you like to complete? Try: "Complete the first one" or mention the todo title.';
						}
					}
				}
			}
			// Delete todo
			else if (
				this.matchesPattern(lowerPrompt, ["delete", "remove", "clear"])
			) {
				if (
					this.matchesPattern(lowerPrompt, ["completed", "done", "finished"])
				) {
					const tool = getTool("clear_completed");
					if (tool) {
						const result = await tool.execute({});
						toolCalls.push({ toolName: "clear_completed", args: {}, result });
						responseText = `Cleared ${result.deletedCount} completed todo(s).`;
					}
				} else {
					// Find specific todo to delete
					const listTool = getTool("list_todos");
					if (listTool) {
						const todos = await listTool.execute({ filter: "all" });
						const todoMatch = this.findTodoMatch(prompt, todos);

						if (todoMatch) {
							const deleteTool = getTool("delete_todo");
							if (deleteTool) {
								const result = await deleteTool.execute({ id: todoMatch.id });
								toolCalls.push({
									toolName: "delete_todo",
									args: { id: todoMatch.id },
									result,
								});
								responseText = `Deleted "${todoMatch.title}".`;
							}
						} else {
							responseText =
								'Which todo would you like to delete? Try: "Delete the first one" or mention the todo title.';
						}
					}
				}
			}
			// Help / capabilities
			else if (
				this.matchesPattern(lowerPrompt, [
					"help",
					"what can",
					"how",
					"capabilities",
				])
			) {
				responseText = `I can help you manage your todos! Here's what I can do:

• **List todos**: "Show all todos", "List pending todos"
• **Create todos**: "Add a todo: Buy milk", "Create: Fix bug #urgent"
• **Complete todos**: "Mark the first one as done", "Complete Buy milk"
• **Delete todos**: "Delete the second todo", "Remove Buy milk"
• **Clear completed**: "Clear all completed todos"

Just ask me in natural language and I'll help!`;
			}
			// Default fallback
			else {
				responseText = `I'm not sure what you want me to do. Try asking me to:
• List your todos
• Add a new todo
• Mark a todo as complete
• Delete a todo

Or type "help" to see all my capabilities!`;
			}
		} catch (error) {
			responseText = `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`;
			if (toolCalls.length > 0) {
				toolCalls[toolCalls.length - 1].error =
					error instanceof Error ? error.message : "Unknown error";
			}
		}

		return {
			id: Date.now().toString(),
			role: "agent",
			content: responseText,
			timestamp: Date.now(),
			toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
		};
	}

	private matchesPattern(text: string, keywords: string[]): boolean {
		return keywords.some((keyword) => text.includes(keyword));
	}

	private extractFilter(prompt: string): "all" | "completed" | "pending" {
		if (
			prompt.includes("completed") ||
			prompt.includes("done") ||
			prompt.includes("finished")
		) {
			return "completed";
		}
		if (
			prompt.includes("pending") ||
			prompt.includes("active") ||
			prompt.includes("incomplete")
		) {
			return "pending";
		}
		return "all";
	}

	private extractTitle(prompt: string): string | null {
		// Look for patterns like "add: title" or "create todo: title"
		const patterns = [
			/(?:add|create|new|make)(?:\s+(?:a\s+)?todo)?:\s*(.+?)(?:\s+description:|$)/i,
			/(?:add|create|new|make)\s+(?:a\s+)?todo\s+(.+?)(?:\s+description:|$)/i,
			/(?:add|create|new|make)\s+(.+?)(?:\s+description:|$)/i,
		];

		for (const pattern of patterns) {
			const match = prompt.match(pattern);
			if (match && match[1]) {
				return match[1].trim();
			}
		}

		return null;
	}

	private extractDescription(prompt: string): string | undefined {
		const match = prompt.match(/description:\s*(.+?)(?:\s+tags:|$)/i);
		return match ? match[1].trim() : undefined;
	}

	private extractTags(prompt: string): string[] | undefined {
		const match = prompt.match(/tags?:\s*(.+?)$/i);
		if (match) {
			return match[1]
				.split(",")
				.map((t) => t.trim())
				.filter((t) => t.length > 0);
		}

		// Also look for hashtags
		const hashtags = prompt.match(/#(\w+)/g);
		if (hashtags) {
			return hashtags.map((t) => t.substring(1));
		}

		return undefined;
	}

	private findTodoMatch(prompt: string, todos: any[]): any | null {
		const lowerPrompt = prompt.toLowerCase();

		// Try to match by position (first, second, last, etc.)
		if (lowerPrompt.includes("first") || lowerPrompt.includes("1st")) {
			return todos[0] || null;
		}
		if (lowerPrompt.includes("second") || lowerPrompt.includes("2nd")) {
			return todos[1] || null;
		}
		if (lowerPrompt.includes("third") || lowerPrompt.includes("3rd")) {
			return todos[2] || null;
		}
		if (lowerPrompt.includes("last")) {
			return todos[todos.length - 1] || null;
		}

		// Try to match by title
		for (const todo of todos) {
			if (lowerPrompt.includes(todo.title.toLowerCase())) {
				return todo;
			}
		}

		return null;
	}
}

export const agentService = new AgentService();
