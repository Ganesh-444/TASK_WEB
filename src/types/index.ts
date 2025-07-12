export type Attribute = 'str' | 'int' | 'skills' | 'academics';

export type SubTask = {
  id: string;
  title: string;
  completed: boolean;
  xp: number;
  subTasks?: SubTask[];
};

export type Task = {
  id:string;
  title: string;
  description?: string;
  count?: number;
  unit?: string;
  xp: number;
  category: 'daily' | 'main';
  attribute: Attribute;
  completedAt?: string;
  deadline?: string;
  startedAt?: string;
  levelAtCompletion?: number;
  isFailure?: boolean;
  subTasks?: SubTask[];
};

export type QuestTemplate = {
  id: string;
  title: string;
  xp: number;
  attribute: Attribute;
};
