export type Attribute = 'str' | 'int' | 'skills' | 'academics';

export type Task = {
  id: string;
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
};

export type QuestTemplate = {
  id: string;
  title: string;
  xp: number;
  attribute: Attribute;
};
