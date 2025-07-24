'use server';

/**
 * @fileOverview Provides a Genkit flow for analyzing and simulating business rules.
 *
 * - analyzeRule - A function that analyzes a rule for its impact or simulates its behavior.
 */

import { ai } from '@/ai/genkit';
import {
  AnalyzeRuleInputSchema,
  AnalyzeRuleOutputSchema,
  type AnalyzeRuleInput,
  type AnalyzeRuleOutput,
} from '@/lib/schemas/analysis';


export async function analyzeRule(input: AnalyzeRuleInput): Promise<AnalyzeRuleOutput> {
  return analyzeRuleFlow(input);
}

const analyzeRulePrompt = ai.definePrompt({
    name: 'analyzeRulePrompt',
    input: { schema: AnalyzeRuleInputSchema },
    output: { schema: AnalyzeRuleOutputSchema },
    prompt: `
        You are a business rule analyst for an employee check-in system. Your task is to analyze a rule provided in JSON format.
        The user wants to perform one of two analyses: 'impact' or 'simulation'.

        Rule to analyze:
        \`\`\`json
        {{{json rule}}}
        \`\`\`
        
        {{#if (eq analysisType 'impact')}}
        ## Impact Analysis Task
        You have been given a list of employee check-in records. Your goal is to determine how many of these records would be affected if the provided rule were active.
        - Analyze the logic of the rule's conditions.
        - Carefully iterate through each check-in record and check if it meets ALL the conditions of the rule.
        - Count the total number of matching records. This will be the 'affectedCount'.
        - Provide a concise summary of your findings in the 'report' field. Explain which conditions were the most significant filters. Format this report in Markdown.
        - Set the 'title' field to "Análisis de Impacto".
        
        Check-in records:
        \`\`\`json
        {{{json allCheckins}}}
        \`\`\`
        {{/if}}

        {{#if (eq analysisType 'simulation')}}
        ## Simulation Task
        Your goal is to explain how the rule works by creating a hypothetical but realistic scenario.
        - Create a story about a fictional employee (e.g., 'Juan Promotor').
        - Describe a specific check-in event for this employee (e.g., "Juan llega 10 minutos tarde a su check-in de entrada porque había mucho tráfico.").
        - Explain step-by-step how the system would evaluate this check-in against the rule's conditions.
        - Clearly state whether the rule's conditions are met.
        - Describe what action(s) would be triggered as a result.
        - Write this entire explanation in the 'report' field, using Markdown for formatting (like bullet points or bold text).
        - Do not set the 'affectedCount' field.
        - Set the 'title' field to "Simulación de Regla".
        {{/if}}
    `,
});

const analyzeRuleFlow = ai.defineFlow(
  {
    name: 'analyzeRuleFlow',
    inputSchema: AnalyzeRuleInputSchema,
    outputSchema: AnalyzeRuleOutputSchema,
  },
  async (input) => {
    
    // For impact analysis, if no check-ins are provided, we can't do anything.
    if (input.analysisType === 'impact' && (!input.allCheckins || input.allCheckins.length === 0)) {
        return {
            title: 'Análisis de Impacto',
            report: 'No hay registros de check-in para analizar. El análisis no se puede realizar.',
            affectedCount: 0,
        };
    }

    const llmResponse = await analyzeRulePrompt(input);
    return llmResponse.output!;
  }
);
