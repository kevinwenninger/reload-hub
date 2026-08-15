import type { Json, Tables, TablesInsert, TablesUpdate } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type ProcessTemplate = Tables<'process_templates'>;
export type ChecklistRun = Tables<'checklist_runs'>;

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  optional: boolean;
}

export type StepsState = Record<string, { done_at: string | null }>;

export function templateSteps(template: { steps: Json }): ProcessStep[] {
  return (template.steps as unknown as ProcessStep[]) ?? [];
}

export function runSteps(run: ChecklistRun): ProcessStep[] {
  return (run.template_snapshot as unknown as ProcessStep[]) ?? [];
}

export function runState(run: ChecklistRun): StepsState {
  return (run.steps_state as unknown as StepsState) ?? {};
}

export function isSystemTemplate(template: ProcessTemplate): boolean {
  return template.user_id === null;
}

// ---------------------------------------------------------------- templates

/** System templates first, then the user's own. */
export async function listTemplates(): Promise<ProcessTemplate[]> {
  const { data, error } = await supabase
    .from('process_templates')
    .select('*')
    .order('user_id', { ascending: true, nullsFirst: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}

export async function insertTemplate(
  row: TablesInsert<'process_templates'>,
): Promise<void> {
  const { error } = await supabase.from('process_templates').insert(row);
  if (error) throw error;
}

export async function updateTemplate(
  id: string,
  patch: TablesUpdate<'process_templates'>,
): Promise<void> {
  const { error } = await supabase
    .from('process_templates')
    .update(patch)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase.from('process_templates').delete().eq('id', id);
  if (error) throw error;
}

// --------------------------------------------------------------------- runs

export async function listRuns(): Promise<ChecklistRun[]> {
  const { data, error } = await supabase
    .from('checklist_runs')
    .select('*')
    .order('started_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertRun(row: TablesInsert<'checklist_runs'>): Promise<void> {
  const { error } = await supabase.from('checklist_runs').insert(row);
  if (error) throw error;
}

export async function updateRunState(id: string, state: StepsState): Promise<void> {
  const { error } = await supabase
    .from('checklist_runs')
    .update({ steps_state: state as unknown as Json })
    .eq('id', id);
  if (error) throw error;
}

/** Server-side completion: lot deduction + loaded batch in one transaction. */
export async function completeRun(id: string): Promise<string> {
  const { data, error } = await supabase.rpc('complete_checklist_run', {
    p_run_id: id,
  });
  if (error) throw error;
  return data;
}

export async function deleteRun(id: string): Promise<void> {
  const { error } = await supabase.from('checklist_runs').delete().eq('id', id);
  if (error) throw error;
}
