'use server';

import { suggestXpValue, SuggestXpValueInput, SuggestXpValueOutput } from '@/ai/flows/suggest-xp-value';

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
