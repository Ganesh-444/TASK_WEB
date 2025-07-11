export type Task = {
  id: string;
  title: string;
  description?: string;
  xp: number;
  category: 'daily' | 'main';
  completedAt?: string;
};

export type QuestTemplate = {
  id: string;
  title: string;
  xp: number;
};
