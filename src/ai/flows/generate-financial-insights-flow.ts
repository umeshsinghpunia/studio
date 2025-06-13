
'use server';
/**
 * @fileOverview Generates financial insights based on transaction summary.
 *
 * - generateFinancialInsights - A function that generates financial advice.
 * - FinancialInsightsInput - The input type for the generateFinancialInsights function.
 * - FinancialInsightsOutput - The return type for the generateFinancialInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const FinancialSummarySchema = z.object({
  totalIncome: z.number().describe('The total income for the period.'),
  totalExpenses: z.number().describe('The total expenses for the period.'),
  topCategories: z.array(z.object({
    name: z.string().describe('Name of the spending category.'),
    amount: z.number().describe('Amount spent in this category.'),
  })).describe('Top 3-5 spending categories.'),
  currencySymbol: z.string().describe('The currency symbol, e.g., $, €, ₹.'),
});
export type FinancialSummaryInput = z.infer<typeof FinancialSummarySchema>;

export const FinancialInsightsOutputSchema = z.object({
  insights: z.array(z.string()).describe('A list of 2-4 concise financial insights or tips.'),
  overallAssessment: z.string().describe('A brief overall assessment of the financial situation (1-2 sentences).'),
});
export type FinancialInsightsOutput = z.infer<typeof FinancialInsightsOutputSchema>;

export async function generateFinancialInsights(input: FinancialSummaryInput): Promise<FinancialInsightsOutput> {
  return generateFinancialInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFinancialInsightsPrompt',
  input: {schema: FinancialSummarySchema},
  output: {schema: FinancialInsightsOutputSchema},
  prompt: `You are a friendly financial assistant. Based on the following summary, provide a brief overall assessment (1-2 sentences) and 2-4 concise, actionable financial insights or tips. Focus on general advice. Use the provided currency symbol: {{{currencySymbol}}}.

Transaction Summary:
- Total Income: {{{currencySymbol}}}{{{totalIncome}}}
- Total Expenses: {{{currencySymbol}}}{{{totalExpenses}}}
- Top Spending Categories:
{{#each topCategories}}
  - {{name}}: {{{currencySymbol}}}{{amount}}
{{/each}}

Please provide actionable insights and a brief overall assessment.
For example:
Overall Assessment: "Your spending is well within your income, which is great! There's room to optimize further."
Insights:
- "Consider reviewing your subscriptions in the 'Entertainment' category to see if there are any you no longer use."
- "Your 'Food' expenses are significant. Exploring meal prepping could lead to potential savings."
- "Allocate a portion of your net positive income towards savings or investments."
`,
});

const generateFinancialInsightsFlow = ai.defineFlow(
  {
    name: 'generateFinancialInsightsFlow',
    inputSchema: FinancialSummarySchema,
    outputSchema: FinancialInsightsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("Failed to generate insights from the model.");
    }
    return output;
  }
);
