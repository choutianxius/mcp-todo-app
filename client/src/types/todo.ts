export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

export type TodoInput = Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>;

export type TodoUpdate = Partial<Omit<Todo, 'id' | 'createdAt'>>;
