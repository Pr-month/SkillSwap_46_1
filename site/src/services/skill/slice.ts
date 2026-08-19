import {
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { ISkill, TId } from "../../utils/types";
import {
  appendSkill,
  changeSkill,
  fetchSkillById,
  fetchSkills,
  removeSkill,
} from "./actions";

export interface ISkillsState {
  loading: boolean;
  data: ISkill[];
  addedSkill: ISkill | null;
  error: string | null;
}

const initialState: ISkillsState = {
  loading: false,
  data: [],
  addedSkill: null,
  error: null,
};

export const skillSlice = createSlice({
  name: "skills",
  initialState,
  reducers: {
    removeSkillFromStore: (state, action: PayloadAction<TId>) => {
      const skillId = action.payload;
      state.data = state.data.filter((skill) => skill.id !== skillId);
    },
  },
  extraReducers: (builder) => {
    builder
      //* ПОЛУЧЕНИЕ НАВЫКОВ
      .addCase(fetchSkills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSkills.fulfilled, (state, action) => {
        state.loading = false;

        const newSkills = action.payload.data;
        const existingIds = new Set(state.data.map((s) => s.id));

        const skillsToAdd = newSkills.filter((s) => !existingIds.has(s.id));

        const updatedData = state.data.map((existing) => {
          const updated = newSkills.find((s) => s.id === existing.id);
          return updated || existing;
        });

        state.data = [...updatedData, ...skillsToAdd];
        state.error = null;
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.code || "Ошибка получения навыков";
        console.error(state.error);
      })

      //* ПОЛУЧЕНИЕ НАВЫКА ПО ID
      .addCase(fetchSkillById.pending, (state) => {
        state.loading = true;
        state.addedSkill = null;
        state.error = null;
      })
      .addCase(fetchSkillById.fulfilled, (state, action) => {
        state.loading = false;
        state.addedSkill = action.payload.data;

        const newSkill = action.payload.data;
        const existingIndex = state.data.findIndex((s) => s.id === newSkill.id);
        if (existingIndex !== -1) {
          state.data[existingIndex] = newSkill;
        } else {
          state.data.push(newSkill);
        }

        state.error = null;
      })
      .addCase(fetchSkillById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.code || "Ошибка получения навыка по его id";
        console.error(state.error);
      })

      //* ДОБАВЛЕНИЕ НАВЫКА
      .addCase(appendSkill.pending, (state) => {
        state.loading = true;
        state.addedSkill = null;
        state.error = null;
      })
      .addCase(appendSkill.fulfilled, (state, action) => {
        state.loading = false;
        state.addedSkill = action.payload.data;
        const newSkill = state.addedSkill;
        const exists = state.data.some((s) => s.id === newSkill?.id);
        if (!exists && newSkill) {
          state.data = [...state.data, newSkill];
        }
        state.error = null;
      })
      .addCase(appendSkill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.code || "Ошибка создания навыка";
        console.error(state.error);
      })

      //* МОДИФИКАЦИЯ НАВЫКА
      .addCase(changeSkill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeSkill.fulfilled, (state, action) => {
        state.loading = false;
        const updatedSkill = action.payload.data;
        state.data = state.data.map((skill) =>
          skill.id === updatedSkill.id ? updatedSkill : skill,
        );
        state.error = null;
      })
      .addCase(changeSkill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.code || "Ошибка изменения навыка";
        console.error(state.error);
      })

      //* УДАЛЕНИЕ НАВЫКА
      .addCase(removeSkill.pending, (state) => {
        state.loading = true;
        state.addedSkill = null;
        state.error = null;
      })
      .addCase(removeSkill.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((skill) => skill.id !== action.payload);
        state.error = null;
      })
      .addCase(removeSkill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.code || "Ошибка удаления навыка";
        console.error(state.error);
      });
  },
  selectors: {
    selectLoading: (state: ISkillsState) => state.loading,
    selectAllSkills: (state: ISkillsState) => state.data,
  },
});

export const { selectLoading, selectAllSkills } = skillSlice.selectors;

export const selectUserSkills = createSelector(
  [selectAllSkills, (_, userId: TId | undefined) => userId],
  (skills, userId) => {
    if (!skills || !userId) return null;
    return skills.filter((skill) => skill.userId === userId);
  },
);

export const { removeSkillFromStore } = skillSlice.actions;

export default skillSlice.reducer;
