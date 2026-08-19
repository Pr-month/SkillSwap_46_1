import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  addSkill,
  deleteSkillById,
  getSkillById,
  getSkills,
  modifySkill,
} from "../../api/skillApi";
import type { TId, TModifySkillData, TSkillData } from "../../utils/types";

/** ASYNC THUNK: ПОЛУЧЕНИЕ ВСЕХ НАВЫКОВ */
export const fetchSkills = createAsyncThunk("skills/get", async () =>
  getSkills(),
);

/** ASYNC THUNK: ДОБАВЛЕНИЕ НАВЫКА */
export const appendSkill = createAsyncThunk(
  "skills/addSkill",
  async (skill: TSkillData) => addSkill(skill),
);

/** ASYNC THUNK: ПОЛУЧЕНИЕ НАВЫКА ПО ID */
export const fetchSkillById = createAsyncThunk(
  "skills/getSkillById",
  async (skillId: TId) => getSkillById(skillId),
);

/** ASYNC THUNK: УДАЛЕНИЕ НАВЫКА */
export const removeSkill = createAsyncThunk(
  "skills/deleteSkill",
  async (skillId: TId) => {
    await deleteSkillById(skillId);
    return skillId; // возврат id для extraReducers
  },
);

/** ASYNC THUNK: МОДИФИКАЦИЯ НАВЫКА */
export const changeSkill = createAsyncThunk(
  "skills/modifySkill",
  async (skill: TModifySkillData) => {
    const modifiedSkill = await modifySkill(skill);
    return modifiedSkill;
  },
);
