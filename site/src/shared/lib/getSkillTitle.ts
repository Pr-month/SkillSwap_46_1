import type { ISkill } from "../../utils/types";

export const getSkillTitle = (skillId: string, skills: ISkill[]): string =>
  skills.find((s) => s.id === skillId)?.title ?? skillId;
