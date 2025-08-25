'use server';
/**
 * @fileOverview A quiz generation AI flow.
 *
 * - generateQuiz: A function that handles the quiz generation process.
 * - QuizInput: The input type for the generateQuiz function.
 * - QuizOutput: The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionSchema = z.object({
  text: z.string().describe('The question text.'),
  options: z.array(z.string()).length(4).describe('A list of 4 possible answers.'),
  correctAnswer: z.string().describe('The correct answer from the options list.'),
  image: z.string().optional().describe('An optional image URL for the question.'),
});

const QuizInputSchema = z.object({
  topic: z.string().describe('The topic of the quiz.'),
  numQuestions: z.number().int().min(1).max(50).describe('The number of questions to generate.'),
});
export type QuizInput = z.infer<typeof QuizInputSchema>;

const QuizOutputSchema = z.object({
  questions: z.array(QuestionSchema),
});
export type QuizOutput = z.infer<typeof QuizOutputSchema>;


export async function generateQuiz(input: QuizInput): Promise<QuizOutput> {
  return quizGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'quizGeneratorPrompt',
  input: {schema: QuizInputSchema},
  output: {schema: QuizOutputSchema},
  prompt: `You are an expert in creating educational quizzes.
Generate a quiz with {{numQuestions}} multiple-choice questions about the topic: "{{topic}}".
Each question must have 4 options and one correct answer.
The questions should be in Vietnamese.
Ensure the format is a valid JSON object matching the provided schema.`,
});

const quizGeneratorFlow = ai.defineFlow(
  {
    name: 'quizGeneratorFlow',
    inputSchema: QuizInputSchema,
    outputSchema: QuizOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
