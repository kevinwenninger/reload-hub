/**
 * Load-development view model: per version, how much was loaded, how often
 * it was tested and how it was rated. Pure functions over already-fetched
 * rows (loads/versions/sessions) — no I/O.
 */
import type { LoadVersion } from '@/lib/loads';
import type { RangeSession } from '@/lib/range';
import { supabase } from '@/lib/supabase';

export interface VersionSummary {
  version: LoadVersion;
  tests: number;
  /** Mean of rated sessions; null when none rated. */
  avgRating: number | null;
  /** Most recent lessons-learned text, if any. */
  lastLessons: string | null;
  lastTestedOn: string | null;
}

export function summarizeVersions(
  versions: LoadVersion[],
  sessions: RangeSession[],
): VersionSummary[] {
  return versions.map((version) => {
    const own = sessions
      .filter((session) => session.load_version_id === version.id)
      .sort((a, b) => b.date.localeCompare(a.date));
    const rated = own.filter((session) => session.rating !== null);
    return {
      version,
      tests: own.length,
      avgRating:
        rated.length === 0
          ? null
          : rated.reduce((sum, session) => sum + (session.rating ?? 0), 0) / rated.length,
      lastLessons: own.find((session) => session.lessons_learned)?.lessons_learned ?? null,
      lastTestedOn: own[0]?.date ?? null,
    };
  });
}

/** All sessions across a load's versions (one query for the timeline). */
export async function listSessionsForVersions(
  versionIds: string[],
): Promise<RangeSession[]> {
  if (versionIds.length === 0) return [];
  const { data, error } = await supabase
    .from('range_sessions')
    .select('*')
    .in('load_version_id', versionIds)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export function formatRating(avg: number | null): string {
  if (avg === null) return '—';
  return Number.isInteger(avg) ? String(avg) : avg.toFixed(1);
}
