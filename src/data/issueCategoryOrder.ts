/**
 * Category display order follows issue ID hundreds digit (1xx, 2xx, …).
 * GitHub-only categories use 7xx, 8xx, 9xx after GitLab's 1–6 range.
 */
export const categorySortPrefix: Record<string, number> = {
  "CI/CD Container Images": 1,
  "CI/CD Variables": 2,
  "CI/CD Secrets": 3,
  "Pipeline Composition": 4,
  "Access and Authorization": 5,
  "Security Source": 6,
  "Third-party actions": 7,
  "Workflow triggers and permissions": 8,
  "Repository hygiene": 9,
};

export function categoryOrderRank(category: string): number {
  return categorySortPrefix[category] ?? 99;
}

export function issueCodeRank(code: string): number {
  const match = code.match(/^ISSUE-(\d+)$/);
  return match ? Number.parseInt(match[1], 10) : 9999;
}
