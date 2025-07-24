import { z } from 'genkit';

// Define Zod schemas that match the types from the main application
const RuleConditionSchema = z.object({
  id: z.number(),
  field: z.string(),
  operator: z.string(),
  value: z.string(),
});

const RuleActionSchema = z.object({
  id: z.number(),
  type: z.string(),
  value: z.string(),
});

export const RuleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  status: z.enum(['active', 'draft', 'scheduled']),
  conditions: z.array(RuleConditionSchema),
  actions: z.array(RuleActionSchema),
});

export const CheckinSchema = z.object({
  id: z.string(),
  user: z.object({
    name: z.string(),
    avatar: z.string(),
  }),
  kioskId: z.string(),
  type: z.enum(['Entrada', 'Comida', 'Salida']),
  date: z.string(), // Expecting 'YYYY-MM-DD HH:mm'
  punctuality: z.enum(['A tiempo', 'Retrasado', 'Anticipado']),
  location: z.enum(['Válida', 'Inválida']),
  photo: z.string().optional(),
});


export const AnalyzeRuleInputSchema = z.object({
  rule: RuleSchema,
  analysisType: z.enum(['impact', 'simulation']),
  // A list of all check-ins for impact analysis.
  // In a real-world scenario, you might fetch this from a database inside the flow.
  allCheckins: z.array(CheckinSchema).optional(), 
});
export type AnalyzeRuleInput = z.infer<typeof AnalyzeRuleInputSchema>;

export const AnalyzeRuleOutputSchema = z.object({
  title: z.string(),
  report: z.string().describe('A detailed report of the analysis, formatted in Markdown.'),
  affectedCount: z.number().optional().describe('The number of records affected by the rule.'),
});
export type AnalyzeRuleOutput = z.infer<typeof AnalyzeRuleOutputSchema>;
