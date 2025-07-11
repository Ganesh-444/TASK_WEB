'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting XP values for new tasks.
 *
 * The flow uses a prompt to analyze the task description and provide an appropriate XP value suggestion.
 * It exports the SuggestXpValueInput and SuggestXpValueOutput types, as well as the suggestXpValue function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestXpValueInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The description of the task for which an XP value is needed.'),
});
export type SuggestXpValueInput = z.infer<typeof SuggestXpValueInputSchema>;

const SuggestXpValueOutputSchema = z.object({
  suggestedXpValue: z
    .number()
    .describe('The suggested XP value for the task, based on its complexity and importance.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the suggested XP value.'),
});
export type SuggestXpValueOutput = z.infer<typeof SuggestXpValueOutputSchema>;

export async function suggestXpValue(input: SuggestXpValueInput): Promise<SuggestXpValueOutput> {
  return suggestXpValueFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestXpValuePrompt',
  input: {schema: SuggestXpValueInputSchema},
  output: {schema: SuggestXpValueOutputSchema},
  prompt: `You are an expert task value estimator for a personal productivity application.

  Based on the following task description, suggest an appropriate XP value. Consider the task's complexity, the effort required, and its importance to the user's goals.

  Task Description: {{{taskDescription}}}

  Provide the XP value as a number, and a brief explanation of your reasoning.
  `,
});

const suggestXpValueFlow = ai.defineFlow(
  {
    name: 'suggestXpValueFlow',
    inputSchema: SuggestXpValueInputSchema,
    outputSchema: SuggestXpValueOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
