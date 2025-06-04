export interface Challenge {
  id: string;
  task_description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  created_date: string;
  status: 'active' | 'inactive';
}

export interface User {
  id: string;
  name: string;
  surname?: string;
  email: string;
  join_date: string;
  points: number;
} 