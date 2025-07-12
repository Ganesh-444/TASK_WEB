'use server';

import { suggestXpValue, SuggestXpValueInput, SuggestXpValueOutput } from '@/ai/flows/suggest-xp-value';
import { breakdownTask, BreakdownTaskInput, BreakdownTaskOutput } from '@/ai/flows/breakdown-task-flow';

export async function getXpSuggestion(taskDescription: string): Promise<SuggestXpValueOutput> {
  if (!taskDescription) {
    return {
      suggestedXpValue: 0,
      reasoning: "Please provide a task description to get a suggestion."
    }
  }

  const input: SuggestXpValueInput = { taskDescription };
  try {
    const result = await suggestXpValue(input);
    return result;
  } catch (error) {
    console.error("Error getting XP suggestion:", error);
    return {
      suggestedXpValue: 0,
      reasoning: "Sorry, I couldn't come up with a suggestion right now."
    }
  }
}

export async function getTaskBreakdown(taskTitle: string): Promise<BreakdownTaskOutput | { error: string }> {
  if (!taskTitle) {
    return { error: "Please provide a task title to break down." };
  }
  const input: BreakdownTaskInput = { taskTitle };
  try {
    const result = await breakdownTask(input);
    return result;
  } catch (error) {
    console.error("Error getting task breakdown:", error);
    return { error: "Sorry, I couldn't break down the task right now." };
  }
}
