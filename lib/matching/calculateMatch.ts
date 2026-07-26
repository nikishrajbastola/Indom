export type MatchResult = {
  percentage: number;
  matchedSkills: string[];
  missingSkills: string[];
};

function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase();
}

export function parseSkills(skillsText: string | null | undefined): string[] {
  if (!skillsText) {
    return [];
  }

  return skillsText
    .split(/[\n,;]+/)
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function calculateMatch(
  studentSkillsText: string | null | undefined,
  taskSkillsText: string | null | undefined
): MatchResult {
  const studentSkills = parseSkills(studentSkillsText);
  const taskSkills = parseSkills(taskSkillsText);

  const normalizedStudentSkills = new Set(
    studentSkills.map(normalizeSkill)
  );

  const matchedSkills = taskSkills.filter((skill) =>
    normalizedStudentSkills.has(normalizeSkill(skill))
  );

  const missingSkills = taskSkills.filter(
    (skill) => !normalizedStudentSkills.has(normalizeSkill(skill))
  );

  const percentage =
    taskSkills.length === 0
      ? 0
      : Math.round((matchedSkills.length / taskSkills.length) * 100);

  return {
    percentage,
    matchedSkills,
    missingSkills,
  };
}