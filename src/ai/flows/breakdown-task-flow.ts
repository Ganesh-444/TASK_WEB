'use server';

/**
 * @fileOverview This file defines a Genkit flow for breaking down a complex task into a hierarchy of sub-tasks.
 *
 * The flow takes a task title and generates a structured list of main tasks and their sub-tasks,
 * including suggested XP values for each.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SubTaskSchema = z.object({
    title: z.string().describe("The title of the sub-task."),
    xp: z.number().describe("The suggested XP for this sub-task. Should be smaller than the parent task."),
    subTasks: z.lazy(() => z.array(SubTaskSchema)).optional().describe("A list of further nested sub-tasks, if applicable."),
});

const BreakdownTaskOutputSchema = z.object({
    title: z.string().describe("The original title of the main task."),
    xp: z.number().describe("The suggested total XP for the entire main task."),
    subTasks: z.array(SubTaskSchema).describe("The generated list of sub-tasks."),
});

export type BreakdownTaskOutput = z.infer<typeof BreakdownTaskOutputSchema>;

const BreakdownTaskInputSchema = z.object({
  taskTitle: z.string().describe('The title of the complex task to break down.'),
});
export type BreakdownTaskInput = z.infer<typeof BreakdownTaskInputSchema>;


export async function breakdownTask(input: BreakdownTaskInput): Promise<BreakdownTaskOutput> {
  return breakdownTaskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'breakdownTaskPrompt',
  input: {schema: BreakdownTaskInputSchema},
  output: {schema: BreakdownTaskOutputSchema},
  prompt: `You are a project management expert for a personal productivity application that uses gamification (XP points). Your goal is to break down a single, complex user-provided task into a clear, hierarchical list of smaller, actionable sub-tasks.

You must generate a tree of tasks, up to 2 levels deep (main task -> sub-task -> sub-sub-task).

- The top-level task is the user's input.
- You will create a list of sub-tasks for it.
- If a sub-task is still complex, you can break it down further into its own sub-sub-tasks.
- You MUST assign a suggested XP value for every single task and sub-task.
- A parent task's XP should be roughly the sum of its direct children's XP, plus a small bonus for completion.
- Smaller, more granular tasks should have lower XP values. Large, multi-step tasks should have higher XP values.

Reference XP Scale:
- "Walk the dog": 10 XP
- "Do the laundry": 15 XP
- "Go to the gym for an hour": 50 XP
- "Write a blog post": 100 XP
- "Organize the garage": 200 XP
- "Complete a major project for work": 500 XP
- "Learn a new programming language": 1000 XP

Break down the following task:
Task: {{{taskTitle}}}
`,
});

const breakdownTaskFlow = ai.defineFlow(
  {
    name: 'breakdownTaskFlow',
    inputSchema: BreakdownTaskInputSchema,
    outputSchema: BreakdownTaskOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
