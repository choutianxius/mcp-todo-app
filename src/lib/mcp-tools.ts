import { nanoid } from "nanoid";
import type { Todo, TodoInput, TodoUpdate } from "@/lib/types";
import { todoDB } from "./db";

/**
 * MCP-style tool definitions for todo operations
 * These tools follow the Model Context Protocol pattern:
 * - Each tool has a name, description, and input schema
 * - Tools are executable functions that perform CRUD operations
 * - Tools return structured results that can be interpreted by agents
 */

export interface MCPTool {
	name: string;
	description: string;
	inputSchema: {
		type: "object";
		properties: Record<string, any>;
		required?: string[];
	};
	execute: (args: any) => Promise<any>;
}

export const mcpTools: MCPTool[] = [
	{
		name: "list_todos",
		description:
			"Get all todo items. Returns an array of todos with their details.",
		inputSchema: {
			type: "object",
			properties: {
				filter: {
					type: "string",
					enum: ["all", "completed", "pending"],
					description: "Filter todos by completion status",
				},
			},
		},
		execute: async (args: { filter?: "all" | "completed" | "pending" }) => {
			const todos = await todoDB.getAll();

			if (args.filter === "completed") {
				return todos.filter((t) => t.completed);
			}
			if (args.filter === "pending") {
				return todos.filter((t) => !t.completed);
			}

			return todos.sort((a, b) => b.createdAt - a.createdAt);
		},
	},

	{
		name: "create_todo",
		description:
			"Create a new todo item. Returns the created todo with its generated ID.",
		inputSchema: {
			type: "object",
			properties: {
				title: {
					type: "string",
					description: "The title of the todo item",
				},
				description: {
					type: "string",
					description: "Optional detailed description of the todo",
				},
				tags: {
					type: "array",
					items: { type: "string" },
					description: "Optional tags for categorizing the todo",
				},
			},
			required: ["title"],
		},
		execute: async (args: {
			title: string;
			description?: string;
			tags?: string[];
		}) => {
			const now = Date.now();
			const todo: Todo = {
				id: nanoid(),
				title: args.title,
				description: args.description,
				completed: false,
				createdAt: now,
				updatedAt: now,
				tags: args.tags,
			};

			await todoDB.add(todo);
			return todo;
		},
	},

	{
		name: "update_todo",
		description:
			"Update an existing todo item. Can modify title, description, completion status, or tags.",
		inputSchema: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description: "The ID of the todo to update",
				},
				title: {
					type: "string",
					description: "New title for the todo",
				},
				description: {
					type: "string",
					description: "New description for the todo",
				},
				completed: {
					type: "boolean",
					description: "New completion status",
				},
				tags: {
					type: "array",
					items: { type: "string" },
					description: "New tags for the todo",
				},
			},
			required: ["id"],
		},
		execute: async (args: { id: string } & TodoUpdate) => {
			const existing = await todoDB.getById(args.id);
			if (!existing) {
				throw new Error(`Todo with id ${args.id} not found`);
			}

			const updated: Todo = {
				...existing,
				...args,
				id: existing.id,
				createdAt: existing.createdAt,
				updatedAt: Date.now(),
			};

			await todoDB.update(updated);
			return updated;
		},
	},

	{
		name: "delete_todo",
		description: "Delete a todo item by its ID. Returns success confirmation.",
		inputSchema: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description: "The ID of the todo to delete",
				},
			},
			required: ["id"],
		},
		execute: async (args: { id: string }) => {
			const existing = await todoDB.getById(args.id);
			if (!existing) {
				throw new Error(`Todo with id ${args.id} not found`);
			}

			await todoDB.delete(args.id);
			return { success: true, deletedId: args.id };
		},
	},

	{
		name: "toggle_todo",
		description:
			"Toggle the completion status of a todo item. Returns the updated todo.",
		inputSchema: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description: "The ID of the todo to toggle",
				},
			},
			required: ["id"],
		},
		execute: async (args: { id: string }) => {
			const existing = await todoDB.getById(args.id);
			if (!existing) {
				throw new Error(`Todo with id ${args.id} not found`);
			}

			const updated: Todo = {
				...existing,
				completed: !existing.completed,
				updatedAt: Date.now(),
			};

			await todoDB.update(updated);
			return updated;
		},
	},

	{
		name: "clear_completed",
		description:
			"Delete all completed todo items. Returns the number of items deleted.",
		inputSchema: {
			type: "object",
			properties: {},
		},
		execute: async () => {
			const todos = await todoDB.getAll();
			const completed = todos.filter((t) => t.completed);

			await Promise.all(completed.map((t) => todoDB.delete(t.id)));

			return { success: true, deletedCount: completed.length };
		},
	},
];

/**
 * Get a tool by name
 */
export function getTool(name: string): MCPTool | undefined {
	return mcpTools.find((t) => t.name === name);
}

/**
 * List all available tools (MCP discovery pattern)
 */
export function listTools(): Array<{
	name: string;
	description: string;
	inputSchema: any;
}> {
	return mcpTools.map((t) => ({
		name: t.name,
		description: t.description,
		inputSchema: t.inputSchema,
	}));
}
