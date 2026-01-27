# MCP-Powered Todo App

A modern todo-list application powered by the Model Context Protocol (MCP), featuring an intelligent agent chatbox that manages todos through natural language commands.

## Features

### Core Functionality
- **CRUD Operations**: Create, read, update, and delete todo items
- **IndexedDB Persistence**: All todos stored locally in the browser
- **Rich Todo Items**: Support for titles, descriptions, and tags
- **Filtering**: View all, pending, or completed todos
- **Bulk Actions**: Clear all completed todos at once

### MCP Agent Integration
- **Natural Language Interface**: Interact with todos using conversational commands
- **MCP Tools**: Six specialized tools for todo management:
  - `list_todos`: Get all todos with optional filtering
  - `create_todo`: Add new todos with title, description, and tags
  - `update_todo`: Modify existing todos
  - `delete_todo`: Remove specific todos
  - `toggle_todo`: Mark todos as complete/incomplete
  - `clear_completed`: Bulk delete completed todos

### Agent Commands
The agent understands various natural language patterns:

- **List todos**: "Show all todos", "List pending todos", "What are my completed tasks?"
- **Create todos**: "Add a todo: Buy groceries", "Create: Fix bug #urgent"
- **Complete todos**: "Mark the first one as done", "Complete Buy groceries"
- **Delete todos**: "Delete the second todo", "Remove Buy groceries"
- **Clear completed**: "Clear all completed todos"
- **Help**: "What can you do?", "Help"

### Design
**Neo-Brutalism with Computational Aesthetics**
- Bold 4px borders in electric colors (cyan, magenta, lime)
- Hard drop shadows (8px offset, no blur)
- Monospace typography (JetBrains Mono) for content
- Bold sans-serif (Space Grotesk) for headings
- High contrast dark theme
- Sharp, immediate interactions (150ms transitions)

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: TailwindCSS 4 + shadcn/ui components
- **Storage**: IndexedDB for local persistence
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite
- **MCP Architecture**: Browser-native implementation with MCP-style tools

## Architecture

### MCP-Inspired Design
While traditional MCP uses stdio transport for Node.js/Python processes, this implementation adapts MCP concepts for the browser:

1. **Tool Definitions** (`client/src/lib/mcp-tools.ts`): MCP-style tools with schemas and execute functions
2. **Agent Service** (`client/src/lib/agent-service.ts`): Interprets natural language and calls appropriate tools
3. **IndexedDB Layer** (`client/src/lib/db.ts`): Persistent storage for todos
4. **UI Components**: React components for todo list and agent chatbox

### Project Structure
```
client/
  src/
    components/
      TodoItem.tsx          # Individual todo card
      TodoList.tsx          # Todo list with filtering
      AddTodoForm.tsx       # Form to create new todos
      AgentSidebar.tsx      # Chatbox interface for agent
    lib/
      db.ts                 # IndexedDB wrapper
      mcp-tools.ts          # MCP tool definitions
      agent-service.ts      # Natural language processing
    types/
      todo.ts               # TypeScript interfaces
    pages/
      Home.tsx              # Main application page
```

## Development

### Prerequisites
- Node.js 22+
- pnpm

### Getting Started
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Available Scripts
- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm preview`: Preview production build
- `pnpm check`: TypeScript type checking
- `pnpm format`: Format code with Prettier

## Usage

### Manual Todo Management
1. Click the input field to expand the form
2. Enter a title (required)
3. Optionally add description and tags (comma-separated)
4. Click "Add Todo" to create

### Agent-Powered Management
1. Click "Open Agent" button in the header
2. Type natural language commands like:
   - "Show all my todos"
   - "Add a todo: Buy milk"
   - "Mark the first one as complete"
   - "Delete Buy milk"
3. The agent will execute the appropriate MCP tools and update your todos

## Future Enhancements

Potential features to add:
- **Due Dates**: Add deadline tracking for todos
- **Priority Levels**: High, medium, low priority indicators
- **Search**: Full-text search across todo titles and descriptions
- **Export/Import**: JSON export for backup and sharing
- **Themes**: Light mode and custom color schemes
- **Keyboard Shortcuts**: Quick actions via hotkeys
- **Recurring Todos**: Automatic recreation of repeating tasks
- **Subtasks**: Break down complex todos into smaller steps

## License

MIT
