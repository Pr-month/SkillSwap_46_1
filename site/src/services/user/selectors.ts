import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store.ts";

export const selectUsers = (state: RootState) => state.user.list;
export const selectSelectedUser = (state: RootState) => state.user.selectedUser;
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectUserError = (state: RootState) => state.user.error;
export const selectUserPage = (state: RootState) => state.user.page;
export const selectUserTotalPages = (state: RootState) => state.user.totalPages;
export const selectUserHasMore = (state: RootState) => state.user.hasMore;

export const selectPopularUsers = createSelector(selectUsers, (users) => {
  const likesCount = users
    .flatMap((u) => u.likesSkillsIds)
    .reduce<Record<string, number>>((acc, skillId) => {
      acc[skillId] = (acc[skillId] ?? 0) + 1;
      return acc;
    }, {});
  return [...users]
    .sort(
      (a, b) => (likesCount[b.userSkill] ?? 0) - (likesCount[a.userSkill] ?? 0),
    )
    .slice(0, 9);
});

export const selectNewestUsers = createSelector(selectUsers, (users) => {
  const now = new Date();
  const oneMonthAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate(),
  );

  return users.filter((user) => new Date(user.createdAt) >= oneMonthAgo); // Только за последний месяц
});

export const selectRecommendedUsers = createSelector(
  selectUsers,
  (state: RootState) => state.auth.currentUser,
  (state: RootState) => state.skills.data,
  (users, currentUser, skills) => {
    const getRandomUsers = (items: typeof users) =>
      [...items].sort(() => Math.random() - 0.5).slice(0, 9);

    if (!currentUser) {
      return getRandomUsers(users);
    }

    const usersWithoutCurrent = users.filter(
      (user) => String(user.id) !== String(currentUser.id),
    );

    const interestedIds = currentUser.interestedSkillsSubcategoriesIds ?? [];

    if (interestedIds.length === 0) {
      return getRandomUsers(usersWithoutCurrent);
    }

    const recommended = usersWithoutCurrent.filter((user) => {
      const skill = skills.find((s) => s.id === user.userSkill);
      return skill && interestedIds.includes(skill.skillSubcategory);
    });

    return getRandomUsers(recommended);
  },
);

export const selectSimilarUsers = createSelector(
  selectUsers,
  selectSelectedUser,
  (state: RootState) => state.skills.data,
  (users, selectUsers, skills) => {
    if (!selectUsers) return [];

    // ищем подкатегорию навыка выбранного пользователя1
    const userSkill = skills.find((s) => s.id === selectUsers.userSkill);
    if (!userSkill) return [];

    // ищем пользователей с навыком в той же подкатегории исключая выбранного пользователя
    return users.filter((user) => {
      if (user.id === selectUsers.id) return false;
      const skill = skills.find((s) => s.id === user.userSkill);
      return skill?.skillSubcategory === userSkill.skillSubcategory;
    });
  },
);
